// src/app/(app)/dashboard/[uni]/account/configuracion/components/sections/AccessibilitySection.tsx
"use client";

type Props = {
  darkMode: boolean;
  onToggle: (v: boolean) => void;
};

export default function AccessibilitySection({ darkMode, onToggle }: Props) {
  return (
    <section id="accesibilidad" className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Accesibilidad</h2>
          <p className="mt-1 text-xs text-slate-600">
            Cambia entre tema claro y oscuro
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggle(!darkMode)}
          className="flex items-center gap-2 rounded-full bg-slate-100 p-1 ring-1 ring-slate-200"
          aria-label="Toggle dark mode"
        >
          <span
            className={[
              "grid h-9 w-9 place-items-center rounded-full text-sm transition",
              !darkMode ? "bg-amber-300" : "bg-transparent",
            ].join(" ")}
          >
            ☀️
          </span>
          <span
            className={[
              "grid h-9 w-9 place-items-center rounded-full text-sm transition",
              darkMode ? "bg-slate-800 text-white" : "bg-transparent",
            ].join(" ")}
          >
            🌙
          </span>
        </button>
      </div>
    </section>
  );
}
