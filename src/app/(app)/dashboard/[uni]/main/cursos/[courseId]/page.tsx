"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Triangle, ArrowLeft } from "lucide-react";
import ExamBuilderModal from "@/app/(app)/exams/ExamBuilderModal";

type CourseRow = { id: string; name: string; description: string | null };

type TopicRow = {
  id: string;
  title: string;
  includes: any | null;
  order_number?: number | null;
};

function normalizeIncludes(includes: any): string {
  if (!includes) return "";
  if (Array.isArray(includes)) return includes.join(", ");
  if (typeof includes === "string") return includes;
  try {
    return JSON.stringify(includes);
  } catch {
    return String(includes);
  }
}

export default function CursoDetallePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // ✅ En client, usa useParams() (evita params Promise)
  const params = useParams<{ uni: string; courseId: string }>();

  const courseId = (params?.courseId ?? "").toString();
  const uni = (params?.uni ?? "").toString();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [examOpen, setExamOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMsg(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        // 1) Curso
        const { data: courseRow, error: courseError } = await supabase
          .from("courses")
          .select("id, name, description")
          .eq("id", courseId)
          .single();

        if (courseError || !courseRow?.id) {
          setErrorMsg("Curso no encontrado.");
          setLoading(false);
          return;
        }

        // 2) Topics — ORDEN POR order_number ✅
        const { data: topicRows, error: topicsError } = await supabase
          .from("topics")
          .select("id, title, includes, order_number")
          .eq("course_id", courseId)
          .order("order_number", { ascending: true })
          .order("title", { ascending: true });

        if (topicsError) {
          setErrorMsg(`Error cargando temas: ${topicsError.message}`);
          setLoading(false);
          return;
        }

        if (cancelled) return;

        setCourse(courseRow as CourseRow);
        setTopics((topicRows ?? []) as TopicRow[]);
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message ?? "Error inesperado.");
        setLoading(false);
      }
    }

    if (!courseId) {
      setErrorMsg("courseId inválido.");
      setLoading(false);
      return;
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [courseId, supabase, router]);

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-lg p-6 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Icono regresar al lado del nombre */}
            <button
              type="button"
              onClick={() => router.push(`/dashboard/${uni}/main/cursos`)}
              className="mt-0.5 h-10 w-10 rounded-xl bg-white border border-black/10 grid place-items-center hover:bg-slate-100"
              aria-label="Volver a cursos"
              title="Volver a cursos"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </button>

            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                {course?.name ?? "Curso"}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {course?.description ?? "Selecciona un tema para practicar."}
              </p>
            </div>
          </div>

          {/* Derecha: Crear examen + Volver */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExamOpen(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Crear examen
            </button>

            <Link
              href={`/dashboard/${uni}/main/cursos`}
              className="rounded-xl bg-white px-4 py-2 text-sm text-slate-700 border border-black/10 hover:bg-slate-100"
            >
              Volver
            </Link>
          </div>
        </div>

        {/* Modal crear examen */}
        <ExamBuilderModal
          courseId={courseId}
          uni={uni}
          open={examOpen}
          onClose={() => setExamOpen(false)}
        />

        <div className="mt-6">
          {loading && (
            <div className="text-sm text-slate-700 bg-white/70 border border-black/10 rounded-xl p-3">
              Cargando temas...
            </div>
          )}

          {errorMsg && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
              {errorMsg}
            </div>
          )}

          {!loading && !errorMsg && (
            <>
              {topics.length === 0 ? (
                <div className="text-sm text-slate-700 bg-white/70 border border-black/10 rounded-xl p-3">
                  Este curso aún no tiene temas.
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((t, idx) => {
                    const includesText = normalizeIncludes(t.includes);

                    const correctPct = 0;
                    const incorrectPct = 0;

                    const badgeNumber =
                      typeof t.order_number === "number" && t.order_number > 0
                        ? t.order_number
                        : idx + 1;

                    return (
                      <div
                        key={t.id}
                        className="w-full rounded-2xl bg-white/70 border border-black/10 p-4 sm:p-5 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5 h-9 w-9 rounded-full bg-slate-900/5 border border-black/10 grid place-items-center">
                              <span className="text-sm font-semibold text-slate-700">
                                {badgeNumber}
                              </span>
                            </div>

                            <div>
                              <div className="font-semibold text-slate-900">{t.title}</div>
                              <div className="text-xs text-slate-600 mt-0.5">
                                Entrar a practicar
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 border border-black/10 hover:bg-slate-100"
                              onClick={() => {
                                console.log("Repasar topic:", t.id, t.title);
                              }}
                            >
                              Repasar
                            </button>

                            <div className="relative group shrink-0">
                              <div className="h-9 w-9 rounded-xl bg-white border border-black/10 grid place-items-center">
                                <Triangle className="h-4 w-4 rotate-180 text-slate-600" />
                              </div>

                              {includesText ? (
                                <div className="pointer-events-none absolute right-0 top-10 z-20 hidden group-hover:block">
                                  <div className="max-w-[360px] rounded-xl border border-black/10 bg-white shadow-lg px-3 py-2 text-xs text-slate-700">
                                    <div className="font-medium text-slate-900 mb-1">Incluye</div>
                                    <div className="leading-relaxed">{includesText}</div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="h-2.5 w-full rounded-full bg-slate-900/10 overflow-hidden border border-black/5 relative">
                            <div
                              className="absolute left-0 top-0 h-full bg-emerald-500/70"
                              style={{ width: `${correctPct}%` }}
                            />
                            <div
                              className="absolute top-0 h-full bg-rose-500/70"
                              style={{ left: `${correctPct}%`, width: `${incorrectPct}%` }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                            <span>Respondidas: 0</span>
                            <span>0% correcto</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
