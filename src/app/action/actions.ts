"use server";

import { redirect } from "next/navigation";
import { getLevelFromXp, getStageIndex, getXpForAction, nutrientByCategory } from "@/lib/garden";
import { getZonedDateKey, getZonedDayDiff, getTodayRange } from "@/lib/dates";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

export async function submitGardenAction(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const actionKind = String(formData.get("actionKind") ?? "core");
  const actionType = String(formData.get("actionType") ?? "");
  const actionCategory = String(formData.get("actionCategory") ?? "");
  const moodScore = formData.get("moodScore") ? Number(formData.get("moodScore")) : null;
  const textInput = getCombinedTextInput(formData);
  const actionVariant = formData.get("actionVariant") ? String(formData.get("actionVariant")) : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_action_date, grace_used_at, timezone")
    .eq("id", sessionData.session.user.id)
    .single();

  const now = new Date();
  const timeZone = profile?.timezone || "UTC";
  const todayKey = getZonedDateKey(now, timeZone);
  const yesterdayKey = getZonedDateKey(addDays(now, -1), timeZone);
  const dayBeforeYesterdayKey = getZonedDateKey(addDays(now, -2), timeZone);
  const lastDateKey = profile?.last_action_date ?? null;

  const { start, end } = getTodayRange(timeZone);
  const { data: todayEntries } = await supabase
    .from("user_actions")
    .select("id, action_kind")
    .eq("user_id", sessionData.session.user.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const coreCount = todayEntries?.filter((entry) => entry.action_kind === "core").length ?? 0;
  const bonusCount = todayEntries?.filter((entry) => entry.action_kind === "bonus").length ?? 0;

  if (actionKind === "core" && coreCount > 0) {
    redirect("/action?done=1");
  }
  if (actionKind === "bonus" && bonusCount >= 2) {
    redirect("/action?done=1");
  }

  const { error: insertError } = await supabase.from("user_actions").insert({
    user_id: sessionData.session.user.id,
    action_type: actionType,
    action_kind: actionKind,
    category: actionCategory,
    mood_score: moodScore,
    text_input: textInput,
    action_variant: actionVariant,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  if (actionKind === "core") {
    if (lastDateKey && lastDateKey === todayKey) {
      redirect("/action?done=1");
    }

    const isYesterday = lastDateKey === yesterdayKey;

    const graceUsedAt = profile?.grace_used_at ? new Date(profile.grace_used_at) : null;
    const graceDayDiff = graceUsedAt ? getZonedDayDiff(graceUsedAt, now, timeZone) : null;
    const graceAvailable = graceDayDiff === null ? true : graceDayDiff > 6;
    const canUseGrace = lastDateKey ? lastDateKey === dayBeforeYesterdayKey && graceAvailable : false;

    let newStreak = 1;
    let newGraceUsedAt: string | null = graceUsedAt ? graceUsedAt.toISOString() : null;

    if (isYesterday) {
      newStreak = (profile?.streak_count ?? 0) + 1;
    } else if (canUseGrace) {
      newStreak = (profile?.streak_count ?? 0) + 1;
      newGraceUsedAt = now.toISOString();
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        streak_count: newStreak,
        last_action_date: todayKey,
        current_stage: getStageIndex(newStreak),
        grace_used_at: newGraceUsedAt,
      })
      .eq("id", sessionData.session.user.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
  }

  const { data: garden } = await supabase
    .from("user_garden")
    .select("xp_total, garden_level, water, sunlight, soil, bloom")
    .eq("user_id", sessionData.session.user.id)
    .single();

  if (!garden) {
    await supabase.from("user_garden").upsert({
      user_id: sessionData.session.user.id,
      xp_total: 0,
      garden_level: 1,
      water: 0,
      sunlight: 0,
      soil: 0,
      bloom: 0,
      background_id: "dawn-haze",
      decor_ids: [],
      plant_skin: "classic",
      preferred_categories: [],
    });
  }

  const currentXp = garden?.xp_total ?? 0;
  const nextXp = currentXp + getXpForAction(actionKind === "core" ? "core" : "bonus");
  const nextLevel = getLevelFromXp(nextXp);
  const nutrientKey = nutrientByCategory[actionCategory as keyof typeof nutrientByCategory];

  const { error: gardenError } = await supabase
    .from("user_garden")
    .update({
      xp_total: nextXp,
      garden_level: Math.max(garden?.garden_level ?? 1, nextLevel),
      water: nutrientKey === "water" ? (garden?.water ?? 0) + 1 : garden?.water ?? 0,
      sunlight: nutrientKey === "sunlight" ? (garden?.sunlight ?? 0) + 1 : garden?.sunlight ?? 0,
      soil: nutrientKey === "soil" ? (garden?.soil ?? 0) + 1 : garden?.soil ?? 0,
      bloom: nutrientKey === "bloom" ? (garden?.bloom ?? 0) + 1 : garden?.bloom ?? 0,
    })
    .eq("user_id", sessionData.session.user.id);

  if (gardenError) {
    throw new Error(gardenError.message);
  }

  if (actionKind === "core") {
    redirect("/action?done=1");
  }

  redirect("/action?bonus=1");
}

export async function useDailySwap() {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", sessionData.session.user.id)
    .single();

  const timeZone = profile?.timezone || "UTC";
  const todayKey = getZonedDateKey(new Date(), timeZone);

  await supabase
    .from("user_garden")
    .update({ last_swap_date: todayKey })
    .eq("user_id", sessionData.session.user.id);

  redirect("/action?swap=1");
}
