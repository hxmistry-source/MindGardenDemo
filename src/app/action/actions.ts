"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

function isSameDay(date: Date, compare: Date) {
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

export async function submitDailyAction(formData: FormData) {
  const supabase = createServerSupabase();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_action_date")
    .eq("id", sessionData.session.user.id)
    .single();

  const now = new Date();
  const lastDate = profile?.last_action_date ? new Date(profile.last_action_date) : null;

  if (lastDate && isSameDay(lastDate, now)) {
    redirect("/action?done=1");
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = lastDate ? isSameDay(lastDate, yesterday) : false;

  const newStreak = isYesterday ? (profile?.streak_count ?? 0) + 1 : 1;

  const actionType = String(formData.get("actionType") ?? "");
  const moodScore = formData.get("moodScore") ? Number(formData.get("moodScore")) : null;
  const textInput = formData.get("textInput") ? String(formData.get("textInput")) : null;

  const { error: insertError } = await supabase.from("actions").insert({
    user_id: sessionData.session.user.id,
    action_type: actionType,
    mood_score: moodScore,
    text_input: textInput,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      streak_count: newStreak,
      last_action_date: now.toISOString(),
      current_stage: newStreak,
    })
    .eq("id", sessionData.session.user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  redirect("/action?done=1");
}
