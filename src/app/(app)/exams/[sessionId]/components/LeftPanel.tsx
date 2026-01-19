"use client";

type QuestionNavItem = {
  id: string;
  label: number;
  answered: boolean;
  correct: boolean;
  flagged: boolean;
};

type Props = {
  sessionName: string;
  modeLabel: string;
  showTimer: boolean;
  timeLeft: number | null;
  items: QuestionNavItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const ss = (safe % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export function LeftPanel({
  sessionName,
  modeLabel,
  showTimer,
  timeLeft,
  items,
  currentIndex,
  onSelect,
}: Props) {
  const shouldScroll = items.length > 10;

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/5 shadow-lg p-4 space-y-4 w-full min-w-[240px]">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {modeLabel}
        </p>
        <h2 className="text-lg font-bold text-slate-900 mt-1 line-clamp-2 break-words">
          {sessionName}
        </h2>
      </div>

      {showTimer && typeof timeLeft === "number" && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-slate-800">
          <p className="text-xs text-slate-500">Tiempo restante</p>
          <p className="text-2xl font-semibold text-indigo-700">{formatTime(timeLeft)}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-slate-500 mb-2">Preguntas</p>

        <div
          className={`space-y-2 ${
            shouldScroll ? "max-h-[552px] overflow-y-auto pr-2 scrollbar-soft" : ""
          }`}
        >
          {items.map((item, idx) => {
            const isActive = idx === currentIndex;

            const base =
              "w-full h-12 rounded-xl border text-sm font-bold transition flex items-center justify-center relative";

            const state = isActive
              ? "bg-indigo-600 text-white border-indigo-500 shadow"
              : "bg-white/80 border-black/10 text-slate-800 hover:bg-slate-100";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(idx)}
                className={`${base} ${state}`}
              >
                {item.label}

                {item.answered && (
                  <span
                    className={`absolute right-2 top-2 h-2.5 w-2.5 rounded-full ${
                      item.correct ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                  />
                )}

                {item.flagged && (
                  <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
