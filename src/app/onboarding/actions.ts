"use server";

import { redirect } from "next/navigation";
import { getSeedVariant, seedOptions, type SeedType } from "@/lib/garden";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const seedType = String(formData.get("seedType") ?? "");
  const reminderTime = String(formData.get("reminderTime") ?? "");
  const timezone = String(formData.get("timezone") ?? "");

  const supabase = createServerSupabaseWithCookies();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  const normalizedSeed = seedOptions.includes(seedType as SeedType) ? (seedType as SeedType) : null;
  const seedVariant = normalizedSeed ? getSeedVariant(normalizedSeed) : null;

  const { error } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email,
    reminder_time: reminderTime,
    timezone,
    current_seed_type: normalizedSeed,
    seed_variant: seedVariant?.id ?? null,
    current_stage: 0,
    streak_count: 0,
    last_action_date: null,
    grace_used_at: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/home");
}
