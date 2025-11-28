"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabase";

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
  // Solo PRÁCTICA personalizada (no simulacros, no repasos progresivos)
  activePractice?: {
    courseName: string;
    topics: string[]; // nombres de los temas seleccionados
    answered: number;
    total: number;
  };
};

// MOCK temporal. Luego viene de la BD.
const MOCK_DATA: DashboardData = {
  userName: "Johan",
  globalCorrectas: 80,
  globalIncorrectas: 40,
  globalTotal: 150,
  courses: [
    { id: "1", name: "Anatomía", correctas: 50, incorrectas: 20, total: 100 },
    { id: "2", name: "Histología", correctas: 20, incorrectas: 10, total: 60 },
    { id: "3", name: "Embriología", correctas: 10, incorrectas: 5, total: 40 },
  ],
  activePractice: {
    courseName: "Histología",
    topics: ["Tejido conectivo", "Tejido epitelial"], // 1 o más temas
    answered: 14,
    total: 50,
  },
};

export default function DashboardMainPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      // ❌ NO hay sesión → mandar a login
      if (error || !user) {
        router.replace("/login");
        return;
      }

      // ❌ Hay sesión pero correo NO confirmado → mandar a check-email
      if (!(user as any).email_confirmed_at) {
        router.replace("/auth/check-email");
        return;
      }

      // ✅ Logueado + correo confirmado → puede ver el hub
      setCheckingSession(false);
    }

    checkSession();
  }, [router]);

  // ⬇⬇⬇ AQUÍ CAMBIÉ LO DEL MENSAJE
  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-6 w-6 rounded-full border border-slate-300 border-t-transparent animate-spin" />
      </main>
    );
  }
  // ⬆⬆⬆ YA NO HAY TEXTO, SOLO UN SPINNER DISCRETO

  // A partir de aquí, tu código tal cual 👇
  const data = MOCK_DATA;

  const globalRespondidas = data.globalCorrectas + data.globalIncorrectas;
  const globalPercent = Math.round(
    (globalRespondidas / data.globalTotal) * 100
  );

  const topicsLabel =
    data.activePractice?.topics.length === 1
      ? data.activePractice.topics[0]
      : `${data.activePractice?.topics.length} temas seleccionados`;

  const practiceTitle = `Práctica personalizada: ${data.activePractice?.courseName}`;

  return (
    <main className="space-y-8 pb-12">
      {/* Bienvenida */}
      <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5 text-gray-900">
        <p className="text-sm text-gray-500">Bienvenido</p>
        <h1 className="text-2xl font-bold">{data.userName ?? "Estudiante"}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visualiza tu progreso global y tus cursos activos. Retoma tu práctica
          o inicia un nuevo simulacro cuando quieras.
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
              <p className="text-3xl font-bold text-slate-900">
                {globalPercent}%
              </p>
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
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                No vistas
              </span>
              <span className="font-semibold">
                {Math.max(
                  data.globalTotal -
                    data.globalCorrectas -
                    data.globalIncorrectas,
                  0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Cursos activos */}
        <div className="flex-1 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Cursos activos
            </h2>

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

          <div className="space-y-4">
            {data.courses.map((course) => {
              const correctPercent = Math.round(
                (course.correctas / course.total) * 100
              );
              const incorrectPercent = Math.round(
                (course.incorrectas / course.total) * 100
              );
              const notSeenPercent = Math.max(
                100 - correctPercent - incorrectPercent,
                0
              );

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-100 shadow-xs p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-slate-900">
                      {course.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {course.correctas}/{course.total} correctas
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${correctPercent}%` }}
                    />
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${incorrectPercent}%` }}
                    />
                    <div
                      className="h-full bg-rose-500"
                      style={{ width: `${notSeenPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      Respondidas:{" "}
                      <span className="font-semibold">
                        {course.correctas + course.incorrectas}
                      </span>{" "}
                      / {course.total}
                    </span>
                    <span>{correctPercent}% correcto</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Práctica activa */}
      <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-5">
        {data.activePractice ? (
          <>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Práctica activa
            </p>

            <p className="mt-2 text-sm text-gray-800 font-semibold">
              {practiceTitle}
            </p>
            <p className="mt-1 text-xs text-gray-500">{topicsLabel}</p>

            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{
                    width: `${
                      (data.activePractice.answered /
                        data.activePractice.total) *
                      100
                    }%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Preguntas respondidas:{" "}
                <span className="font-semibold">
                  {data.activePractice.answered}
                </span>{" "}
                / {data.activePractice.total}
              </p>
            </div>

            <p className="mt-2 text-[11px] text-gray-500">
              Solo puedes tener una práctica activa. Si inicias una nueva,
              esta se reemplazará automáticamente.
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sin práctica activa
            </p>
            <p className="mt-1 text-sm text-gray-600">
              No tienes repasos en curso. Puedes crear una nueva práctica desde
              cualquier curso.
            </p>
            <button className="mt-4 px-4 py-2 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Iniciar nueva práctica
            </button>
          </>
        )}
      </section>
    </main>
  );
}