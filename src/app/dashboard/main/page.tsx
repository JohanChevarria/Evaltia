// src/app/dashboard/main/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

type DbCourse = {
  id: string;
  name: string;
  description: string | null;
};

export default function DashboardMainPage() {
  const router = useRouter();

  // ✅ importante: que el cliente no se recree en cada render
  const supabase = useMemo(() => createClient(), []);

  const [checkingSession, setCheckingSession] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Onboarding overlay
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<DbCourse[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setCheckingSession(true);
      setOnboardingError(null);

      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      // ❌ NO hay sesión → mandar a login
      if (error || !user) {
        if (!cancelled) router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      // ✅ Leer perfil (traemos role)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, onboarding_completed, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        if (!cancelled) router.replace("/auth/login");
        return;
      }

      // ✅ SI ES ADMIN → NO USA DASHBOARD DE ESTUDIANTE, VA AL CMS
      if ((profile as any).role === "admin") {
        if (!cancelled) router.replace("/admin-studio");
        return;
      }

      const nameFromProfile =
        (profile as any).first_name ||
        (user.user_metadata as any)?.first_name ||
        user.email?.split("@")[0] ||
        "Estudiante";

      // ✅ Solo estudiantes: si NO ha completado onboarding → overlay
      if (!(profile as any).onboarding_completed) {
        if (cancelled) return;

        setNeedsOnboarding(true);

        // Dashboard vacío pero con nombre
        const emptyData: DashboardData = {
          userName: nameFromProfile,
          globalCorrectas: 0,
          globalIncorrectas: 0,
          globalTotal: 0,
          courses: [],
          activePractice: undefined,
        };

        setDashboardData(emptyData);

        // ✅ intentamos traer cursos con description (si existe)
        // Si falla (RLS o columna no existe), mostramos error.
        const tryWithDescription = await supabase
          .from("courses")
          .select("id, name, description")
          .order("name", { ascending: true });

        if (tryWithDescription.error) {
          // fallback: por si "description" no existe
          const tryWithoutDescription = await supabase
            .from("courses")
            .select("id, name")
            .order("name", { ascending: true });

          if (tryWithoutDescription.error) {
            console.error("Error cargando courses:", tryWithoutDescription.error);
            setAvailableCourses([]);
            setOnboardingError(
              `No se pudieron cargar los cursos: ${tryWithoutDescription.error.message}`
            );
          } else {
            const rows = (tryWithoutDescription.data || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              description: null,
            })) as DbCourse[];

            setAvailableCourses(rows);

            if (rows.length === 0) {
              setOnboardingError(
                "No hay cursos disponibles (la tabla courses está vacía o tu RLS está bloqueando el SELECT)."
              );
            }
          }
        } else {
          const rows = (tryWithDescription.data || []) as DbCourse[];
          setAvailableCourses(rows);

          if (rows.length === 0) {
            setOnboardingError(
              "No hay cursos disponibles (la tabla courses está vacía o tu RLS está bloqueando el SELECT)."
            );
          }
        }

        setCheckingSession(false);
        return;
      }

      // ✅ Ya completó onboarding → cargamos course_progress
      const { data: progressRows, error: progressError } = await supabase
        .from("course_progress")
        .select("id, course_name, correctas, incorrectas, total")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3);

      if (progressError) {
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

      const personalizedData: DashboardData = {
        userName: nameFromProfile,
        globalCorrectas,
        globalIncorrectas,
        globalTotal,
        courses,
        activePractice: undefined,
      };

      if (!cancelled) {
        setDashboardData(personalizedData);
        setCheckingSession(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  // Spinner general
  if (checkingSession || !dashboardData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-6 w-6 rounded-full border border-slate-300 border-t-transparent animate-spin" />
      </main>
    );
  }

  const data = dashboardData;
  const globalRespondidas = data.globalCorrectas + data.globalIncorrectas;
  const globalPercent =
    data.globalTotal > 0 ? Math.round((globalRespondidas / data.globalTotal) * 100) : 0;

  const topicsLabel =
    data.activePractice?.topics.length === 1
      ? data.activePractice.topics[0]
      : `${data.activePractice?.topics.length ?? 0} temas seleccionados`;

  const practiceTitle = `Práctica personalizada: ${data.activePractice?.courseName}`;

  // ========================
  // Handlers del onboarding overlay
  // ========================
  function toggleCourse(id: string) {
    setOnboardingError(null);
    setSelectedCourseIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        setOnboardingError("Solo puedes elegir hasta 3 cursos.");
        return prev;
      }
      return [...prev, id];
    });
  }

  async function handleOnboardingSave() {
    setOnboardingError(null);

    if (selectedCourseIds.length === 0) {
      setOnboardingError("Elige al menos 1 curso para continuar.");
      return;
    }

    if (!userId) {
      setOnboardingError("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }

    setOnboardingSaving(true);

    const selectedCourses = availableCourses.filter((c) => selectedCourseIds.includes(c.id));
    const selectedNames = selectedCourses.map((c) => c.name);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        selected_courses: selectedNames,
        onboarding_completed: true,
      })
      .eq("id", userId);

    if (profileError) {
      console.error(profileError);
      setOnboardingError(`Ocurrió un error guardando tu selección: ${profileError.message}`);
      setOnboardingSaving(false);
      return;
    }

    const inserts = selectedNames.map((name) => ({
      user_id: userId,
      course_name: name,
      correctas: 0,
      incorrectas: 0,
      total: 0,
    }));

    const { error: progressError } = await supabase.from("course_progress").insert(inserts);
    if (progressError) console.error(progressError);

    setOnboardingSaving(false);
    setNeedsOnboarding(false);

    // ✅ refresca la data del page
    router.replace("/dashboard/main");
    router.refresh();
  }

  return (
    <>
      <main className="space-y-8 pb-12">
        {/* Bienvenida */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 text-gray-900">
          <p className="text-sm text-gray-500">Bienvenido</p>
          <h1 className="text-2xl font-bold">{data.userName ?? "Estudiante"}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visualiza tu progreso global y tus cursos activos. Retoma tu práctica o inicia un nuevo
            simulacro cuando quieras.
          </p>
        </section>

        {/* Fila principal */}
        <section className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Progreso total */}
          <div className="w-full md:w-80 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Progreso total
            </p>

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
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Correctas
                </span>
                <span className="font-semibold">{data.globalCorrectas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  Incorrectas
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

          {/* Cursos activos */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">Cursos activos</h2>

              <div className="flex items-center gap-3 text-xs text-gray-500">
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
                Aún no tienes cursos activos. Una vez completes tu selección de cursos, aparecerán
                aquí.
              </p>
            ) : (
              <div className="space-y-4">
                {data.courses.map((course) => {
                  const correctPercent =
                    course.total > 0 ? Math.round((course.correctas / course.total) * 100) : 0;
                  const incorrectPercent =
                    course.total > 0 ? Math.round((course.incorrectas / course.total) * 100) : 0;
                  const notSeenPercent = Math.max(100 - correctPercent - incorrectPercent, 0);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-slate-900">{course.name}</p>
                        <span className="text-xs text-gray-500">
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

        {/* Práctica activa */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
          {data.activePractice ? (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Práctica activa</p>
              <p className="mt-2 text-sm text-gray-800 font-semibold">{practiceTitle}</p>
              <p className="mt-1 text-xs text-gray-500">{topicsLabel}</p>

              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{
                      width: `${(data.activePractice.answered / data.activePractice.total) * 100}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Preguntas respondidas: <span className="font-semibold">{data.activePractice.answered}</span> /{" "}
                  {data.activePractice.total}
                </p>
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                Solo puedes tener una práctica activa. Si inicias una nueva, esta se reemplazará automáticamente.
              </p>

              <div className="mt-4 flex gap-3">
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

      {/* OVERLAY DE ONBOARDING */}
      {needsOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center">
              ¿En qué cursos te enfocarás este ciclo?
            </h2>
            <p className="text-sm text-slate-600 text-center max-w-xl mx-auto">
              Selecciona hasta <span className="font-semibold">3 cursos</span> para que Evaltia pueda personalizar tu
              panel, práctica y simulacros. Siempre podrás cambiar esta selección desde tu configuración.
            </p>

            {onboardingError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                {onboardingError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[340px] overflow-y-auto pr-1">
              {availableCourses.map((course) => {
                const selected = selectedCourseIds.includes(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={`text-left rounded-xl border p-4 transition shadow-sm ${
                      selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <h3 className="font-semibold text-slate-900">{course.name}</h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {course.description || "Curso del ciclo de medicina."}
                    </p>
                    <div className="mt-3 text-xs font-semibold text-indigo-600">
                      {selected ? "Seleccionado" : "Elegir"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleOnboardingSave}
                disabled={onboardingSaving}
                className="px-5 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {onboardingSaving ? "Guardando..." : "Guardar y entrar a mi panel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
