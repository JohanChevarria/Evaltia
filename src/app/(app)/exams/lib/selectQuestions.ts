// src/app/(app)/exams/lib/selectQuestions.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { shuffleWithSeed } from "./shuffle";
import type { ExamQuestion } from "./types";

type MinimalQuestion = Pick<
  ExamQuestion,
  "id" | "topic_id" | "course_id" | "university_id" | "text" | "image_url" | "hint"
>;

type Params = {
  supabase: SupabaseClient;
  topicIds: string[];
  courseId?: string | null;
  universityId?: string | null;
  limit: number;
  seed: string;
};

type QuestionRow = {
  id: string;
  topic_id: string | null;
  course_id: string | null;
  university_id: string | null;
  text: string | null;
};

export async function selectQuestions({
  supabase,
  topicIds,
  courseId,
  universityId,
  limit,
  seed,
}: Params): Promise<MinimalQuestion[]> {
  if (!topicIds.length || limit <= 0) return [];

  const maxLimit = Math.max(1, Math.min(limit, 500));

  // 1) Intentar RPC (si existe)
  const rpcParams: Record<string, unknown> = {
    topic_ids: topicIds,
    limit_count: maxLimit,
    p_course_id: courseId ?? null,
    p_university_id: universityId ?? null,
  };

  const { data: rpcIds, error: rpcError } = await supabase.rpc("get_random_questions", rpcParams);

  const questionIds = (rpcIds ?? [])
    .map((row: unknown) => (row as { id?: string }).id ?? "")
    .filter(Boolean);

  // 2) Si RPC falló o vino vacío => fallback a query directa
  if (rpcError || questionIds.length === 0) {
    const runQuery = async (withUniversity: boolean) => {
      let query = supabase
        .from("questions")
        .select("id, topic_id, course_id, university_id, text")
        .in("topic_id", topicIds)
        .limit(1000);

      if (courseId) query = query.eq("course_id", courseId);
      if (withUniversity && universityId) query = query.eq("university_id", universityId);

      const { data, error } = await query;
      return { data, error };
    };

    // ✅ Primero intenta con universityId (si existe)
    let { data: fallbackQuestions, error: fallbackError } = await runQuery(true);

    // ✅ Si no hay nada, intenta SIN universityId (para el caso university_id = NULL o mismatch)
    if ((!fallbackQuestions || fallbackQuestions.length === 0) && universityId) {
      const second = await runQuery(false);
      // solo reemplaza si el segundo intento sí trajo algo o si el primero tuvo error raro
      if (second.data && second.data.length > 0) {
        fallbackQuestions = second.data;
        fallbackError = second.error;
      }
    }

    if (fallbackError || !fallbackQuestions || fallbackQuestions.length === 0) return [];

    const mapped: MinimalQuestion[] = (fallbackQuestions as QuestionRow[]).map((q) => ({
      id: q.id,
      topic_id: q.topic_id ?? "",
      course_id: q.course_id ?? null,
      university_id: q.university_id ?? null,
      text: q.text ?? "",
      image_url: null,
      hint: null,
    }));

    const shuffled = shuffleWithSeed(mapped, seed);
    return shuffled.slice(0, maxLimit);
  }

  // 3) RPC devolvió ids => traemos filas en ese set de ids
  const { data: questionRows, error: rowsError } = await supabase
    .from("questions")
    .select("id, topic_id, course_id, university_id, text")
    .in("id", questionIds);

  if (rowsError || !questionRows || questionRows.length === 0) return [];

  const byId = new Map<string, MinimalQuestion>();
  for (const q of questionRows as QuestionRow[]) {
    if (!q?.id) continue;
    byId.set(q.id, {
      id: q.id,
      topic_id: q.topic_id ?? "",
      course_id: q.course_id ?? null,
      university_id: q.university_id ?? null,
      text: q.text ?? "",
      image_url: null,
      hint: null,
    });
  }

  const ordered = questionIds
    .map((id: string) => byId.get(id))
    .filter((q: MinimalQuestion | undefined): q is MinimalQuestion => Boolean(q));

  return ordered.slice(0, maxLimit);
}
