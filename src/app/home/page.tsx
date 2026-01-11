import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDailyAction, getStageName } from "@/lib/garden";

export default async function HomePage() {
  const supabase = createServerSupabase();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, streak_count, last_action_date, reminder_time")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding");
  }

  const { count } = await supabase
    .from("actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", sessionData.session.user.id);

  const stageName = getStageName(profile.streak_count ?? 0);
  const todayAction = getDailyAction(new Date());

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">{profile.current_seed_type} seed</p>
              <h2 className="font-[var(--font-fraunces)] text-3xl">{stageName} stage</h2>
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
