import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import { getActionLabel } from "@/lib/garden";
import { getTodayRange } from "@/lib/dates";

function getLastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }
  return days;
}

export default async function InsightsPage() {
  const supabase = createServerSupabaseReadOnly();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, timezone")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding/welcome");
  }

  const { data: actions } = await supabase
    .from("user_actions")
    .select("mood_score, created_at, category, action_type, action_kind")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const lastSeven = getLastSevenDays();
  const moodByDay = lastSeven.map((day) => {
    const match = actions?.find((action) => {
      if (!action.created_at) return false;
      const actionDate = new Date(action.created_at);
      return (
        actionDate.getFullYear() === day.getFullYear() &&
        actionDate.getMonth() === day.getMonth() &&
        actionDate.getDate() === day.getDate()
      );
    });
    return match?.mood_score ?? null;
  });

  const categoryCounts = (actions ?? []).reduce<Record<string, number>>((acc, action) => {
    if (!action.category) return acc;
    acc[action.category] = (acc[action.category] ?? 0) + 1;
    return acc;
  }, {});

  const coreCount = actions?.filter((action) => action.action_kind === "core").length ?? 0;
  const bonusCount = actions?.filter((action) => action.action_kind === "bonus").length ?? 0;
  const consistency = new Set(
    (actions ?? []).map((action) => (action.created_at ? new Date(action.created_at).toDateString() : "")),
  ).size;

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Calm";
  const recommendation =
    topCategory === "Focus"
      ? "Try a Calm action tomorrow to give your mind a breather."
      : topCategory === "Resilience"
        ? "Consider a Gratitude action to soften your week."
        : "Pick a Focus action to build momentum.";

  const timeZone = profile.timezone || "UTC";
  const { start, end } = getTodayRange(timeZone);
  const { data: todayActions } = await supabase
    .from("user_actions")
    .select("action_type")
    .eq("user_id", sessionData.session.user.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Insights</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Weekly garden recap</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
          <h2 className="font-[var(--font-fraunces)] text-2xl">7-day mood trend</h2>
          <div className="mt-6 grid grid-cols-7 items-end gap-3">
            {moodByDay.map((score, index) => {
              const height = score ? score * 14 : 6;
              return (
                <div key={`${index}-${score}`} className="flex flex-col items-center gap-2">
                  <div className="w-6 rounded-full bg-moss/70" style={{ height: `${height}px` }} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    {lastSeven[index].toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink/70">Mood scores show up only on Mood Check actions.</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">This week</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {coreCount} core · {bonusCount} bonus
            </p>
            <p className="mt-2 text-sm text-ink/70">{consistency} active days this week.</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Top category</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{topCategory}</p>
            <p className="mt-2 text-sm text-ink/70">{recommendation}</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Today</p>
            <p className="mt-3 text-sm text-ink/70">
              {todayActions && todayActions.length > 0
                ? `You already completed ${getActionLabel(todayActions[0].action_type)}.`
                : "Your garden is ready for its next action."}
            </p>
            <p className="mt-3 text-xs text-ink/50">Optional AI recap coming soon.</p>
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
