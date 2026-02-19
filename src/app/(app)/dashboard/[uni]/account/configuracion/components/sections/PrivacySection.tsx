"use client";

import type { SettingsInitialData } from "../types";

type Prefs = SettingsInitialData["preferences"];

function Row({
  title,
  desc,
  value,
  onChange,
}: {
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-600">{desc}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={[
          "h-8 w-14 rounded-full p-1 transition ring-1",
          value
            ? "bg-emerald-500 ring-emerald-300"
            : "bg-slate-200 ring-slate-300",
        ].join(" ")}
        aria-label={title}
      >
        <div
          className={[
            "h-6 w-6 rounded-full bg-white transition",
            value ? "translate-x-6" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export default function PrivacySection({
  value,
  onChange,
}: {
  value: Prefs;
  onChange: (next: Prefs) => void;
}) {
  return (
    <section id="privacidad" className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Controles de privacidad
        </h2>
      </div>

      <div className="divide-y divide-slate-200">
        <Row
          title="Mostrar tu nombre a otros usuarios"
          desc="Tu nombre aparecerá en rankings y actividades grupales"
          value={value.showName}
          onChange={(v) => onChange({ ...value, showName: v })}
        />
        <Row
          title="Permitir mensajes de otros estudiantes"
          desc="Recibe mensajes directos de compañeros"
          value={value.allowMessages}
          onChange={(v) => onChange({ ...value, allowMessages: v })}
        />
        <Row
          title="Mostrar tu progreso en el perfil público"
          desc="Otros usuarios podrán ver tus estadísticas"
          value={value.publicProgress}
          onChange={(v) => onChange({ ...value, publicProgress: v })}
        />
      </div>
    </section>
  );
}
