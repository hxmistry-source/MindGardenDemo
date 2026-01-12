import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/sign-out-button";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";

export default async function OnboardingWelcomePage() {
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
      <header className="flex items-center justify-between">
        <div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Onboarding</p>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full w-1/2 rounded-full bg-moss" />
            </div>
          </div>
          <h1 className="font-[var(--font-fraunces)] text-4xl">Welcome to MindGarden</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-8 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
        <div>
          <h2 className="text-lg font-semibold text-ink">Grow emotional resilience in 1-2 minutes a day.</h2>
          <p className="mt-3 text-sm text-ink/70">
            You&apos;ll complete tiny, meaningful actions that help your garden flourish. Start with a seed that matches
            your mood, set a gentle reminder, and watch your progress grow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {["Pick a calming seed", "Set a daily reminder", "Enter your garden"].map((step, index) => (
            <div key={step} className="rounded-2xl border border-ink/10 bg-white/90 p-4 text-sm text-ink/70">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Step {index + 1}</p>
              <p className="mt-2 text-base font-semibold text-ink">{step}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/onboarding"
            className="w-fit rounded-full bg-moss px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
          >
            Continue
          </Link>
          <p className="text-sm text-ink/60">Next: choose your seed and reminder time.</p>
        </div>
      </div>
    </section>
  );
}
