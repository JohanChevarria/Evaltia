import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionsEditorClient from "./QuestionsEditorClient";

type PageProps = {
  params: Promise<{ uni: string; courseId: string; topicId: string }>;
};

export default async function TopicEditorPage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni, courseId, topicId } = await params;

  // 1) Sesión
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/auth/login");

  // 2) Perfil (admin + universidad)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/dashboard/main");

  // 3) Universidad por URL /studio/usmp/...
  const uniCode = (uni || "").toLowerCase();

  const { data: uniRow } = await supabase
    .from("universities")
    .select("id, code, name")
    .ilike("code", uniCode)
    .single();

  if (!uniRow) redirect(`/studio/${uniCode}`);
  if (!profile.university_id || profile.university_id !== uniRow.id) {
    redirect(`/studio/${uniCode}`);
  }

  // 4) Topic (título)
  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, course_id")
    .eq("id", topicId)
    .single();

  if (!topic) redirect(`/studio/${uniCode}/editor/${courseId}`);

  // 5) Conceptos del topic (tus “bloques”)
  const { data: concepts } = await supabase
    .from("concepts")
    .select("id, title, order_number")
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("order_number", { ascending: true });

  // 6) Preguntas del topic (tu BD real)
  // ✅ según lo que dijiste: id, topic_id, text, explanation, created_at, university_id, concept_id
  const { data: questions } = await supabase
    .from("questions")
    .select("id, topic_id, text, explanation, created_at, university_id, concept_id")
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("created_at", { ascending: false });

  const questionIds = (questions ?? []).map((q: any) => q.id);

  // 7) Opciones (si tu tabla options existe)
  const { data: options } = questionIds.length
    ? await supabase
        .from("options")
        .select("id, question_id, label, text, is_correct, university_id")
        .in("question_id", questionIds)
        .eq("university_id", uniRow.id)
        .order("label", { ascending: true })
    : { data: [] as any[] };

  return (
    <QuestionsEditorClient
      uniCode={uniCode}
      universityId={uniRow.id}
      courseId={courseId}
      topicId={topicId}
      topicTitle={topic.title}
      concepts={(concepts ?? []) as any[]}
      questions={(questions ?? []) as any[]}
      options={(options ?? []) as any[]}
    />
  );
}
