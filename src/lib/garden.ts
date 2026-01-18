export type SeedType = "Calm" | "Focus" | "Resilience" | "Gratitude";
export type ActionType =
  | "mood"
  | "gratitude"
  | "breath"
  | "reflection"
  | "goal"
  | "kindness"
  | "body_scan"
  | "reframe"
  | "reset"
  | "focus_block"
  | "gratitude_note"
  | "micro_break"
  | "release"
  | "affirmation"
  | "mindful_walk"
  | "self_compassion"
  | "clear_space"
  | "connection"
  | "future_self"
  | "savor";

export type ActionCategory = "Calm" | "Focus" | "Resilience" | "Gratitude" | "Mood";
export type ActionKind = "core" | "bonus";

export type SeedVariant = {
  id: string;
  label: string;
  description: string;
  palette: string;
};

export type ActionDefinition = {
  type: ActionType;
  label: string;
  prompt: string;
  category: ActionCategory;
};

export const seedOptions: SeedType[] = ["Calm", "Focus", "Resilience", "Gratitude"];

export const actionCatalog: ActionDefinition[] = [
  { type: "mood", label: "Mood Check", prompt: "Where is your mood today?", category: "Mood" },
  { type: "gratitude", label: "Gratitude", prompt: "Name one thing you appreciate.", category: "Gratitude" },
  { type: "breath", label: "Calm Breath", prompt: "Take three slow breaths.", category: "Calm" },
  { type: "reflection", label: "Stress Reflection", prompt: "What is one thing you can release?", category: "Resilience" },
  { type: "goal", label: "Micro Goal", prompt: "Set one tiny goal for today.", category: "Focus" },
  { type: "kindness", label: "Kindness Ping", prompt: "Name one kind action you can do today.", category: "Gratitude" },
  { type: "body_scan", label: "Body Scan", prompt: "Notice three sensations in your body.", category: "Calm" },
  { type: "reframe", label: "Positive Reframe", prompt: "Rewrite a stressful thought into a gentler one.", category: "Resilience" },
  { type: "reset", label: "60-Second Reset", prompt: "Close your eyes and relax your shoulders.", category: "Calm" },
  { type: "focus_block", label: "Focus Block", prompt: "Choose one task and set a 10-minute timer.", category: "Focus" },
  { type: "gratitude_note", label: "Gratitude Note", prompt: "Write a single sentence of thanks.", category: "Gratitude" },
  { type: "micro_break", label: "Micro Break", prompt: "Step away from your screen for one minute.", category: "Calm" },
  { type: "release", label: "Let It Go", prompt: "Name one thing you can let slide today.", category: "Resilience" },
  { type: "affirmation", label: "Gentle Affirmation", prompt: "Say a kind sentence to yourself.", category: "Resilience" },
  { type: "mindful_walk", label: "Mindful Step", prompt: "Take 10 slow steps and notice your feet.", category: "Calm" },
  { type: "self_compassion", label: "Self-Compassion", prompt: "Offer yourself the words you would give a friend.", category: "Gratitude" },
  { type: "clear_space", label: "Clear Space", prompt: "Put away one small item around you.", category: "Focus" },
  { type: "connection", label: "Connection Ping", prompt: "Think of someone and wish them well.", category: "Gratitude" },
  { type: "future_self", label: "Future Self", prompt: "Name one feeling you want tomorrow.", category: "Focus" },
  { type: "savor", label: "Savor Moment", prompt: "Notice one thing that is good right now.", category: "Calm" },
];

export const nutrientByCategory: Record<ActionCategory, "water" | "sunlight" | "soil" | "bloom"> = {
  Calm: "water",
  Focus: "sunlight",
  Resilience: "soil",
  Gratitude: "bloom",
  Mood: "water",
};

export const stageThresholds = [
  { stage: "Seed", days: 0 },
  { stage: "Sprout", days: 2 },
  { stage: "Plant", days: 5 },
  { stage: "Flower", days: 10 },
  { stage: "Tree", days: 21 },
];

export function getStageIndex(streakCount: number) {
  const index = [...stageThresholds]
    .reverse()
    .findIndex((threshold) => streakCount >= threshold.days);
  if (index === -1) {
    return 0;
  }

  return stageThresholds.length - 1 - index;
}

export function getStageName(streakCount: number) {
  const stageIndex = getStageIndex(streakCount);
  return stageThresholds[stageIndex]?.stage ?? "Seed";
}

export function getDailyAction(date: Date) {
  const index = Math.floor(date.getTime() / 86400000) % actionCatalog.length;
  return actionCatalog[index];
}

const seedVariantOptions: Record<SeedType, SeedVariant[]> = {
  Calm: [
    {
      id: "mist",
      label: "Mist Veil",
      description: "Soft blue-green leaves that curl inward as you breathe.",
      palette: "Blue-green",
    },
    {
      id: "lagoon",
      label: "Lagoon Drift",
      description: "Gentle teal fronds with rounded edges and quiet glow.",
      palette: "Teal",
    },
  ],
  Focus: [
    {
      id: "ember",
      label: "Ember Edge",
      description: "Sharp leaf tips and steady amber highlights.",
      palette: "Amber",
    },
    {
      id: "stone",
      label: "Stone Line",
      description: "Structured leaves with cool gray undertones.",
      palette: "Slate",
    },
  ],
  Resilience: [
    {
      id: "fern",
      label: "Fern Rise",
      description: "Layered fronds with lively green gradients.",
      palette: "Green",
    },
    {
      id: "root",
      label: "Rootbound",
      description: "Thicker stems and grounded, earthy tones.",
      palette: "Earth",
    },
  ],
  Gratitude: [
    {
      id: "sun",
      label: "Sunlit Bloom",
      description: "Warm petals that brighten as you grow.",
      palette: "Golden",
    },
    {
      id: "peach",
      label: "Peach Glow",
      description: "Soft blush leaves with subtle warmth.",
      palette: "Peach",
    },
  ],
};

