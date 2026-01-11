import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabase } from "@/lib/supabase/server";
import { getStageName } from "@/lib/garden";

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

export default async function StatsPage() {
  const supabase = createServerSupabase();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, streak_count")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding");
  }

  const { data: actions } = await supabase
    .from("actions")
    .select("mood_score, created_at")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

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

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Progress</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Your garden stats</h1>
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
                  <div
                    className="w-6 rounded-full bg-moss/70"
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
                    {lastSeven[index].toLocaleDateString(undefined, { weekday: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-ink/70">Mood scores show up only on Mood Check days.</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Current stage</p>
            <p className="mt-3 font-[var(--font-fraunces)] text-3xl">{getStageName(profile.streak_count ?? 0)}</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Streak</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{profile.streak_count ?? 0} days</p>
            <p className="mt-2 text-sm text-ink/70">Keep going to reach the next growth stage.</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Garden type</p>
            <p className="mt-3 text-2xl font-semibold text-ink">{profile.current_seed_type}</p>
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
