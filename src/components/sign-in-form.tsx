"use client";

import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Check your email for a sign-in link.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex w-full flex-col gap-4 rounded-xl border border-white/70 bg-white/70 p-6 shadow-soft"
    >
      <label className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/60">
        Email
      </label>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@mindgarden.app"
        className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-base shadow-sm outline-none ring-leaf/40 focus:ring-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-moss px-4 py-3 text-base font-semibold text-white transition hover:bg-leaf disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Sending link..." : "Send me a sign-in link"}
      </button>
      {status ? <p className="text-sm text-ink/70">{status}</p> : null}
    </form>
  );
}
