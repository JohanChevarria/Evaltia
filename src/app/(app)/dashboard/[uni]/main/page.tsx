"use client";

import { useEffect, useMemo, useState } from "react";
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
    courseName: string;
    topics: string[];
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
};

export default function DashboardUniMainPage({ params }: { params: { uni: string } }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [checking, setChecking] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);

  const [openCoursesOnboarding, setOpenCoursesOnboarding] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setChecking(true);

      const { data: u, error: uErr } = await supabase.auth.getUser();
      const user = u?.user;

      if (uErr || !user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("first_name, role, university_onboarding_completed, onboarding_completed, university_id")
        .eq("id", user.id)
        .single();

      if (pErr || !profile) {
        router.replace("/auth/login");
        return;
      }

      const prof = profile as ProfileRow;

      if (prof.role === "admin" || prof.role === "superadmin") {
        router.replace("/admin-studio");
        return;
      }

      if (!prof.university_onboarding_completed) {
        router.replace("/onboarding/university");
        return;
      }

      setUniversityId(prof.university_id ?? null);

      const nameFromProfile =
        prof.first_name ||
        (user.user_metadata as any)?.first_name ||
        user.email?.split("@")[0] ||
        "Estudiante";

      const needsCourses = !prof.onboarding_completed;
      setOpenCoursesOnboarding(needsCourses);

      if (needsCourses) {
        if (!cancelled) {
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

      const { data: progressRows, error: progressError } = await supabase
        .from("course_progress")
        .select("id, course_name, correctas, incorrectas, total")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3);

      if (progressError) console.error(progressError);

      const courses: CourseProgress[] = (progressRows ?? []).map((c: any) => ({
        id: c.id,
        name: c.course_name,
        correctas: c.correctas ?? 0,
        incorrectas: c.incorrectas ?? 0,
        total: c.total ?? 0,
      }));

      const globalCorrectas = courses.reduce((acc, c) => acc + (c.correctas ?? 0), 0);
      const globalIncorrectas = courses.reduce((acc, c) => acc + (c.incorrectas ?? 0), 0);
      const globalTotal = courses.reduce((acc, c) => acc + (c.total ?? 0), 0);

      if (!cancelled) {
        setData({
          userName: nameFromProfile,
          globalCorrectas,
          globalIncorrectas,
          globalTotal,
          courses,
          activePractice: undefined, // <-- aquí luego pondrás la práctica real
        });
        setChecking(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  if (checking || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-7 w-7 rounded-full border border-white/40 border-t-transparent animate-spin" />
      </div>
    );
  }

  const globalRespondidas = data.globalCorrectas + data.globalIncorrectas;
  const globalPercent = data.globalTotal > 0 ? Math.round((globalRespondidas / data.globalTotal) * 100) : 0;

  const topicsLabel =
    data.activePractice?.topics.length === 1
      ? data.activePractice.topics[0]
      : `${data.activePractice?.topics.length ?? 0} temas seleccionados`;

  const practiceTitle = `Práctica personalizada: ${data.activePractice?.courseName ?? ""}`;

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
        {/* ✅ Bloque superior “Bienvenida” (exacto al diseño que pasaste) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 text-gray-900">
          <p className="text-sm text-gray-500">Bienvenido</p>

          <h1 className="text-2xl font-bold">{data.userName ?? "Estudiante"}</h1>

          <p className="mt-2 text-sm text-gray-600">
            Visualiza tu progreso global y tus cursos activos. Retoma tu práctica o inicia un nuevo simulacro
            cuando quieras.
          </p>
        </section>

        {/* Fila principal */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Progreso total (glass opaco + círculo premium) */}
          <div className="w-full md:w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center text-slate-900">
            {/* ✅ “Progreso total” encima del círculo */}
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
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Incorrectas
                </span>
                <span className="font-semibold text-slate-900">{data.globalIncorrectas}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  No vistas
                </span>
                <span className="font-semibold text-slate-900">
                  {Math.max(data.globalTotal - data.globalCorrectas - data.globalIncorrectas, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ CURSOS ACTIVOS (spec exacta) */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 min-w-0">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-base font-semibold text-slate-900">Cursos activos</h2>

              <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Correctas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-400" /> Incorrectas
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> No vistas
                </div>
              </div>
            </div>

            {data.courses.length === 0 ? (
              <p className="text-xs text-gray-500">
                Aún no tienes cursos activos. Una vez completes tu selección de cursos, aparecerán aquí.
              </p>
            ) : (
              <div className="space-y-4">
                {data.courses.map((course) => {
                  const correctPercent = course.total > 0 ? Math.round((course.correctas / course.total) * 100) : 0;
                  const incorrectPercent =
                    course.total > 0 ? Math.round((course.incorrectas / course.total) * 100) : 0;
                  const notSeenPercent = Math.max(100 - correctPercent - incorrectPercent, 0);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-sm text-slate-900 truncate">{course.name}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {course.correctas}/{course.total} correctas
                        </span>
                      </div>

                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${correctPercent}%` }} />
                        <div className="h-full bg-amber-400" style={{ width: `${incorrectPercent}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${notSeenPercent}%` }} />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Respondidas:{" "}
                          <span className="font-semibold">{course.correctas + course.incorrectas}</span> /{" "}
                          {course.total}
                        </span>
                        <span>{correctPercent}% correcto</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ✅ PRÁCTICA ACTIVA / SIN PRÁCTICA (spec exacta) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
          {data.activePractice ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Práctica activa</p>

              <p className="mt-2 text-sm text-gray-800 font-semibold">{practiceTitle}</p>

              <p className="mt-1 text-xs text-gray-500">{topicsLabel}</p>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 transition-all" style={{ width: `${practicePct}%` }} />
                </div>

                <p className="mt-1 text-xs text-gray-600">
                  Preguntas respondidas: <span className="font-semibold">{answered}</span> / {total}
                </p>

                <p className="mt-2 text-[11px] text-gray-500">
                  Solo puedes tener una práctica activa a la vez. Si inicias una nueva, la actual se pausará.
                </p>
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <button className="px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
                  Continuar práctica
                </button>

                <button className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-800 bg-white hover:bg-slate-50 transition">
                  Iniciar nueva práctica
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin práctica activa</p>

              <p className="mt-1 text-sm text-gray-600">
                No tienes repasos en curso. Puedes crear una nueva práctica desde cualquier curso.
              </p>

              <button className="mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
                Iniciar nueva práctica
              </button>
            </>
          )}
        </section>
      </main>
    </>
  );
}
