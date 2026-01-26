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

  /** ✅ FIX: tipado correcto */
  matching_key: number[] | null;
};

type OptionRow = {
  id: string;
  question_id: string;
  label: string;
  text: string | null;
  is_correct: boolean | null;
  university_id: string;
};

/** ✅ FIX: normalizador seguro para matching_key */
function normalizeMatchingKey(raw: unknown): number[] | null {
  if (!Array.isArray(raw)) return null;
  const nums = raw
    .map((x) => {
      const n = typeof x === "number" ? x : Number(x);
      return Number.isFinite(n) ? n : null;
    })
    .filter((x): x is number => x !== null);

  // si está vacío, mejor null
  return nums.length > 0 ? nums : null;
}

export default async function TopicEditorPage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni, courseId, topicId } = await params;

  // 1) Sesión
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

  // 4) Topic (título)
  const { data: topic } = await supabase
    .from("topics")
    .select("id, title, course_id")
    .eq("id", topicId)
    .single();

  if (!topic) redirect(`/studio/${uniCode}/editor/${courseId}`);

  // 5) Conceptos del topic
  const { data: concepts, error: conceptsError } = await supabase
    .from("concepts")
    .select("id, title, order_number")
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("order_number", { ascending: true });

  console.log("SERVER DEBUG conceptsError:", conceptsError);

  // 6) Preguntas del topic (incluye matching_key)
  const { data: questionsRaw, error: questionsError } = await supabase
    .from("questions")
    .select(
      "id, topic_id, text, created_at, university_id, concept_id, difficulty, question_type, matching_data, matching_key"
    )
    .eq("topic_id", topicId)
    .eq("university_id", uniRow.id)
    .order("created_at", { ascending: false });

  console.log("SERVER DEBUG questionsError:", questionsError);

  // ✅ Normaliza matching_key para que el client reciba number[] | null
  const questions: QuestionRow[] = (questionsRaw ?? []).map((q: any) => ({
    id: q.id,
    topic_id: q.topic_id,
    text: q.text ?? null,
    created_at: q.created_at,
    university_id: q.university_id,
    concept_id: q.concept_id ?? null,
    difficulty: q.difficulty ?? null,
    question_type: q.question_type ?? null,
    matching_data: (q.matching_data ?? null) as Record<string, unknown> | null,
    matching_key: normalizeMatchingKey(q.matching_key),
  }));

  // ✅ DEBUG temporal (server)
  console.log("SERVER DEBUG topicId:", topicId);
  console.log("SERVER DEBUG uniRow.id:", uniRow?.id);
  console.log("SERVER DEBUG questions count:", questions.length);
  console.log("SERVER DEBUG questions sample:", questions.slice(0, 2));

  const nonMatchingIds = questions
    .filter((q) => q.question_type !== "matching")
    .map((q) => q.id);

  // 7) Opciones
  const { data: options } = nonMatchingIds.length
    ? await supabase
        .from("options")
        .select("id, question_id, label, text, is_correct, university_id")
        .in("question_id", nonMatchingIds)
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
      questions={questions}
      options={(options ?? []) as OptionRow[]}
    />
  );
}
