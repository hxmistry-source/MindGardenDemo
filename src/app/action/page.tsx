import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { getDailyAction, getTodayRange } from "@/lib/garden";
import { createServerSupabase } from "@/lib/supabase/server";
import { submitDailyAction } from "@/app/action/actions";

export default async function ActionPage({
  searchParams,
}: {
  searchParams: { done?: string };
}) {
  const supabase = createServerSupabase();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding");
  }

  const todayAction = getDailyAction(new Date());
  const { start, end } = getTodayRange();

  const { data: todayEntries } = await supabase
    .from("actions")
    .select("id")
    .eq("user_id", sessionData.session.user.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const alreadyDone = (todayEntries?.length ?? 0) > 0 || searchParams.done === "1";

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Daily Action</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">{todayAction.label}</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ink/50">Prompt</p>
          <p className="mt-3 text-lg text-ink">{todayAction.prompt}</p>

          {alreadyDone ? (
            <div className="mt-6 rounded-2xl bg-moss/10 p-4 text-sm text-ink/70">
              You already completed today&apos;s action. Your garden will be ready again tomorrow.
            </div>
          ) : (
            <form action={submitDailyAction} className="mt-6 flex flex-col gap-4">
              <input type="hidden" name="actionType" value={todayAction.type} />
              {todayAction.type === "mood" ? (
                <label className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-ink/70">Mood today (1-5)</span>
                  <input
                    type="range"
                    name="moodScore"
                    min={1}
                    max={5}
                    defaultValue={3}
                    className="w-full accent-moss"
                  />
                </label>
              ) : null}

              {todayAction.type === "gratitude" || todayAction.type === "reflection" ? (
                <label className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-ink/70">Write a short note</span>
                  <textarea
                    name="textInput"
                    rows={4}
                    className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm"
                    placeholder="Just a sentence is enough."
                    required
                  />
                </label>
              ) : null}

              {todayAction.type === "breath" ? (
                <div className="rounded-2xl bg-blossom p-4 text-sm text-ink/70">
                  Inhale for 4 seconds, hold for 4, exhale for 6. Repeat three times, then tap complete.
                </div>
              ) : null}

              <button
                type="submit"
                className="w-fit rounded-full bg-moss px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
              >
                Complete action
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Growth reminder</p>
            <p className="mt-3 text-sm text-ink/70">
              Each action grows your {profile.current_seed_type.toLowerCase()} garden. Keep your streak alive to reach the
              next stage.
            </p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Streak policy</p>
            <p className="mt-3 text-sm text-ink/70">
              Miss a day and your streak resets. No pressure, just gentle momentum.
            </p>
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
