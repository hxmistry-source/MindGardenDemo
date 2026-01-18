import { redirect } from "next/navigation";
import TopNav from "@/components/top-nav";
import SignOutButton from "@/components/sign-out-button";
import { actionCatalog, getPersonalizedAction, getSeedVariant, personalizeAction } from "@/lib/garden";
import { formatZonedDateKey, getTodayRange, getZonedDateKey } from "@/lib/dates";
import { createServerSupabaseWithCookies } from "@/lib/supabase/server";
import { useDailySwap } from "@/app/action/actions";
import BonusActions from "@/app/action/bonus-actions";
import CoreActionForm from "@/app/action/core-action-form";

export default async function ActionPage({
  searchParams,
}: {
  searchParams: { done?: string; swap?: string; bonus?: string };
}) {
  const supabase = createServerSupabaseWithCookies();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_seed_type, grace_used_at, seed_variant, timezone, streak_count, last_action_date")
    .eq("id", sessionData.session.user.id)
    .single();

  if (!profile?.current_seed_type) {
    redirect("/onboarding/welcome");
  }

  const { data: lastMoodEntry } = await supabase
    .from("user_actions")
    .select("mood_score")
    .eq("user_id", sessionData.session.user.id)
    .not("mood_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const timeZone = profile.timezone || "UTC";
  const { start, end } = getTodayRange(timeZone);

  const { data: todayEntries } = await supabase
    .from("user_actions")
    .select("id, action_kind, action_type, category")
    .eq("user_id", sessionData.session.user.id)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const coreCount = todayEntries?.filter((entry) => entry.action_kind === "core").length ?? 0;
  const bonusCount = todayEntries?.filter((entry) => entry.action_kind === "bonus").length ?? 0;
  const alreadyDone = coreCount > 0 || searchParams.done === "1";
  const seedVariant = getSeedVariant(profile.current_seed_type, profile.seed_variant);
  const graceUsedAt = profile.grace_used_at ? new Date(profile.grace_used_at) : null;
  const graceUsedLabel = graceUsedAt ? graceUsedAt.toLocaleDateString() : null;
  const lastActionLabel = profile.last_action_date
    ? formatZonedDateKey(profile.last_action_date, timeZone)
    : "—";

  const { data: garden } = await supabase
    .from("user_garden")
    .select(
      "preferred_categories, last_swap_date, daily_core_action_type, daily_core_action_variant, daily_core_action_date, daily_bonus_action_types, daily_bonus_action_date",
    )
    .eq("user_id", sessionData.session.user.id)
    .single();

  let gardenData = garden;
  if (!gardenData) {
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
      last_swap_date: null,
      daily_core_action_type: null,
      daily_core_action_variant: null,
      daily_core_action_date: null,
      daily_bonus_action_types: [],
      daily_bonus_action_date: null,
    });
    gardenData = {
      preferred_categories: [],
      last_swap_date: null,
      daily_core_action_type: null,
      daily_core_action_variant: null,
      daily_core_action_date: null,
      daily_bonus_action_types: [],
      daily_bonus_action_date: null,
    };
  }

  const { data: recentActions } = await supabase
    .from("user_actions")
    .select("action_type")
    .eq("user_id", sessionData.session.user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const historyCounts = (recentActions ?? []).reduce<Record<string, number>>((acc, action) => {
    acc[action.action_type] = (acc[action.action_type] ?? 0) + 1;
    return acc;
  }, {});

  const baseAction = getPersonalizedAction(
    new Date(),
    profile.current_seed_type,
    lastMoodEntry?.mood_score ?? null,
    historyCounts,
    gardenData?.preferred_categories ?? null,
  );

  const todayKey = getZonedDateKey(new Date(), timeZone);
  const swapUsedToday = gardenData?.last_swap_date === todayKey;
  const useSwap = searchParams.swap === "1" && !swapUsedToday;
  let selectedCore = baseAction;
  if (gardenData?.daily_core_action_type && gardenData?.daily_core_action_date === todayKey && !useSwap) {
    const stored = actionCatalog.find((action) => action.type === gardenData.daily_core_action_type);
    if (stored) {
      selectedCore = personalizeAction(stored, profile.current_seed_type, lastMoodEntry?.mood_score ?? null);
    }
  }

  if (useSwap) {
    selectedCore = getPersonalizedAction(
      new Date(),
      profile.current_seed_type,
      lastMoodEntry?.mood_score ?? null,
      historyCounts,
      garden?.preferred_categories ?? null,
      [selectedCore.type],
    );
  }

  if (gardenData?.daily_core_action_type !== selectedCore.type || gardenData?.daily_core_action_date !== todayKey) {
    await supabase
      .from("user_garden")
      .update({
        daily_core_action_type: selectedCore.type,
        daily_core_action_variant: selectedCore.actionVariant,
        daily_core_action_date: todayKey,
      })
      .eq("user_id", sessionData.session.user.id);
  }

  let bonusCandidates = actionCatalog.filter(
    (action) =>
      ![
        "gratitude",
        "gratitude_note",
        "reflection",
        "goal",
        "future_self",
        "kindness",
        "reframe",
        "body_scan",
      ].includes(action.type) && action.type !== selectedCore.type,
  );
  if (gardenData?.daily_bonus_action_types && gardenData?.daily_bonus_action_date === todayKey) {
    const storedBonus = gardenData.daily_bonus_action_types
      .map((type) => actionCatalog.find((action) => action.type === type))
      .filter((action): action is (typeof actionCatalog)[number] => Boolean(action));
    if (storedBonus.length > 0) {
      bonusCandidates = storedBonus;
    }
  } else {
    const bonusTypes = bonusCandidates.slice(0, 3).map((action) => action.type);
    await supabase
      .from("user_garden")
      .update({
        daily_bonus_action_types: bonusTypes,
        daily_bonus_action_date: todayKey,
      })
      .eq("user_id", sessionData.session.user.id);
    bonusCandidates = bonusCandidates.slice(0, 3);
  }

  const todayAction = selectedCore;

  return (
    <section className="flex flex-1 flex-col gap-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Daily Action</p>
          <h1 className="font-[var(--font-fraunces)] text-4xl">{todayAction.label}</h1>
        </div>
        <SignOutButton />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-ink/50">Prompt</p>
          <p className="mt-3 text-lg text-ink">{todayAction.prompt}</p>

          {alreadyDone ? (
            <div className="mt-6 rounded-2xl bg-moss/10 p-4 text-sm text-ink/70">
              Core action complete. Bonus actions are still available today.
            </div>
          ) : (
            <CoreActionForm action={todayAction} todayKey={todayKey} />
          )}
          {!alreadyDone && !swapUsedToday ? (
            <form action={useDailySwap} className="mt-4" noValidate>
              <button
                type="submit"
                formNoValidate
                className="rounded-full border border-ink/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/60"
              >
                Swap today&apos;s action
              </button>
            </form>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Growth reminder</p>
            <p className="mt-3 text-sm text-ink/70">
              Each action grows your {profile.current_seed_type.toLowerCase()} garden. Your variant is{" "}
              <span className="font-semibold text-ink">{seedVariant.label}</span> with a {seedVariant.palette.toLowerCase()}{" "}
              palette.
            </p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Streak policy</p>
            <p className="mt-3 text-sm text-ink/70">
              You have one grace day per 7 days.{" "}
              {graceUsedLabel
                ? `Grace day used on ${graceUsedLabel}.`
                : "Grace day is available if you miss a day."}
            </p>
            <p className="mt-3 text-sm text-ink/60">Last core action: {lastActionLabel}</p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink/50">Bonus actions</p>
            <p className="mt-3 text-sm text-ink/70">
              Complete up to two bonus actions today. Bonus actions add XP and nutrients but don&apos;t affect streaks.
            </p>
            {bonusCount >= 2 ? (
              <p className="mt-4 text-sm text-ink/60">You&apos;ve reached today&apos;s bonus cap.</p>
            ) : (
              <BonusActions actions={bonusCandidates} />
            )}
          </div>
        </div>
      </div>

      <TopNav />
    </section>
  );
}
