"use client";

import type { ExamOption } from "../../lib/types";

type OptionItemProps = {
  option: ExamOption;
  isSelected: boolean;
  isDisabled: boolean;
  showCorrect: boolean;
  showIncorrect: boolean;
  showExplanation: boolean;
  striked: boolean;
  onSelect: () => void;
  onToggleStrike: () => void;
};

export function OptionItem({
  option,
  isSelected,
  isDisabled,
  showCorrect,
  showIncorrect,
  showExplanation,
  striked,
  onSelect,
  onToggleStrike,
}: OptionItemProps) {
  const base =
    "w-full rounded-xl border px-3 py-3 text-left transition";

  // ✅ paleta sobria
  const stateClass = showCorrect
    ? "border-emerald-300 bg-emerald-50"
    : showIncorrect
      ? "border-rose-300 bg-rose-50"
      : isSelected
        ? "border-slate-900 bg-slate-50"
        : "border-slate-200 bg-white hover:bg-slate-50";

  const badgeClass = showCorrect
    ? "border-emerald-200 bg-emerald-100 text-emerald-900"
    : showIncorrect
      ? "border-rose-200 bg-rose-100 text-rose-900"
      : isSelected
        ? "border-slate-300 bg-slate-100 text-slate-900"
        : "border-slate-200 bg-white text-slate-800";

  const interactionClass = isDisabled || striked ? "cursor-not-allowed" : "cursor-pointer";

  const strikeClass = striked ? "line-through opacity-60" : "";

  const handleClick = () => {
    if (isDisabled || striked) return; // ✅ bloquea lógica
    onSelect();
  };

  return (
    <div className="flex items-start gap-2">
      <button
        type="button"
        aria-disabled={isDisabled || striked}
        onClick={handleClick}
        className={`${base} ${stateClass} ${interactionClass} select-none`}
      >
        <div className={`flex items-start justify-between gap-4 ${strikeClass}`}>
          <div className="flex gap-3 min-w-0">
            <div
              className={`h-8 w-8 rounded-lg border grid place-items-center text-sm font-semibold shadow-inner ${badgeClass}`}
            >
              {option.label ?? "?"}
            </div>

            <div className="min-w-0 text-sm text-slate-900 whitespace-pre-wrap break-words">
              {option.text || "Sin texto"}
            </div>
          </div>
        </div>

        {/* ✅ explicación */}
        {showExplanation && (
          <div className="mt-2 text-xs text-slate-600 text-left whitespace-pre-wrap break-words">
            {option.explanation || "Sin explicación"}
          </div>
        )}
      </button>

      {/* tachado */}
      <button
        type="button"
        onClick={() => {
          if (isDisabled) return; // bloquea si toca
          onToggleStrike();
        }}
        className={`px-2 py-1 text-slate-500 hover:text-slate-900 select-none ${
          striked ? "opacity-80" : ""
        } ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        title={striked ? "Quitar tachado" : "Tachar opción"}
        aria-label={striked ? "Quitar tachado" : "Tachar opción"}
      >
        -
      </button>
    </div>
  );
}


