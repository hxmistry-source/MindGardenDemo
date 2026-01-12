"use server";

import { redirect } from "next/navigation";
import { getStageIndex } from "@/lib/garden";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";

function isSameDay(date: Date, compare: Date) {
  return (
    date.getFullYear() === compare.getFullYear() &&
    date.getMonth() === compare.getMonth() &&
    date.getDate() === compare.getDate()
  );
}

function isWithinDays(date: Date, compare: Date, days: number) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(compare);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - start.getTime();
  return diff >= 0 && diff <= days * 86400000;
}

function getCombinedTextInput(formData: FormData) {
  const directInput = formData.get("textInput");
  if (directInput) {
    return String(directInput);
  }

  const reframeStress = formData.get("reframeStress") ? String(formData.get("reframeStress")) : "";
  const reframeShift = formData.get("reframeShift") ? String(formData.get("reframeShift")) : "";
  if (reframeStress || reframeShift) {
    return `Stress: ${reframeStress}\nReframe: ${reframeShift}`.trim();
  }

  const scanFields = ["bodyScan1", "bodyScan2", "bodyScan3"]
    .map((field) => formData.get(field))
    .filter(Boolean)
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
  if (scanFields.length > 0) {
    return `Sensations: ${scanFields.join(", ")}`;
  }

  return null;
}

export async function submitDailyAction(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_action_date, grace_used_at")
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

  const dayBeforeYesterday = new Date();
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

  const graceUsedAt = profile?.grace_used_at ? new Date(profile.grace_used_at) : null;
  const graceAvailable = !graceUsedAt || !isWithinDays(graceUsedAt, now, 6);
  const canUseGrace = lastDate ? isSameDay(lastDate, dayBeforeYesterday) && graceAvailable : false;

  let newStreak = 1;
  let newGraceUsedAt: string | null = graceUsedAt ? graceUsedAt.toISOString() : null;

  if (isYesterday) {
    newStreak = (profile?.streak_count ?? 0) + 1;
  } else if (canUseGrace) {
    newStreak = (profile?.streak_count ?? 0) + 1;
    newGraceUsedAt = now.toISOString();
  } else {
    newGraceUsedAt = null;
  }

  const actionType = String(formData.get("actionType") ?? "");
  const moodScore = formData.get("moodScore") ? Number(formData.get("moodScore")) : null;
  const textInput = getCombinedTextInput(formData);
  const actionVariant = formData.get("actionVariant") ? String(formData.get("actionVariant")) : null;

  const { error: insertError } = await supabase.from("actions").insert({
    user_id: sessionData.session.user.id,
    action_type: actionType,
    mood_score: moodScore,
    text_input: textInput,
    action_variant: actionVariant,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      streak_count: newStreak,
      last_action_date: now.toISOString(),
      current_stage: getStageIndex(newStreak),
      grace_used_at: newGraceUsedAt,
    })
    .eq("id", sessionData.session.user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  redirect("/action?done=1");
}
