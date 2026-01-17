import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import QuestionsEditorClient from "./QuestionsEditorClient";

type PageProps = {
  params: Promise<{ uni: string; courseId: string; topicId: string }>;
};

type ConceptRow = {
  id: string;
  title: string;
  order_number?: number | null;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  text: string | null;
  created_at: string;
  university_id: string;
  concept_id: string | null;
  difficulty: string | null;
  question_type: string | null;
  matching_data: Record<string, unknown> | null;
};

type OptionRow = {
  id: string;
  question_id: string;
  label: string;
  text: string | null;
  is_correct: boolean | null;
  university_id: string;
};

export default async function TopicEditorPage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni, courseId, topicId } = await params;

  // 1) SesiÃ³n
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/login");

  // 2) Perfil (admin + universidad)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
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

  // 4) Topic (tÃ­tulo)
  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, course_id")
    .eq("id", topicId)
    .single();

  if (!topic) redirect(`/studio/${uniCode}/editor/${courseId}`);

  // 5) Conceptos del topic (tus â€œbloquesâ€)
  const { data: concepts, error: conceptsError } = await supabase
    .from("concepts")
    .select("id, title, order_number")
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("order_number", { ascending: true });

  console.log("SERVER DEBUG conceptsError:", conceptsError);

  // 6) Preguntas del topic (âœ… incluye difficulty)
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select(
      "id, topic_id, text, created_at, university_id, concept_id, difficulty, question_type, matching_data"
    )
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("created_at", { ascending: false });

  console.log("SERVER DEBUG questionsError:", questionsError);

  // âœ… DEBUG temporal (server)
  console.log("SERVER DEBUG topicId:", topicId);
  console.log("SERVER DEBUG uniRow.id:", uniRow?.id);
  console.log("SERVER DEBUG questions count:", (questions ?? []).length);
  console.log("SERVER DEBUG questions sample:", (questions ?? []).slice(0, 2));

  const questionIds = (questions ?? []).map((q: QuestionRow) => q.id);

  // 7) Opciones (si tu tabla options existe)
  const { data: options } = questionIds.length
    ? await supabase
        .from("options")
        .select("id, question_id, label, text, is_correct, university_id")
        .in("question_id", questionIds)
        .eq("university_id", uniRow.id)
        .order("label", { ascending: true })
    : { data: [] as OptionRow[] };

  return (
    <QuestionsEditorClient
      uniCode={uniCode}
      universityId={uniRow.id}
      courseId={courseId}
      topicId={topicId}
      topicTitle={topic.title}
      concepts={(concepts ?? []) as ConceptRow[]}
      questions={(questions ?? []) as QuestionRow[]}
      options={(options ?? []) as OptionRow[]}
    />
  );
}

