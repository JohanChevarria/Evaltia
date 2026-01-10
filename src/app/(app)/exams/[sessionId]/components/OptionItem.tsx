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
    "w-full rounded-xl border px-3 py-3 text-left transition bg-white";

  // ✅ paleta sobria
  const stateClass = showCorrect
    ? "border-emerald-300 bg-emerald-50"
    : showIncorrect
      ? "border-rose-300 bg-rose-50"
      : isSelected
        ? "border-slate-900 bg-slate-50"
        : "border-slate-200 hover:bg-slate-50";

  // ❌ quitamos cursor-not-allowed
  const interactionClass = "cursor-default";

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
        className={`${base} ${stateClass} ${interactionClass}`}
        style={{ cursor: "default" }} // ✅ fuerza cursor normal SIEMPRE
      >
        <div className={`flex items-start justify-between gap-4 ${strikeClass}`}>
          <div className="flex gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg border border-slate-200 bg-white grid place-items-center text-sm font-semibold text-slate-800 shadow-inner">
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
        }`}
        style={{ cursor: "default" }} // ✅ tampoco cambia aquí
        title={striked ? "Quitar tachado" : "Tachar opción"}
        aria-label={striked ? "Quitar tachado" : "Tachar opción"}
      >
        -
      </button>
    </div>
  );
}
