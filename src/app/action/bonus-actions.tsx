"use client";

import { useState } from "react";
import { submitGardenAction } from "@/app/action/actions";
import type { ActionDefinition } from "@/lib/garden";

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

type BonusActionsProps = {
  actions: ActionDefinition[];
};

export default function BonusActions({ actions }: BonusActionsProps) {
  const [openType, setOpenType] = useState<string | null>(null);

  return (
    <div className="mt-4 grid gap-3">
      {actions.map((action) => {
        const isOpen = openType === action.type;
        const needsText = textInputTypes.has(action.type);
        return (
          <div key={action.type} className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{action.label}</p>
                <p className="text-xs text-ink/60">{action.prompt}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpenType(isOpen ? null : action.type)}
                className="h-fit rounded-full bg-ink/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/60"
              >
                {isOpen ? "Hide" : "Add"}
              </button>
            </div>

            {isOpen ? (
              <form action={submitGardenAction} className="mt-4 grid gap-3">
                <input type="hidden" name="actionType" value={action.type} />
                <input type="hidden" name="actionVariant" value="bonus" />
                <input type="hidden" name="actionKind" value="bonus" />
                <input type="hidden" name="actionCategory" value={action.category} />
                {needsText ? (
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
                      Quick note
                    </span>
                    <textarea
                      name="textInput"
                      rows={3}
                      className="w-full rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm shadow-sm"
                      placeholder="One sentence is enough."
                      required
                    />
                  </label>
                ) : null}
                <button
                  type="submit"
                  className="w-fit rounded-full bg-moss px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
                >
                  Complete bonus
                </button>
              </form>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
