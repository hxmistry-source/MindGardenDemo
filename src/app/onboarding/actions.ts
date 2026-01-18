"use server";

import { redirect } from "next/navigation";
import { getSeedVariant, seedOptions, type SeedType } from "@/lib/garden";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";

function generateFriendCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  return code;
}

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
  const friendCode = generateFriendCode();

  const { error } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email,
    reminder_time: reminderTime,
    timezone,
    current_seed_type: normalizedSeed,
    seed_variant: seedVariant?.id ?? null,
    friend_code: friendCode,
    current_stage: 0,
    streak_count: 0,
    last_action_date: null,
    grace_used_at: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("user_garden").upsert({
    user_id: data.user.id,
    xp_total: 0,
    garden_level: 1,
    water: 0,
    sunlight: 0,
    soil: 0,
    bloom: 0,
    background_id: "dawn-haze",
    decor_ids: [],
    plant_skin: "classic",
    preferred_categories: [normalizedSeed ?? "Calm"],
  });

  redirect("/home");
}
