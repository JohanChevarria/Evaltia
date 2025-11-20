"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  slug: string;     // p.ej. "histologia"
  open: boolean;    // abre/cierra el overlay
  onClose: () => void;
};

const HISTOLOGIA_TOPICS = [
  "Tejido epitelial",
  "Tejido conectivo",
  "Tejido cartilaginoso",
  "Tejido óseo",
  "Tejido sanguíneo",
  "Tejido muscular",
  "Tejido nervioso",
  "Sistema linfático",
  "Tejido adiposo",
  "Piel (integumentario)",
];

const PLACEHOLDER_TOPICS = Array.from({ length: 10 }, (_, i) => `Tema ${i + 1}`);

export default function ExamBuilderModal({ slug, open, onClose }: Props) {
  const [tipo, setTipo] = useState<"simulacro" | "practica">("practica");
  const [timed, setTimed] = useState(false);
  const topics = useMemo(
    () => (slug === "histologia" ? HISTOLOGIA_TOPICS : PLACEHOLDER_TOPICS),
    [slug]
  );
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nPreg, setNPreg] = useState<10 | 20 | 40 | "custom">(20);
  const [custom, setCustom] = useState<number>(30);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleTopic = (t: string) =>
    setSeleccion((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const preguntas = nPreg === "custom" ? Math.max(1, Math.floor(custom || 1)) : nPreg;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mt-8 mb-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold">Crear examen</h2>
            <p className="text-sm text-neutral-600">
              Curso: <span className="font-medium">{slug}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 border border-neutral-300 hover:bg-neutral-50"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5 space-y-6">
          {/* Tipo de examen */}
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Tipo de examen</h3>
            <div className="inline-flex rounded-xl border border-neutral-300 overflow-hidden">
              <button
                onClick={() => setTipo("practica")}
                className={`px-4 py-2 text-sm ${
                  tipo === "practica" ? "bg-indigo-600 text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Práctica
              </button>
              <button
                onClick={() => setTipo("simulacro")}
                className={`px-4 py-2 text-sm border-l border-neutral-300 ${
                  tipo === "simulacro" ? "bg-indigo-600 text-white" : "bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                Simulacro
              </button>
            </div>
          </section>

          <hr className="border-neutral-200" />

          {/* Cronometrado */}
          <section className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700">Cronometrado</h3>
            <label className="inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={timed}
                onChange={(e) => setTimed(e.target.checked)}
              />
              <span className="w-11 h-6 bg-neutral-300 rounded-full relative transition peer-checked:bg-indigo-600">
                <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-5" />
              </span>
              <span className="ml-2 text-sm text-neutral-700">{timed ? "Sí" : "No"}</span>
            </label>
          </section>

          <hr className="border-neutral-200" />

          {/* Temas */}
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Temas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topics.map((t) => {
                const active = seleccion.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTopic(t)}
                    className={`text-left px-3 py-2 rounded-xl border text-sm transition ${
                      active ? "border-indigo-600 bg-indigo-50" : "border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              Seleccionados: <b>{seleccion.length}</b>
            </p>
          </section>

          <hr className="border-neutral-200" />

          {/* Número de preguntas */}
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2">Número de preguntas</h3>
            <div className="flex flex-wrap items-center gap-2">
              {([10, 20, 40] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setNPreg(n)}
                  className={`px-3 py-2 rounded-xl border text-sm transition ${
                    nPreg === n ? "bg-indigo-600 text-white border-indigo-600" : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setNPreg("custom")}
                className={`px-3 py-2 rounded-xl border text-sm transition ${
                  nPreg === "custom" ? "bg-indigo-600 text-white border-indigo-600" : "border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                Personalizado
              </button>
              <input
                type="number"
                min={1}
                step={1}
                value={custom}
                onChange={(e) => setCustom(parseInt(e.target.value || "1", 10))}
                disabled={nPreg !== "custom"}
                className={`w-24 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                  nPreg === "custom" ? "border-neutral-300 bg-white" : "border-neutral-200 bg-neutral-100 text-neutral-500"
                }`}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-600">Total de preguntas: <b>{preguntas}</b></p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200">
          <button onClick={onClose} className="rounded-xl px-4 py-2 border border-neutral-300 hover:bg-neutral-50">
            Cancelar
          </button>
          <button
            className="rounded-xl px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            disabled={seleccion.length === 0 || preguntas < 1}
            onClick={onClose}
          >
            Crear examen
          </button>
        </div>
      </div>
    </div>
  );
}