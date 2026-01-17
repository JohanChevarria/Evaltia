"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

type Props = {
  courseId: string;
  initialQuestions: number;
  initialMinutes: number;
};

export default function EditSimulacroButton({
  courseId,
  initialQuestions,
  initialMinutes,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [mounted, setMounted] = useState(false);

  const [open, setOpen] = useState(false);
  const [active, setActive] =
    useState<"preguntas" | "cronometro">("preguntas");
  const tabs = ["preguntas", "cronometro"] as const;

  const [questions, setQuestions] = useState(initialQuestions);
  const [minutes, setMinutes] = useState(initialMinutes);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    setMsg(null);
    setQuestions(initialQuestions);
    setMinutes(initialMinutes);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, initialQuestions, initialMinutes]);

  const close = () => setOpen(false);

  async function save(type: "questions" | "minutes") {
    setSaving(true);
    setMsg(null);

    const safeQuestions = Math.max(
      1,
      Math.min(500, Number(questions) || 1)
    );

    const safeMinutes = Math.max(
      1,
      Math.min(500, Number(minutes) || 1)
    );

    const payload = {
      exam_config: {
        simulacro: {
          questions: type === "questions" ? safeQuestions : initialQuestions,
          minutes: type === "minutes" ? safeMinutes : initialMinutes,
        },
      },
    };

    const { error } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", courseId);

    setSaving(false);

    if (error) {
      setMsg("Error: " + error.message);
      return;
    }

    setMsg("Guardado ✅");
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
                    <h2 className="text-lg font-bold">
                      Editar simulacro
                    </h2>
                    <p className="text-xs text-slate-500">
                      Preguntas y cronómetro
                    </p>
                  </div>
                  <button
                    onClick={close}
                    className="rounded-full border p-1.5"
                  >
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
                      {t === "preguntas"
                        ? "Preguntas"
                        : "Cronómetro"}
                    </button>
                  ))}
                </div>

                {active === "preguntas" ? (
                  <>
                    <div className="flex justify-between">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        value={questions}
                        onChange={(e) =>
                          setQuestions(Number(e.target.value))
                        }
                        className="w-28 text-center border rounded-xl"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={close}>Cancelar</button>
                      <button
                        onClick={() => save("questions")}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <label>Minutos</label>
                      <input
                        type="number"
                        value={minutes}
                        onChange={(e) =>
                          setMinutes(Number(e.target.value))
                        }
                        className="w-28 text-center border rounded-xl"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <button onClick={close}>Cancelar</button>
                      <button
                        onClick={() => save("minutes")}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                )}

                {msg && (
                  <div className="mt-4 text-sm border rounded-xl p-3">
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
