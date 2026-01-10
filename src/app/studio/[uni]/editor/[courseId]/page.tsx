import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditorClient from "../EditorClient";
import EditSimulacroButton from "./EditSimulacroButton"; // 👈 SOLO ESTO NUEVO

type PageProps = { params: Promise<{ uni: string; courseId: string }> };

export default async function CoursePage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni, courseId } = await params;

  // 1) Sesión
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/auth/login");

  // 2) Perfil y rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/dashboard/main");

  // 3) Universidad por código
  const uniCode = (uni || "").toLowerCase();

  const { data: uniRow } = await supabase
    .from("universities")
    .select("id, code, name")
    .ilike("code", uniCode)
    .single();

  if (!uniRow) redirect("/admin-studio");

  // 4) Bloqueo por universidad
  if (!profile.university_id || profile.university_id !== uniRow.id) {
    redirect("/admin-studio");
  }

  // 5) Traer curso (MISMO QUERY QUE ANTES)
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, name, description")
    .eq("id", courseId)
    .eq("university_id", uniRow.id)
    .single();

  if (courseError || !course) redirect(`/studio/${uniCode}/editor`);

  // 6) Topics del curso
  const { data: topics } = await supabase
    .from("topics")
    .select("id, title, order_number")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });

  // 7) Preview preguntas
  const topicIds = (topics ?? []).map((t: any) => t.id);

  const { data: questions } = topicIds.length
    ? await supabase
        .from("questions")
        .select("id, text, topic_id, created_at")
        .in("topic_id", topicIds)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] as any[] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/studio/${uniCode}/editor`}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Volver a cursos
          </Link>

          <h1 className="text-2xl font-bold mt-1">{course.name}</h1>
          <p className="text-sm text-slate-600">
            Universidad: <span className="font-semibold">{uniRow.name}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Paso 2: elige un tema (topic) para entrar a sus preguntas.
          </p>
        </div>

        {/* 🔥 REEMPLAZO LIMPIO */}
        <EditSimulacroButton
          courseId={courseId}
          initialQuestions={40}
          initialMinutes={60}
        />
      </div>

      {/* Realtime listener */}
      <EditorClient universityId={uniRow.id} />

      {/* Topics */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold">2) Temas (Topics)</h2>

        {(topics?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500 mt-3">
            Este curso aún no tiene temas.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(topics ?? []).map((t: any) => (
              <Link
                key={t.id}
                href={`/studio/${uniCode}/editor/${courseId}/topic/${t.id}`}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-4 transition"
              >
                <p className="font-semibold text-slate-900">
                  {t.order_number ?? 0}. {t.title}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Click para ver preguntas
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Preguntas recientes */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold">Vista previa: preguntas recientes</h2>

        {(questions?.length ?? 0) === 0 ? (
          <p className="text-sm text-slate-500 mt-3">
            Aún no hay preguntas en los temas de este curso.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {(questions ?? []).map((q: any) => (
              <div
                key={q.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {q.text}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  topic_id: <span className="font-mono">{q.topic_id}</span>
                </p>
              </div>
            ))}
            <p className="text-xs text-slate-400">
              Mostrando hasta 30 preguntas recientes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
