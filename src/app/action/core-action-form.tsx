"use client";

import { useEffect, useMemo, useState } from "react";
import { submitGardenAction } from "@/app/action/actions";
import type { ActionDefinition } from "@/lib/garden";

type CoreActionFormProps = {
  action: ActionDefinition & { actionVariant: string };
  todayKey: string;
};

type DraftState = {
  moodScore: number;
  textInput: string;
  reframeStress: string;
  reframeShift: string;
  bodyScan1: string;
  bodyScan2: string;
  bodyScan3: string;
};

const defaultDraft: DraftState = {
  moodScore: 3,
  textInput: "",
  reframeStress: "",
  reframeShift: "",
  bodyScan1: "",
  bodyScan2: "",
  bodyScan3: "",
};

const textInputTypes = new Set([
  "gratitude",
  "gratitude_note",
  "reflection",
  "goal",
  "future_self",
  "kindness",
  "affirmation",
  "self_compassion",
  "connection",
  "savor",
]);

export default function CoreActionForm({ action, todayKey }: CoreActionFormProps) {
  const storageKey = useMemo(
    () => `mindgarden:coreDraft:${todayKey}:${action.type}`,
    [todayKey, action.type],
  );
  const [draft, setDraft] = useState<DraftState>(defaultDraft);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<DraftState>;
      setDraft({ ...defaultDraft, ...parsed });
    } catch {
      setDraft(defaultDraft);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Ignore storage failures (private mode, quota).
    }
  }, [draft, storageKey]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage failures.
    }
  };

  const needsTextInput = textInputTypes.has(action.type);

  return (
    <form
      action={submitGardenAction}
      className="mt-6 flex flex-col gap-4"
      onSubmit={() => clearDraft()}
    >
      <input type="hidden" name="actionType" value={action.type} />
      <input type="hidden" name="actionVariant" value={action.actionVariant} />
      <input type="hidden" name="actionKind" value="core" />
      <input type="hidden" name="actionCategory" value={action.category} />
      {action.type === "mood" ? (
        <label className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink/70">Mood today (1-5)</span>
          <input
            type="range"
            name="moodScore"
            min={1}
            max={5}
            value={draft.moodScore}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, moodScore: Number(event.target.value) }))
            }
            className="w-full accent-moss"
          />
        </label>
      ) : null}

      {needsTextInput ? (
        <label className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-ink/70">Write a short note</span>
          <textarea
            name="textInput"
            rows={4}
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm"
            placeholder="Just a sentence is enough."
            value={draft.textInput}
            onChange={(event) => setDraft((prev) => ({ ...prev, textInput: event.target.value }))}
            required
          />
        </label>
      ) : null}

      {action.type === "body_scan" ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <p className="text-sm font-semibold text-ink/70">Name three sensations</p>
          <div className="mt-3 grid gap-3">
            <input
              type="text"
              name="bodyScan1"
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              placeholder="e.g. Warm shoulders"
              value={draft.bodyScan1}
              onChange={(event) => setDraft((prev) => ({ ...prev, bodyScan1: event.target.value }))}
              required
            />
            <input
              type="text"
              name="bodyScan2"
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              placeholder="e.g. Lightness in chest"
              value={draft.bodyScan2}
              onChange={(event) => setDraft((prev) => ({ ...prev, bodyScan2: event.target.value }))}
              required
            />
            <input
              type="text"
              name="bodyScan3"
              className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              placeholder="e.g. Tingling hands"
              value={draft.bodyScan3}
              onChange={(event) => setDraft((prev) => ({ ...prev, bodyScan3: event.target.value }))}
              required
            />
          </div>
        </div>
      ) : null}

      {action.type === "reframe" ? (
        <div className="rounded-2xl border border-ink/10 bg-white p-4">
          <label className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-ink/70">Stressful thought</span>
            <textarea
              name="reframeStress"
              rows={3}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm"
              placeholder="What feels heavy right now?"
              value={draft.reframeStress}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, reframeStress: event.target.value }))
              }
              required
            />
          </label>
          <label className="mt-4 flex flex-col gap-3">
            <span className="text-sm font-semibold text-ink/70">Gentler reframe</span>
            <textarea
              name="reframeShift"
              rows={3}
              className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm"
              placeholder="How can you soften it?"
              value={draft.reframeShift}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, reframeShift: event.target.value }))
              }
              required
            />
          </label>
        </div>
      ) : null}

      {action.type === "breath" ? (
        <div className="rounded-2xl bg-blossom p-4 text-sm text-ink/70">
          Inhale for 4 seconds, hold for 4, exhale for 6. Repeat three times, then tap complete.
        </div>
      ) : null}

      <button
        type="submit"
        className="w-fit rounded-full bg-moss px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
      >
        Complete core action
      </button>
    </form>
  );
}
