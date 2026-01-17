import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getStudioPathForUniversityId } from "@/lib/studio/studio-path";
import EditorClient from "../EditorClient";
import EditSimulacroButton from "./EditSimulacroButton"; // ðŸ‘ˆ SOLO ESTO NUEVO

type PageProps = { params: Promise<{ uni: string; courseId: string }> };

type TopicRow = {
  id: string;
  title: string;
  order_number?: number | null;
};

type QuestionPreviewRow = {
  id: string;
  text: string | null;
  topic_id: string;
};

export default async function CoursePage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni, courseId } = await params;

  // 1) SesiÃ³n
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/login");

  // 2) Perfil y rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/dashboard/main");

  const fallbackPath = profile.university_id
    ? await getStudioPathForUniversityId(supabase, profile.university_id)
    : "/dashboard/main";

  // 3) Universidad por cÃ³digo
  const uniCode = (uni || "").toLowerCase();

  const { data: uniRow } = await supabase
    .from("universities")
    .select("id, code, name")
    .ilike("code", uniCode)
    .single();

  if (!uniRow) redirect(fallbackPath);

  // 4) Bloqueo por universidad
  if (!profile.university_id || profile.university_id !== uniRow.id) {
    redirect(fallbackPath);
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
  const topicIds = (topics as TopicRow[] | null)?.map((t) => t.id) ?? [];

  const { data: questions } = topicIds.length
    ? await supabase
        .from("questions")
        .select("id, text, topic_id, created_at")
        .in("topic_id", topicIds)
        .order("created_at", { ascending: false })
        .limit(30)
    : { data: [] as QuestionPreviewRow[] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/studio/${uniCode}/editor`}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            â† Volver a cursos
          </Link>

          <h1 className="text-2xl font-bold mt-1">{course.name}</h1>
          <p className="text-sm text-slate-600">
            Universidad: <span className="font-semibold">{uniRow.name}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Paso 2: elige un tema (topic) para entrar a sus preguntas.
          </p>
        </div>

        {/* ðŸ”¥ REEMPLAZO LIMPIO */}
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
            Este curso aÃºn no tiene temas.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(topics as TopicRow[] | null)?.map((t) => (
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
            AÃºn no hay preguntas en los temas de este curso.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {(questions as QuestionPreviewRow[] | null)?.map((q) => (
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

