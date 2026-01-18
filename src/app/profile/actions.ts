"use server";

import { redirect } from "next/navigation";
import { nutrientByCategory } from "@/lib/garden";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";

export async function updatePreferences(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const preferred = formData.getAll("preferredCategories").map((value) => String(value));

  await supabase
    .from("user_garden")
    .update({ preferred_categories: preferred })
    .eq("user_id", sessionData.session.user.id);

  redirect("/profile");
}

export async function updateCustomization(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const backgroundId = String(formData.get("backgroundId") ?? "dawn-haze");
  const plantSkin = String(formData.get("plantSkin") ?? "classic");
  const decorIds = formData.getAll("decorIds").map((value) => String(value));

  await supabase
    .from("user_garden")
    .update({ background_id: backgroundId, plant_skin: plantSkin, decor_ids: decorIds })
    .eq("user_id", sessionData.session.user.id);

  redirect("/profile");
}

export async function addFriend(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const code = String(formData.get("friendCode") ?? "").trim().toUpperCase();
  if (!code) {
    redirect("/profile");
  }

  const { data: friendProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("friend_code", code)
    .maybeSingle();

  if (!friendProfile?.id || friendProfile.id === sessionData.session.user.id) {
    redirect("/profile");
  }

  await supabase.from("friends").insert({
    user_id: sessionData.session.user.id,
    friend_id: friendProfile.id,
  });

  await supabase.from("friends").insert({
    user_id: friendProfile.id,
    friend_id: sessionData.session.user.id,
  });

  redirect("/profile");
}

export async function sendGesture(formData: FormData) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const friendId = String(formData.get("friendId") ?? "");
  const gestureType = String(formData.get("gestureType") ?? "");

  if (!friendId || !gestureType) {
    redirect("/profile");
  }

  await supabase.from("friend_gestures").insert({
    sender_id: sessionData.session.user.id,
    receiver_id: friendId,
    gesture_type: gestureType,
  });

  const nutrientKey = nutrientByCategory[
    gestureType === "sunshine"
      ? "Focus"
      : gestureType === "encouragement"
        ? "Resilience"
        : gestureType === "bloom"
          ? "Gratitude"
          : "Calm"
  ];

  await supabase.rpc("increment_friend_nutrient", {
    target_user_id: friendId,
    nutrient_key: nutrientKey,
  });

  redirect("/profile");
}
