// src/app/(app)/dashboard/[uni]/main/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingCoursesOverlay from "@/app/(onboarding)/courses/OnboardingCoursesOverlay";

export const dynamic = "force-dynamic";

type CourseProgress = {
  id: string;
  name: string;
  correctas: number;
  incorrectas: number;
  total: number;
};

type DashboardData = {
  userName: string;
  globalCorrectas: number;
  globalIncorrectas: number;
  globalTotal: number;
  courses: CourseProgress[];
  activePractice?: {
    sessionId: string;
    name: string;
    courseName?: string | null;
    answered: number;
    total: number;
  };
};

type ProfileRow = {
  first_name: string | null;
  role: string | null;
  university_onboarding_completed: boolean | null;
  onboarding_completed: boolean | null;
  university_id: string | null;
  selected_courses?: string[] | null;
};

export default function DashboardUniMainPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);

  const [openCoursesOnboarding, setOpenCoursesOnboarding] = useState(false);

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    setChecking(true);

    const { data: u, error: uErr } = await supabase.auth.getUser();
    const user = u?.user;

    // Fix: route group (auth) => login real es /login
    if (uErr || !user) {
      router.replace("/login");
      return;
    }

    if (!mountedRef.current) return;
    setUserId(user.id);

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select(
        "first_name, role, university_onboarding_completed, onboarding_completed, university_id, selected_courses"
      )
      .eq("id", user.id)
      .single();

    // Fix: mismo cambio aqui.
    if (pErr || !profile) {
      router.replace("/login");
      return;
    }

    const prof = profile as ProfileRow;

    if (prof.role === "admin") {
      if (!prof.university_id) {
        return;
      }

      const { data: uniRow } = await supabase
        .from("universities")
        .select("code")
        .eq("id", prof.university_id)
        .single();

      const uniCode = (uniRow?.code || "usmp").toLowerCase();
      router.replace(`/studio/${uniCode}`);
      return;
    }

    if (!prof.university_onboarding_completed) {
      router.replace("/onboarding/university");
      return;
    }

    if (mountedRef.current) {
      setUniversityId(prof.university_id ?? null);
    }

    const nameFromProfile =
      prof.first_name ||
      (user.user_metadata as any)?.first_name ||
      user.email?.split("@")[0] ||
      "Estudiante";

    const needsCourses = !prof.onboarding_completed;
    if (mountedRef.current) {
      setOpenCoursesOnboarding(needsCourses);
    }

    if (needsCourses) {
      if (mountedRef.current) {
        setData({
          userName: nameFromProfile,
          globalCorrectas: 0,
          globalIncorrectas: 0,
          globalTotal: 0,
          courses: [],
          activePractice: undefined,
        });
        setChecking(false);
      }
      return;
    }

    // Analytics solo de repasos (repaso = source of truth)
    const selectedCourseNames = Array.isArray(prof.selected_courses)
      ? prof.selected_courses.filter((name) => typeof name === "string" && name.trim().length > 0)
      : [];

    let courseRows: Array<{ id: string; name: string }> = [];
    if (selectedCourseNames.length > 0 && prof.university_id) {
      const { data: fetchedCourses, error: coursesError } = await supabase
        .from("courses")
        .select("id, name")
        .eq("university_id", prof.university_id)
        .in("name", selectedCourseNames);

      if (coursesError) console.error(coursesError);
      courseRows = (fetchedCourses ?? []) as Array<{ id: string; name: string }>;
    }

    const courseList = courseRows.length
      ? courseRows
      : selectedCourseNames.map((name) => ({ id: name, name }));

    const courseIds = courseRows.map((row) => row.id).filter(Boolean);
    const courseNameById = new Map(courseRows.map((row) => [row.id, row.name]));

    const totalsByCourse = new Map<string, number>();
    const questionCourseMap = new Map<string, string>();

    if (courseIds.length > 0) {
      const { data: questionRows, error: questionError } = await supabase
        .from("questions")
        .select("id, course_id")
        .in("course_id", courseIds);

      if (questionError) console.error(questionError);

      for (const row of questionRows ?? []) {
        if (!row?.id || !row?.course_id) continue;
        questionCourseMap.set(row.id, row.course_id);
        totalsByCourse.set(row.course_id, (totalsByCourse.get(row.course_id) ?? 0) + 1);
      }
    }

    const latestByQuestion = new Map<string, { isCorrect: boolean; createdAt: number }>();
    if (courseIds.length > 0) {
      const { data: answerRows, error: answerError } = await supabase
        .from("exam_answers")
        .select("question_id, is_correct, created_at, exam_sessions!inner(course_id, mode, user_id)")
        .eq("exam_sessions.user_id", user.id)
        .eq("exam_sessions.mode", "repaso")
        .in("exam_sessions.course_id", courseIds);

      if (answerError) console.error(answerError);

      for (const row of answerRows ?? []) {
        const questionId = (row as any)?.question_id;
        if (!questionId || !questionCourseMap.has(questionId)) continue;

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
    }

    const correctByCourse = new Map<string, number>();
    const incorrectByCourse = new Map<string, number>();

    for (const [questionId, payload] of latestByQuestion.entries()) {
      const courseId = questionCourseMap.get(questionId);
      if (!courseId) continue;
      if (payload.isCorrect) {
        correctByCourse.set(courseId, (correctByCourse.get(courseId) ?? 0) + 1);
      } else {
        incorrectByCourse.set(courseId, (incorrectByCourse.get(courseId) ?? 0) + 1);
      }
    }

    const courses: CourseProgress[] = courseList.map((course) => ({
      id: course.id,
      name: course.name,
      correctas: correctByCourse.get(course.id) ?? 0,
      incorrectas: incorrectByCourse.get(course.id) ?? 0,
      total: totalsByCourse.get(course.id) ?? 0,
    }));

    const globalCorrectas = courses.reduce((acc, c) => acc + (c.correctas ?? 0), 0);
    const globalIncorrectas = courses.reduce((acc, c) => acc + (c.incorrectas ?? 0), 0);
    const globalTotal = courses.reduce((acc, c) => acc + (c.total ?? 0), 0);

    let activePractice: DashboardData["activePractice"] = undefined;

    const { data: pausedPractice } = await supabase
      .from("exam_sessions")
      .select("id, name, course_id, question_count, paused_at")
      .eq("user_id", user.id)
      .eq("mode", "practica")
      .eq("status", "paused")
      .order("paused_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pausedPractice?.id) {
      const { count: answeredCount } = await supabase
        .from("exam_answers")
        .select("id", { count: "exact", head: true })
        .eq("session_id", pausedPractice.id);

      let courseName = courseNameById.get((pausedPractice as any).course_id ?? "") ?? null;
      if (!courseName && (pausedPractice as any).course_id) {
        const { data: courseRow } = await supabase
          .from("courses")
          .select("name")
          .eq("id", (pausedPractice as any).course_id)
          .single();
        courseName = (courseRow as any)?.name ?? null;
      }

      activePractice = {
        sessionId: pausedPractice.id,
        name: (pausedPractice as any)?.name ?? "Practica",
        courseName,
        answered: answeredCount ?? 0,
        total: (pausedPractice as any)?.question_count ?? 0,
      };
    }

    if (mountedRef.current) {
      setData({
        userName: nameFromProfile,
        globalCorrectas,
        globalIncorrectas,
        globalTotal,
        courses,
        activePractice,
      });
      setChecking(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const handleFocus = () => {
      void loadDashboard();
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadDashboard]);

  if (checking || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-7 w-7 rounded-full border border-white/40 border-t-transparent animate-spin" />
      </div>
    );
  }

  const globalRespondidas = data.globalCorrectas + data.globalIncorrectas;
  const globalPercent = data.globalTotal > 0 ? Math.round((globalRespondidas / data.globalTotal) * 100) : 0;

  const practiceTitle = data.activePractice
    ? data.activePractice.name?.trim() ||
      (data.activePractice.courseName ? `${data.activePractice.courseName} - Practica` : "Practica")
    : "";
  const answered = data.activePractice?.answered ?? 0;
  const total = data.activePractice?.total ?? 0;
  const practicePct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <>
      <OnboardingCoursesOverlay
        open={openCoursesOnboarding}
        userId={userId ?? ""}
        universityId={universityId}
        userName={data.userName ?? "Estudiante"}
        onSaved={() => {
          setOpenCoursesOnboarding(false);
          router.refresh();
        }}
        onMissingUniversity={() => {
          router.replace("/onboarding/university");
        }}
      />

      <main className="space-y-8 pb-12">
        {/* Bloque superior "Bienvenida" (exacto al diseno que pasaste) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 text-gray-900">
          <p className="text-sm text-gray-500">Bienvenido</p>

          <h1 className="text-2xl font-bold">{data.userName ?? "Estudiante"}</h1>

          <p className="mt-2 text-sm text-gray-600">
            Visualiza tu progreso global y tus cursos activos. Retoma tu practica o inicia un nuevo simulacro
            cuando quieras.
          </p>
        </section>

        {/* Fila principal */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Progreso total (glass opaco + circulo premium) */}
          <div className="w-full md:w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-slate-900">
            {/* "Progreso total" encima del circulo */}
            <p className="text-xs font-extrabold tracking-wider text-slate-700 uppercase text-center w-full">
              Progreso total
            </p>

            <div className="mt-4 relative w-44 h-44 rounded-full border-4 border-white shadow-inner flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="relative z-10 text-center px-3">
                <p className="text-3xl font-bold text-slate-900">{globalPercent}%</p>
                <p className="text-xs text-slate-600 mt-1">
                  {globalRespondidas} / {data.globalTotal} preguntas respondidas
                </p>
              </div>
            </div>

            <div className="mt-4 w-full text-xs text-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Correctas
                </span>
                <span className="font-semibold text-slate-900">{data.globalCorrectas}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Incorrectas
                </span>
                <span className="font-semibold text-slate-900">{data.globalIncorrectas}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  No vistas
                </span>
                <span className="font-semibold text-slate-900">
                  {Math.max(data.globalTotal - data.globalCorrectas - data.globalIncorrectas, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Cursos activos (spec exacta) */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-base font-semibold text-slate-900">Cursos activos</h2>
            </div>

            {data.courses.length === 0 ? (
              <p className="text-xs text-gray-500">
                Aun no tienes cursos activos. Una vez completes tu seleccion de cursos, apareceran aqui.
              </p>
            ) : (
              <div className="space-y-4">
                {data.courses.map((course) => {
                  const answeredCount = course.correctas + course.incorrectas;
                  const correctPercent = course.total > 0 ? Math.round((course.correctas / course.total) * 100) : 0;
                  const incorrectPercent =
                    course.total > 0 ? Math.round((course.incorrectas / course.total) * 100) : 0;
                  const notSeenPercent = Math.max(100 - correctPercent - incorrectPercent, 0);
                  const correctRate = answeredCount > 0 ? Math.round((course.correctas / answeredCount) * 100) : 0;

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-sm text-slate-900 truncate">{course.name}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          Correctas: {course.correctas} | Incorrectas: {course.incorrectas}
                        </span>
                      </div>

                      <div className="h-3 w-full rounded-full bg-slate-100/70 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${correctPercent}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${incorrectPercent}%` }} />
                        <div className="h-full bg-transparent" style={{ width: `${notSeenPercent}%` }} />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Respondidas:{" "}
                          <span className="font-semibold">{answeredCount}</span> / {course.total}
                        </span>
                        <span>{correctRate}% correcto</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Practica activa / sin practica (spec exacta) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
          {data.activePractice ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Practica guardada</p>

              <p className="mt-2 text-sm text-gray-800 font-semibold">{practiceTitle}</p>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${practicePct}%` }} />
                </div>

                <p className="mt-1 text-xs text-gray-600">
                  Preguntas respondidas: <span className="font-semibold">{answered}</span> / {total}
                </p>
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push(`/exams/${data.activePractice?.sessionId}`)}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Reanudar practica
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin practica activa</p>

              <p className="mt-1 text-sm text-gray-600">
                No tienes una practica guardada. Puedes crear una nueva practica desde cualquier curso.
              </p>

              <button className="mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Iniciar nueva practica
              </button>
            </>
          )}
        </section>
      </main>
    </>
  );
}


















