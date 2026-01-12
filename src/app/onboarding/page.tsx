import Link from "next/link";
import { redirect } from "next/navigation";
import { completeOnboarding } from "@/app/onboarding/actions";
import { seedOptions } from "@/lib/garden";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";
import SignOutButton from "@/components/sign-out-button";
import TimezoneField from "@/app/onboarding/timezone-field";

export default async function OnboardingPage() {
  const supabase = createServerSupabaseReadOnly();
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
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Onboarding</p>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full w-full rounded-full bg-moss" />
            </div>
          </div>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Plant your first seed</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/onboarding/welcome"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50 transition hover:text-ink"
          >
            Back to welcome
          </Link>
          <SignOutButton />
        </div>
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
          <TimezoneField />
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
