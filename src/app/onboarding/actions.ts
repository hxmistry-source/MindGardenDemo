"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const seedType = String(formData.get("seedType") ?? "");
  const reminderTime = String(formData.get("reminderTime") ?? "");

  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/");
  }

  const { error } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email,
    reminder_time: reminderTime,
    current_seed_type: seedType,
    current_stage: 0,
    streak_count: 0,
    last_action_date: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/home");
}
