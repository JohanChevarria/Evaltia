import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExamQuestion, SessionPayload } from "./types";

type QuestionPosition = { question_id: string; position: number };

export async function getSessionPayload(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string
): Promise<SessionPayload | null> {
  const { data: session, error: sessionError } = await supabase
    .from("exam_sessions")
    .select(
      "id, user_id, university_id, course_id, name, mode, topic_ids, question_count, timed, time_limit_minutes, current_index, flagged_question_ids, created_at, finished_at"
    )
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionError || !session) return null;

  const { data: positionRows } = await supabase
    .from("exam_session_questions")
    .select("question_id, position")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });

  const questionPositions = (positionRows ?? []) as QuestionPosition[];
  const questionIds = questionPositions.map((row) => row.question_id);

  if (!questionIds.length) {
    return {
      session: {
        ...session,
        topic_ids: (session as any).topic_ids ?? [],
        flagged_question_ids: (session as any).flagged_question_ids ?? [],
      },
      questions: [],
      answers: [],
      notes: [],
    };
  }

  // ✅ FIX: no seleccionar columnas que NO existen (image_url, hint)
  const { data: questionRows, error: qError } = await supabase
    .from("questions")
    .select("id, topic_id, course_id, university_id, text")
    .in("id", questionIds);

  if (qError) {
    console.error("Error loading questions:", qError);
  }

  const { data: optionRows } = await supabase
    .from("options")
    .select("id, question_id, label, text, explanation, is_correct")
    .in("question_id", questionIds);

  const { data: answers } = await supabase
    .from("exam_answers")
    .select("id, question_id, selected_option_label, is_correct, attempt, created_at")
    .eq("session_id", sessionId)
    .order("attempt", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: notes } = await supabase
    .from("exam_notes")
    .select("id, question_id, text, updated_at")
    .eq("session_id", sessionId);

  const optionsByQ = new Map<string, any[]>();
  for (const opt of optionRows ?? []) {
    const list = optionsByQ.get(opt.question_id) ?? [];
    list.push({
      id: opt.id,
      label: (opt as any).label ?? "",
      text: (opt as any).text ?? "",
      explanation: (opt as any).explanation ?? null,
      is_correct: !!(opt as any).is_correct,
    });
    optionsByQ.set(opt.question_id, list);
  }

  for (const [qid, list] of optionsByQ.entries()) {
    list.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    optionsByQ.set(qid, list);
  }

  const questions: ExamQuestion[] = [];
  const questionMap = new Map<string, any>();
  for (const q of questionRows ?? []) {
    if (!q?.id) continue;
    questionMap.set(q.id, q);
  }

  for (const row of questionPositions) {
    const q = questionMap.get(row.question_id);
    if (!q) continue;
    questions.push({
      id: q.id,
      topic_id: (q as any).topic_id,
      course_id: (q as any).course_id,
      university_id: (q as any).university_id,
      text: (q as any).text ?? "",
      // ✅ FIX: como esas columnas no existen en questions, se retorna null
      image_url: null,
      hint: null,
      position: row.position,
      options: optionsByQ.get(q.id) ?? [],
    });
  }

  return {
    session: {
      ...session,
      topic_ids: (session as any).topic_ids ?? [],
      flagged_question_ids: (session as any).flagged_question_ids ?? [],
    },
    questions,
    answers: (answers ?? []) as any[],
    notes: (notes ?? []) as any[],
  };
}
