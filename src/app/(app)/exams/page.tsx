import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  name: string;
  mode: string;
  question_count: number;
  created_at: string;
  finished_at: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}

export default async function ExamsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("exam_sessions")
    .select("id, name, mode, question_count, created_at, finished_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="relative min-h-screen text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
            linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
          `,
          backgroundBlendMode: "soft-light, screen, normal",
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-6">
        <section className="rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-white/20 p-6 text-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Examenes</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">Tus sesiones</h1>
              <p className="text-sm text-slate-600 mt-1">
                Crea un examen desde cualquier curso o abre una sesi\u00f3n previa para retomarla.
              </p>
            </div>

            <Link
              href="/dashboard/main"
              className="rounded-full bg-white/90 text-slate-800 border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white"
            >
              Ir al dashboard
            </Link>
          </div>

          <div className="mt-6">
            {sessions && sessions.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {sessions.map((session) => {
                  const finished = !!session.finished_at;
                  const modeLabel =
                    session.mode === "simulacro"
                      ? "Simulacro"
                      : session.mode === "repaso"
                        ? "Repaso"
                        : "Practica";

                  return (
                    <Link
                      key={session.id}
                      href={`/exams/${session.id}`}
                      className="block rounded-2xl bg-white/90 border border-slate-100 shadow-sm hover:shadow-md transition p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">{modeLabel}</p>
                          <p className="text-base font-semibold text-slate-900 line-clamp-2">
                            {session.name || "Examen"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full border ${
                            finished
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-indigo-200 bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {finished ? "Finalizado" : "En curso"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                        <span>Preguntas: {session.question_count}</span>
                        <span>{formatDate(session.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-white/90 p-4 text-sm text-slate-700">
                A\u00fan no tienes sesiones de examen. Entra a un curso y usa &ldquo;Crear examen&rdquo; para comenzar.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
