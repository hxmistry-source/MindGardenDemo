import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import {
  getActionLabel,
  getNextStageInfo,
  getPersonalizedAction,
  getSeedVariant,
  getStageName,
  stageThresholds,
} from "@/lib/garden";

export default async function HomePage() {
  const supabase = createServerSupabaseReadOnly();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, streak_count, last_action_date, reminder_time, grace_used_at, seed_variant")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding/welcome");
  }

  const { count } = await supabase
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", sessionData.session.user.id);

  const { data: lastMoodEntry } = await supabase
    .from("actions")
    .select("mood_score")
    .eq("user_id", sessionData.session.user.id)
    .not("mood_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recentActions } = await supabase
    .from("actions")
    .select("action_type, created_at")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false })
    .limit(7);

  const stageName = getStageName(profile.streak_count ?? 0);
  const nextStage = getNextStageInfo(profile.streak_count ?? 0);
  const todayAction = getPersonalizedAction(
    new Date(),
    profile.current_seed_type,
    lastMoodEntry?.mood_score ?? null,
  );
  const seedVariant = getSeedVariant(profile.current_seed_type, profile.seed_variant);
  const graceUsedAt = profile.grace_used_at ? new Date(profile.grace_used_at) : null;

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Garden Home</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Welcome back, gardener.</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">{profile.current_seed_type} seed</p>
              <h2 className="font-[var(--font-fraunces)] text-3xl">{stageName} stage</h2>
              <p className="mt-2 text-sm text-ink/60">
                Variant: <span className="font-semibold text-ink">{seedVariant.label}</span> ({seedVariant.palette})
              </p>
            </div>
            <div className="rounded-full bg-moss/10 px-4 py-2 text-sm font-semibold text-moss">
              Streak {profile.streak_count ?? 0} days
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Total actions</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{count ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Reminder</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{profile.reminder_time ?? "—"}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Last action</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {profile.last_action_date ? new Date(profile.last_action_date).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-ink/10 bg-white/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Growth timeline</p>
                <p className="mt-2 text-sm text-ink/70">
                  {nextStage
                    ? `Next stage in ${nextStage.daysRemaining} day${nextStage.daysRemaining === 1 ? "" : "s"}.`
                    : "You reached full growth."}
                </p>
              </div>
              <div className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink/60">
                {graceUsedAt ? `Grace used ${graceUsedAt.toLocaleDateString()}` : "Grace day available"}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {stageThresholds.map((stage) => {
                const reached = (profile.streak_count ?? 0) >= stage.days;
                return (
                  <div
                    key={stage.stage}
                    className={`rounded-2xl border px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] ${
                      reached ? "border-moss/60 bg-moss/10 text-moss" : "border-ink/10 bg-white text-ink/40"
                    }`}
                  >
                    {stage.stage}
                    <div className="mt-1 text-[10px] font-medium normal-case tracking-normal text-ink/40">
                      {stage.days}d
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-blossom p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">Encouragement</p>
            <p className="mt-2 text-lg text-ink">
              You&apos;re nurturing a {profile.current_seed_type.toLowerCase()} garden. Keep going for
              your next stage: {stageName === "Tree" ? "You made it!" : "a bigger bloom"}.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">Today&apos;s action</p>
            <h3 className="mt-2 font-[var(--font-fraunces)] text-2xl">{todayAction.label}</h3>
            <p className="mt-3 text-sm text-ink/70">{todayAction.prompt}</p>
            <div className="mt-6">
              <a
                href="/action"
                className="inline-flex rounded-full bg-moss px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
              >
                Do today&apos;s action
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">Last 7 actions</p>
            <div className="mt-4 grid gap-3">
              {(recentActions ?? []).length === 0 ? (
                <p className="text-sm text-ink/60">Your last actions will show up here.</p>
              ) : (
                recentActions?.map((action) => (
                  <div key={`${action.created_at}-${action.action_type}`} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{getActionLabel(action.action_type)}</span>
                    <span className="text-xs text-ink/50">
                      {action.created_at ? new Date(action.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">Core loop</p>
            <ol className="mt-3 space-y-2 text-sm text-ink/70">
              <li>1. Open MindGarden</li>
              <li>2. Complete a 1-minute action</li>
              <li>3. Watch your plant grow</li>
              <li>4. Return tomorrow</li>
            </ol>
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
