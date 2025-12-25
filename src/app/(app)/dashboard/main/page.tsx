// src/app/(app)/dashboard/main/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingCoursesOverlay from "@/app/(onboarding)/courses/OnboardingCoursesOverlay";

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

export default function DashboardMainPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const didNavigateRef = useRef(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setCheckingSession(true);
        setErrorMsg(null);

        // 1) User
        const { data, error } = await supabase.auth.getUser();
        if (cancelled) return;

        const user = data?.user;

        if (error || !user) {
          // Si el middleware funciona, aquí no deberías llegar.
          // Pero igual no navegamos para evitar loops.
          setErrorMsg(error?.message ?? "No hay sesión activa.");
          setCheckingSession(false);
          setDashboardData(null);
          return;
        }

        setUserId(user.id);

        // 2) Profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, onboarding_completed, role, university_id, university_onboarding_completed")
          .eq("id", user.id)
          .single();

        if (cancelled) return;

        if (profileError || !profile) {
          setErrorMsg(profileError?.message ?? "No se pudo cargar el perfil (profiles).");
          setCheckingSession(false);
          setDashboardData(null);
          return;
        }

        // Admins → studio
        const role = (profile as any).role;
        if (role === "admin" || role === "superadmin") {
          if (!didNavigateRef.current) {
            didNavigateRef.current = true;
            router.replace("/admin-studio");
          }
          // ✅ Igual corta carga para evitar blanco si demora la navegación
          setCheckingSession(false);
          return;
        }

        const nameFromProfile =
          (profile as any).first_name ||
          (user.user_metadata as any)?.first_name ||
          user.email?.split("@")[0] ||
          "Estudiante";

        const uniId = ((profile as any).university_id ?? null) as string | null;
        setUniversityId(uniId);

        // ✅ Gate universidad
        if (!(profile as any).university_onboarding_completed) {
          if (!didNavigateRef.current) {
            didNavigateRef.current = true;
            router.replace("/onboarding/university");
          }
          setCheckingSession(false);
          return;
        }

        // ✅ Onboarding cursos → overlay
        if (!(profile as any).onboarding_completed) {
          setNeedsOnboarding(true);

          setDashboardData({
            userName: nameFromProfile,
            globalCorrectas: 0,
            globalIncorrectas: 0,
            globalTotal: 0,
            courses: [],
            activePractice: undefined,
          });

          setCheckingSession(false);
          return;
        }

        // 3) Progress
        const { data: progressRows, error: progressError } = await supabase
          .from("course_progress")
          .select("id, course_name, correctas, incorrectas, total")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(3);

        if (cancelled) return;

        if (progressError) {
          // No mates el dashboard por esto; solo muestra vacío y loguea error
          console.error(progressError);
        }

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

        setNeedsOnboarding(false);
        setDashboardData({
          userName: nameFromProfile,
          globalCorrectas,
          globalIncorrectas,
          globalTotal,
          courses,
          activePractice: undefined,
        });

        setCheckingSession(false);
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message ?? "Error inesperado cargando el dashboard.");
        setCheckingSession(false);
        setDashboardData(null);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  // ✅ Loading
  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-6 w-6 rounded-full border border-slate-300 border-t-transparent animate-spin" />
      </main>
    );
  }

  // ✅ Error visible (antes te quedabas “en blanco”)
  if (errorMsg) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-slate-900">
          <p className="text-sm font-semibold">No se pudo cargar el dashboard</p>
          <pre className="mt-3 text-xs whitespace-pre-wrap text-slate-600">{errorMsg}</pre>
          <button
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  // ✅ Si no hay data (por ejemplo mientras navega), no rompas
  if (!dashboardData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-600">Redirigiendo…</div>
      </main>
    );
  }

  const data = dashboardData;

  const globalRespondidas = data.globalCorrectas + data.globalIncorrectas;
  const globalPercent = data.globalTotal > 0 ? Math.round((globalRespondidas / data.globalTotal) * 100) : 0;

  const topicsLabel =
    data.activePractice?.topics.length === 1
      ? data.activePractice.topics[0]
      : `${data.activePractice?.topics.length ?? 0} temas seleccionados`;

  const practiceTitle = `Práctica personalizada: ${data.activePractice?.courseName}`;

  return (
    <>
      <main className="space-y-8 pb-12">
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 text-gray-900">
          <p className="text-sm text-gray-500">Bienvenido</p>
          <h1 className="text-2xl font-bold">{data.userName ?? "Estudiante"}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualiza tu progreso global y tus cursos activos. Retoma tu práctica o inicia un nuevo simulacro cuando
            quieras.
          </p>
        </section>

        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full md:w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progreso total</p>

            <div className="relative w-44 h-44 rounded-full border-4 border-white shadow-inner flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-slate-100 to-slate-200" />
              <div className="relative z-10 text-center">
                <p className="text-3xl font-bold text-slate-900">{globalPercent}%</p>
                <p className="text-xs text-gray-600 mt-1">
                  {globalRespondidas} / {data.globalTotal} preguntas respondidas
                </p>
              </div>
            </div>

            <div className="mt-4 w-full text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" /> Correctas
                </span>
                <span className="font-semibold">{data.globalCorrectas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" /> Incorrectas
                </span>
                <span className="font-semibold">{data.globalIncorrectas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" /> No vistas
                </span>
                <span className="font-semibold">
                  {Math.max(data.globalTotal - data.globalCorrectas - data.globalIncorrectas, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Cursos activos</h2>
            </div>

            {data.courses.length === 0 ? (
              <p className="text-xs text-gray-500">
                Aún no tienes cursos activos. Una vez completes tu selección de cursos, aparecerán aquí.
              </p>
            ) : (
              <div className="space-y-4">
                {data.courses.map((course) => {
                  const correctPercent = course.total > 0 ? Math.round((course.correctas / course.total) * 100) : 0;
                  const incorrectPercent = course.total > 0 ? Math.round((course.incorrectas / course.total) * 100) : 0;
                  const notSeenPercent = Math.max(100 - correctPercent - incorrectPercent, 0);

                  return (
                    <div key={course.id} className="bg-white rounded-xl border border-slate-100 shadow-xs p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-slate-900">{course.name}</p>
                        <span className="text-xs text-gray-500">
                          {course.correctas}/{course.total} correctas
                        </span>
                      </div>

                      <div className="mt-2 h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-emerald-500" style={{ width: `${correctPercent}%` }} />
                        <div className="h-full bg-amber-400" style={{ width: `${incorrectPercent}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${notSeenPercent}%` }} />
                      </div>

                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>
                          Respondidas: <span className="font-semibold">{course.correctas + course.incorrectas}</span> / {course.total}
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

        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
          {data.activePractice ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Práctica activa</p>
              <p className="mt-2 text-sm text-gray-800 font-semibold">{practiceTitle}</p>
              <p className="mt-1 text-xs text-gray-500">{topicsLabel}</p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sin práctica activa</p>
              <p className="mt-1 text-sm text-gray-600">
                No tienes repasos en curso. Puedes crear una nueva práctica desde cualquier curso.
              </p>
            </>
          )}
        </section>
      </main>

      <OnboardingCoursesOverlay
        open={needsOnboarding && !!userId}
        userId={userId!}
        universityId={universityId}
        userName={data.userName ?? "Estudiante"}
        onSaved={() => {
          setNeedsOnboarding(false);
          if (!didNavigateRef.current) {
            didNavigateRef.current = true;
            router.replace("/dashboard/main");
          }
        }}
        onMissingUniversity={() => {
          if (!didNavigateRef.current) {
            didNavigateRef.current = true;
            router.replace("/onboarding/university");
          }
        }}
      />
    </>
  );
}
