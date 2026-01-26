"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  courseId: string;
  initialQuestions: number;
  initialMinutes: number;
};

type ExamConfig = {
  simulacro?: {
    questions?: number;
    minutes?: number;
  };
  // si tienes otros modos/configs aquí, se preservan con el spread
  [key: string]: any;
};

export default function EditSimulacroButton({
  courseId,
  initialQuestions,
  initialMinutes,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<"preguntas" | "cronometro">("preguntas");
  const tabs = ["preguntas", "cronometro"] as const;

  // valores editables
  const [questions, setQuestions] = useState(initialQuestions);
  const [minutes, setMinutes] = useState(initialMinutes);

  // baseline real (DB o props)
  const [baseQuestions, setBaseQuestions] = useState(initialQuestions);
  const [baseMinutes, setBaseMinutes] = useState(initialMinutes);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    setMsg(null);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Al abrir: lee la config REAL desde DB (para no depender de props stale/defaults)
    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("exam_config")
        .eq("id", courseId)
        .single();

      setLoading(false);

      if (error) {
        // fallback a props
        setBaseQuestions(initialQuestions);
        setBaseMinutes(initialMinutes);
        setQuestions(initialQuestions);
        setMinutes(initialMinutes);
        setMsg("No se pudo cargar la config actual (usando valores por defecto).");
        return;
      }

      const examConfig = (data?.exam_config ?? {}) as ExamConfig;
      const q =
        Number(examConfig?.simulacro?.questions) ||
        Number(initialQuestions) ||
        40;
      const m =
        Number(examConfig?.simulacro?.minutes) ||
        Number(initialMinutes) ||
        20;

      setBaseQuestions(q);
      setBaseMinutes(m);
      setQuestions(q);
      setMinutes(m);
    })();

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, courseId, supabase, initialQuestions, initialMinutes]);

  const close = () => setOpen(false);

  function clampInt(v: unknown, min: number, max: number, fallback: number) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(n)));
  }

  async function save(type: "questions" | "minutes") {
    setSaving(true);
    setMsg(null);

    // clamp
    const safeQuestions = clampInt(questions, 1, 500, baseQuestions || 40);
    const safeMinutes = clampInt(minutes, 1, 500, baseMinutes || 20);

    // importante: NO deep-merge automático en Postgres,
    // así que primero traemos el exam_config actual y preservamos lo demás.
    const { data: current, error: readErr } = await supabase
      .from("courses")
      .select("exam_config")
      .eq("id", courseId)
      .single();

    if (readErr) {
      setSaving(false);
      setMsg("Error leyendo config actual: " + readErr.message);
      return;
    }

    const currentConfig = (current?.exam_config ?? {}) as ExamConfig;

    const nextConfig: ExamConfig = {
      ...currentConfig,
      simulacro: {
        ...(currentConfig.simulacro ?? {}),
        questions: type === "questions" ? safeQuestions : (currentConfig.simulacro?.questions ?? baseQuestions),
        minutes: type === "minutes" ? safeMinutes : (currentConfig.simulacro?.minutes ?? baseMinutes),
      },
    };

    const { error: upErr } = await supabase
      .from("courses")
      .update({ exam_config: nextConfig })
      .eq("id", courseId);

    setSaving(false);

    if (upErr) {
      setMsg("Error: " + upErr.message);
      return;
    }

    // actualiza baseline local
    const newBaseQ =
      Number(nextConfig?.simulacro?.questions) || safeQuestions;
    const newBaseM =
      Number(nextConfig?.simulacro?.minutes) || safeMinutes;

    setBaseQuestions(newBaseQ);
    setBaseMinutes(newBaseM);
    setQuestions(newBaseQ);
    setMinutes(newBaseM);

    setMsg("Guardado ✅");

    // clave: refresca Server Components para que al cambiar de curso o volver,
    // el UI reciba los nuevos initial props
    router.refresh();
  }

  if (!mounted) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
      >
        Editar simulacro
      </button>

      {!open
        ? null
        : createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
              <div className="absolute inset-0" onClick={close} />

              <div
                className="relative w-full max-w-lg rounded-2xl bg-white/80 backdrop-blur border border-black/5 shadow-lg p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold">Editar simulacro</h2>
                    <p className="text-xs text-slate-500">
                      Preguntas y cronómetro
                    </p>
                  </div>
                  <button onClick={close} className="rounded-full border p-1.5">
                    ✕
                  </button>
                </div>

                {/* tabs */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {tabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActive(t)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
                        active === t
                          ? "bg-indigo-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      {t === "preguntas" ? "Preguntas" : "Cronómetro"}
                    </button>
                  ))}
                </div>

                {loading ? (
                  <div className="text-sm text-slate-600 border rounded-xl p-3">
                    Cargando configuración actual…
                  </div>
                ) : active === "preguntas" ? (
                  <>
                    <div className="flex justify-between items-center gap-4">
                      <label className="text-sm font-medium">Cantidad</label>
                      <input
                        type="number"
                        value={questions}
                        onChange={(e) => setQuestions(Number(e.target.value))}
                        className="w-28 text-center border rounded-xl px-2 py-1.5"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={close} className="px-3 py-2 rounded-xl">
                        Cancelar
                      </button>
                      <button
                        onClick={() => save("questions")}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center gap-4">
                      <label className="text-sm font-medium">Minutos</label>
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) => setMinutes(Number(e.target.value))}
                        className="w-28 text-center border rounded-xl px-2 py-1.5"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={close} className="px-3 py-2 rounded-xl">
                        Cancelar
                      </button>
                      <button
                        onClick={() => save("minutes")}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl disabled:opacity-60"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                )}

                {msg && (
                  <div className="mt-4 text-sm border rounded-xl p-3 bg-white/70">
                    {msg}
                  </div>
                )}
              </div>
            </div>,
            document.body
          )}
    </>
  );
}
