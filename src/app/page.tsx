import Link from "next/link";
import { redirect } from "next/navigation";
import SignInForm from "@/components/sign-in-form";
import { createServerSupabaseReadOnly } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createServerSupabaseReadOnly();
  const { data } = await supabase.auth.getSession();

  if (data.session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_seed_type")
      .eq("id", data.session.user.id)
      .single();

    if (profile?.current_seed_type) {
      redirect("/home");
    } else {
      redirect("/onboarding/welcome");
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">MindGarden</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl text-ink md:text-5xl">
            Grow emotional resilience in minutes a day.
          </h1>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
            1-2 minutes daily
          </span>
          <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
            Private + playful
          </span>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-6 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-soft">
          <p className="text-lg text-ink/70">
            MindGarden turns tiny emotional actions into a living, growing garden. Each day you complete a micro action,
            your plant levels up. Miss a day and the streak resets, but your garden never disappears.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              "Pick a seed aligned with your mood",
              "Complete a 60-second action",
              "Watch your garden flourish",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink/70">
                {item}
              </div>
            ))}
          </div>
          <Link
            href="#signin"
            className="w-fit rounded-full bg-moss px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
          >
            Start your garden
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/50 bg-blossom p-6 text-ink shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/60">Today&apos;s action</p>
            <p className="mt-2 font-[var(--font-fraunces)] text-2xl">Name one thing you appreciate.</p>
            <p className="mt-3 text-sm text-ink/70">
              Tiny reflections stack up. Your garden grows after every action.
            </p>
          </div>
          <div id="signin" className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <h2 className="font-[var(--font-fraunces)] text-2xl">Continue with your email</h2>
            <p className="mt-2 text-sm text-ink/70">We&apos;ll send a single magic link to start your garden.</p>
            <SignInForm />
          </div>
        </div>
      </div>
    </section>
  );
}
