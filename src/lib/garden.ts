export type SeedType = "Calm" | "Focus" | "Resilience" | "Gratitude";
export type ActionType = "mood" | "gratitude" | "breath" | "reflection";

export const seedOptions: SeedType[] = ["Calm", "Focus", "Resilience", "Gratitude"];

export const actionCycle: { type: ActionType; label: string; prompt: string }[] = [
  { type: "mood", label: "Mood Check", prompt: "Where is your mood today?" },
  { type: "gratitude", label: "Gratitude", prompt: "Name one thing you appreciate." },
  { type: "breath", label: "Calm Breath", prompt: "Take three slow breaths." },
  { type: "reflection", label: "Stress Reflection", prompt: "What is one thing you can release?" },
];

export const stageThresholds = [
  { stage: "Seed", days: 0 },
  { stage: "Sprout", days: 2 },
  { stage: "Plant", days: 5 },
  { stage: "Flower", days: 10 },
  { stage: "Tree", days: 21 },
];

export function getStageName(streakCount: number) {
  const reached = [...stageThresholds].reverse().find((threshold) => streakCount >= threshold.days);
  return reached?.stage ?? "Seed";
}

export function getDailyAction(date: Date) {
  const index = Math.floor(date.getTime() / 86400000) % actionCycle.length;
  return actionCycle[index];
}

export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}
