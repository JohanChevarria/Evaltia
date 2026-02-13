"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Triangle, ArrowLeft } from "lucide-react";
import ExamBuilderModal from "@/app/(app)/exams/ExamBuilderModal";
import { startReview } from "@/app/(app)/exams/lib/startReview";

type CourseRow = { id: string; name: string; description: string | null };

type TopicRow = {
  id: string;
  title: string;
  includes: any | null;
  order_number?: number | null;
};

type TopicProgress = {
  total: number;
  correct: number;
  incorrect: number;
  answered: number;
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
  const params = useParams<{ uni: string; courseId: string }>();
  const searchParams = useSearchParams();

  const courseId = (params?.courseId ?? "").toString();
  const uni = (params?.uni ?? "").toString();

  const initialName = (searchParams?.get("name") ?? "").toString().trim();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [course, setCourse] = useState<CourseRow | null>(null);
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [progressByTopic, setProgressByTopic] = useState<Record<string, TopicProgress>>({});
  const [examOpen, setExamOpen] = useState(false);
  const [reviewLoadingId, setReviewLoadingId] = useState<string | null>(null);
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});

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
          router.push("/login");
          return;
        }

        const courseQuery = supabase
          .from("courses")
          .select("id, name, description")
          .eq("id", courseId)
          .single();

        const topicsQuery = supabase
          .from("topics")
          .select("id, title, includes, order_number")
          .eq("course_id", courseId)
          .order("order_number", { ascending: true })
          .order("title", { ascending: true });

        const [{ data: courseRow, error: courseError }, { data: topicRows, error: topicsError }] =
          await Promise.all([courseQuery, topicsQuery]);

        if (courseError || !courseRow?.id) {
          setErrorMsg("Curso no encontrado.");
          setLoading(false);
          return;
        }

        if (topicsError) {
          setErrorMsg(`Error cargando temas: ${topicsError.message}`);
          setLoading(false);
          return;
        }

        if (cancelled) return;

        const topicList = (topicRows ?? []) as TopicRow[];

        setCourse(courseRow as CourseRow);
        setTopics(topicList);

        const topicIds = topicList.map((t) => t.id).filter(Boolean);
        if (topicIds.length === 0) {
          setProgressByTopic({});
          setLoading(false);
          return;
        }

        const { data: questionRows, error: questionError } = await supabase
          .from("questions")
          .select("id, topic_id")
          .eq("course_id", courseId)
          .in("topic_id", topicIds);

        if (questionError) console.error(questionError);

        const questionTopicMap = new Map<string, string>();
        const totalByTopic = new Map<string, number>();

        for (const row of questionRows ?? []) {
          if (!row?.id || !row?.topic_id) continue;
          questionTopicMap.set(row.id, row.topic_id);
          totalByTopic.set(row.topic_id, (totalByTopic.get(row.topic_id) ?? 0) + 1);
        }

        const { data: answerRows, error: answerError } = await supabase
          .from("exam_answers")
          .select("question_id, is_correct, created_at, exam_sessions!inner(mode, user_id, course_id)")
          .eq("exam_sessions.user_id", user.id)
          .eq("exam_sessions.mode", "repaso")
          .eq("exam_sessions.course_id", courseId);

        if (answerError) console.error(answerError);

        const latestByQuestion = new Map<string, { isCorrect: boolean; createdAt: number }>();
        for (const row of answerRows ?? []) {
          const questionId = (row as any)?.question_id;
          if (!questionId || !questionTopicMap.has(questionId)) continue;

          const createdAtRaw = Date.parse((row as any)?.created_at ?? "");
          const createdAt = Number.isNaN(createdAtRaw) ? 0 : createdAtRaw;
          const prev = latestByQuestion.get(questionId);

          if (!prev || createdAt >= prev.createdAt) {
            latestByQuestion.set(questionId, {
              isCorrect: !!(row as any)?.is_correct,
              createdAt,
            });
          }
        }

        const progress: Record<string, TopicProgress> = {};
        for (const topicId of topicIds) {
          progress[topicId] = {
            total: totalByTopic.get(topicId) ?? 0,
            correct: 0,
            incorrect: 0,
            answered: 0,
          };
        }

        for (const [questionId, payload] of latestByQuestion.entries()) {
          const topicId = questionTopicMap.get(questionId);
          if (!topicId || !progress[topicId]) continue;
          if (payload.isCorrect) progress[topicId].correct += 1;
          else progress[topicId].incorrect += 1;
          progress[topicId].answered += 1;
        }

        setProgressByTopic(progress);
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

  const handleStartReview = async (topic: TopicRow) => {
    if (reviewLoadingId) return;

    setReviewLoadingId(topic.id);
    setReviewErrors((prev) => {
      if (!prev[topic.id]) return prev;
      const next = { ...prev };
      delete next[topic.id];
      return next;
    });

    try {
      const sessionId = await startReview({
        topicId: topic.id,
        topicName: topic.title,
        courseId,
      });
      router.push(`/exams/${sessionId}`);
    } catch (err: any) {
      setReviewErrors((prev) => ({
        ...prev,
        [topic.id]: err?.message ?? "No se pudo iniciar el repaso.",
      }));
    } finally {
      setReviewLoadingId(null);
    }
  };

  const headerName = course?.name || initialName;
  const headerDesc = course?.description;

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-lg p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
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
                {headerName ? (
                  headerName
                ) : (
                  <span className="inline-block h-7 w-56 rounded-lg bg-slate-900/10 animate-pulse" />
                )}
              </h1>

              {headerDesc ? (
                <p className="text-sm text-slate-600 mt-1">{headerDesc}</p>
              ) : (
                <p className="text-sm text-slate-600 mt-1">Selecciona un tema para practicar.</p>
              )}
            </div>
          </div>

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

                    const progress = progressByTopic[t.id] ?? {
                      total: 0,
                      correct: 0,
                      incorrect: 0,
                      answered: 0,
                    };

                    const totalCount = progress.total;
                    const answeredCount = progress.answered;

                    const correctPct =
                      totalCount > 0 ? Math.round((progress.correct / totalCount) * 100) : 0;

                    const incorrectPct =
                      totalCount > 0 ? Math.round((progress.incorrect / totalCount) * 100) : 0;

                    const correctRate =
                      answeredCount > 0 ? Math.round((progress.correct / answeredCount) * 100) : 0;

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

                            <div className="font-semibold text-slate-900">{t.title}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700 border border-black/10 hover:bg-slate-100"
                              disabled={reviewLoadingId === t.id}
                              onClick={() => handleStartReview(t)}
                            >
                              {reviewLoadingId === t.id ? "Creando..." : "Repasar"}
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

                        {reviewErrors[t.id] && (
                          <div className="mt-2 text-xs text-red-600">{reviewErrors[t.id]}</div>
                        )}

                        <div className="mt-3">
                          <div className="h-2.5 w-full rounded-full bg-slate-900/10 overflow-hidden border border-black/5 relative">
                            <div
                              className="absolute left-0 top-0 h-full bg-emerald-500/80"
                              style={{ width: `${correctPct}%` }}
                            />
                            <div
                              className="absolute top-0 h-full bg-rose-500/80"
                              style={{ left: `${correctPct}%`, width: `${incorrectPct}%` }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                            <span>
                              Respondidas: <span className="font-semibold">{answeredCount}</span> /{" "}
                              {totalCount}
                            </span>
                            <span>{correctRate}% correcto</span>
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