const seedPromptVariants: Partial<Record<ActionType, Partial<Record<SeedType, string>>>> = {
  mood: {
    Calm: "How steady does your Calm seed feel today?",
    Focus: "How centered is your Focus seed today?",
    Resilience: "How resilient does your seed feel right now?",
    Gratitude: "How bright does your Gratitude seed feel today?",
  },
  breath: {
    Calm: "For your Calm seed, take three slow breaths.",
    Focus: "Take three focused breaths to steady your Focus seed.",
  },
  reflection: {
    Resilience: "Name one weight your Resilience seed can let go of today.",
  },
  kindness: {
    Gratitude: "For your Gratitude seed, name one kind action you can offer today.",
  },
  goal: {
    Focus: "Set one tiny goal to nourish your Focus seed.",
  },
};

export function getSeedVariant(seedType: SeedType, selected?: string | null): SeedVariant {
  const options = seedVariantOptions[seedType];
  if (!options?.length) {
    return { id: "default", label: "Classic", description: "A steady, familiar growth pattern.", palette: "Neutral" };
  }
  if (selected) {
    const match = options.find((variant) => variant.id === selected);
    if (match) return match;
  }
  const index = Math.floor(Math.random() * options.length);
  return options[index];
}

export function getActionLabel(actionType: ActionType | string) {
  return actionCatalog.find((action) => action.type === actionType)?.label ?? "Daily Action";
}

export function getPersonalizedAction(
  date: Date,
  seedType: SeedType,
  recentMood?: number | null,
  historyCounts?: Partial<Record<ActionType, number>>,
  preferredCategories?: ActionCategory[] | null,
  excludeTypes?: ActionType[],
) {
  const baseAction = chooseWeightedAction(
    historyCounts,
    preferredCategories,
    excludeTypes,
    date,
  );
  return personalizeAction(baseAction, seedType, recentMood);
}

export function personalizeAction(
  baseAction: ActionDefinition,
  seedType: SeedType,
  recentMood?: number | null,
) {
  let prompt = baseAction.prompt;
  let variant = "standard";

  const seedVariant = seedPromptVariants[baseAction.type]?.[seedType];
  if (seedVariant) {
    prompt = seedVariant;
    variant = `seed-${seedType.toLowerCase()}`;
  }

  if (recentMood !== null && recentMood !== undefined) {
    if (recentMood <= 2) {
      prompt = `${prompt} Keep it gentle today.`;
      variant = `${variant}|mood-low`;
    } else if (recentMood >= 4) {
      prompt = `${prompt} Ride that lift with a small win.`;
      variant = `${variant}|mood-high`;
    }
  }

  return { ...baseAction, prompt, actionVariant: variant };
}

export function getNextStageInfo(streakCount: number) {
  const nextStage = stageThresholds.find((threshold) => threshold.days > streakCount);
  if (!nextStage) {
    return null;
  }

  return {
    stage: nextStage.stage,
    daysRemaining: Math.max(nextStage.days - streakCount, 0),
  };
}

export function chooseWeightedAction(
  historyCounts?: Partial<Record<ActionType, number>>,
  preferredCategories?: ActionCategory[] | null,
  excludeTypes: ActionType[] = [],
  dateSeed?: Date,
) {
  const candidates = actionCatalog.filter((action) => !excludeTypes.includes(action.type));
  if (candidates.length === 0) {
    return getDailyAction(dateSeed ?? new Date());
  }

  const weights = candidates.map((action) => {
    const history = historyCounts?.[action.type] ?? 0;
    const categoryBoost = preferredCategories?.includes(action.category) ? 1.4 : 1;
    return Math.max(0.4, 1 / (1 + history)) * categoryBoost;
  });
  const total = weights.reduce((sum, value) => sum + value, 0);
  const pick = Math.random() * total;
  let running = 0;
  for (let i = 0; i < candidates.length; i += 1) {
    running += weights[i];
    if (pick <= running) {
      return candidates[i];
    }
  }
  return candidates[0];
}

export function getXpForAction(kind: ActionKind) {
  return kind === "core" ? 15 : 7;
}

export function getLevelFromXp(xpTotal: number) {
  return Math.floor(Math.max(xpTotal, 0) / 100) + 1;
}

export const unlockableCatalog = [
  { id: "dawn-haze", type: "background", label: "Dawn Haze", requirementType: "level", requirementValue: 2 },
  { id: "sunlit-terrace", type: "background", label: "Sunlit Terrace", requirementType: "level", requirementValue: 4 },
  { id: "rainy-glass", type: "background", label: "Rainy Glass", requirementType: "level", requirementValue: 6 },
  { id: "stone-path", type: "decor", label: "Stone Path", requirementType: "streak", requirementValue: 5 },
  { id: "wind-chimes", type: "decor", label: "Wind Chimes", requirementType: "streak", requirementValue: 10 },
  { id: "lantern", type: "decor", label: "Paper Lantern", requirementType: "streak", requirementValue: 21 },
  { id: "classic", type: "plant_skin", label: "Classic Leaves", requirementType: "level", requirementValue: 1 },
  { id: "gloss", type: "plant_skin", label: "Gloss Finish", requirementType: "level", requirementValue: 3 },
  { id: "dusk", type: "plant_skin", label: "Dusk Veil", requirementType: "level", requirementValue: 5 },
];
