import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/onboarding/actions";
import { seedOptions } from "@/lib/garden";
import { createServerSupabase } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";

export default async function OnboardingPage() {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type")
    .eq("id", data.session.user.id)
    .single();

  if (profile?.current_seed_type) {
    redirect("/home");
  }

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Onboarding</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Plant your first seed</h1>
        </div>
        <SignOutButton />
      </header>

      <form
        action={completeOnboarding}
        className="grid gap-8 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft"
      >
        <div>
          <h2 className="text-lg font-semibold text-ink">Choose your seed</h2>
          <p className="text-sm text-ink/70">This sets the tone for your daily micro actions.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {seedOptions.map((seed) => (
              <label
                key={seed}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-ink/10 bg-white/90 p-4 text-ink/80 transition hover:border-leaf/50"
              >
                <input type="radio" name="seedType" value={seed} className="h-4 w-4" required />
                <span className="text-base font-semibold">{seed}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ink">Set a reminder time</h2>
          <p className="text-sm text-ink/70">We&apos;ll nudge you gently once per day.</p>
          <input
            type="time"
            name="reminderTime"
            required
            className="mt-4 w-full max-w-xs rounded-xl border border-ink/10 bg-white px-4 py-3 text-base shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-fit rounded-full bg-moss px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
        >
          Enter my garden
        </button>
      </form>
    </section>
  );
}
