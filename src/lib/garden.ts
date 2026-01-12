export type SeedType = "Calm" | "Focus" | "Resilience" | "Gratitude";
export type ActionType =
  | "mood"
  | "gratitude"
  | "breath"
  | "reflection"
  | "goal"
  | "kindness"
  | "body_scan"
  | "reframe";

export type SeedVariant = {
  id: string;
  label: string;
  description: string;
  palette: string;
};

export const seedOptions: SeedType[] = ["Calm", "Focus", "Resilience", "Gratitude"];

export const actionCycle: { type: ActionType; label: string; prompt: string }[] = [
  { type: "mood", label: "Mood Check", prompt: "Where is your mood today?" },
  { type: "gratitude", label: "Gratitude", prompt: "Name one thing you appreciate." },
  { type: "breath", label: "Calm Breath", prompt: "Take three slow breaths." },
  { type: "reflection", label: "Stress Reflection", prompt: "What is one thing you can release?" },
  { type: "goal", label: "Micro Goal", prompt: "Set one tiny goal for today." },
  { type: "kindness", label: "Kindness Ping", prompt: "Name one kind action you can do today." },
  { type: "body_scan", label: "Body Scan", prompt: "Notice three sensations in your body." },
  { type: "reframe", label: "Positive Reframe", prompt: "Rewrite a stressful thought into a gentler one." },
];

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
  const index = Math.floor(date.getTime() / 86400000) % actionCycle.length;
  return actionCycle[index];
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
  return actionCycle.find((action) => action.type === actionType)?.label ?? "Daily Action";
}

export function getPersonalizedAction(
  date: Date,
  seedType: SeedType,
  recentMood?: number | null,
) {
  const baseAction = getDailyAction(date);
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

export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
