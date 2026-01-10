import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { selectQuestions } from "../../lib/selectQuestions";
import { shuffleWithSeed } from "../../lib/shuffle";
import type { ExamMode } from "../../lib/types";

type CreateBody = {
  courseId?: string;
  topicIds?: string[];
  mode?: ExamMode;
  questionCount?: number;
  timed?: boolean;
  timeLimitMinutes?: number | null;
  name?: string;
  course_id?: string;
  topic_id?: string;
  topic_name?: string;
  university_id?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inv\u00e1lido" }, { status: 400 });
  }

  const mode: ExamMode = body.mode ?? "practica";
  const isReview = mode === "repaso" && typeof body.topic_id === "string";

  if (!["practica", "simulacro", "repaso"].includes(mode)) {
    return NextResponse.json({ error: "Modo inv\u00e1lido" }, { status: 400 });
  }

  if (isReview) {
    const topicId = (body.topic_id ?? "").toString().trim();
    if (!topicId) {
      return NextResponse.json({ error: "topic_id requerido" }, { status: 400 });
    }

    const courseId = body.courseId ?? body.course_id ?? "";

    const { data: profile } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", user.id)
      .single();

    const universityId = (profile as any)?.university_id ?? null;

    let topicQuery = supabase.from("topics").select("id, title, course_id").eq("id", topicId);
    if (courseId) {
      topicQuery = topicQuery.eq("course_id", courseId);
    }
    const { data: topicRow, error: topicError } = await topicQuery.single();

    if (topicError || !topicRow?.id) {
      return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });
    }

    const finalCourseId = (topicRow as any).course_id ?? courseId;
    if (!finalCourseId) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    const { data: courseRow, error: courseError } = await supabase
      .from("courses")
      .select("id, university_id")
      .eq("id", finalCourseId)
      .single();

    if (courseError || !courseRow?.id) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
    }

    if (universityId && (courseRow as any).university_id && (courseRow as any).university_id !== universityId) {
      return NextResponse.json({ error: "El curso no pertenece a tu universidad." }, { status: 403 });
    }

    const sessionId = randomUUID();
    const selectedQuestions = await selectQuestions({
      supabase,
      topicIds: [topicId],
      courseId: finalCourseId,
      universityId,
      limit: 10,
      seed: sessionId,
    });

    if (!selectedQuestions.length) {
      return NextResponse.json({ error: "No se encontraron preguntas para el tema elegido." }, { status: 400 });
    }

    const orderedIds = shuffleWithSeed(
      selectedQuestions.map((q) => q.id),
      sessionId
    ).slice(0, 10);

    const finalQuestionIds = orderedIds.length ? orderedIds : selectedQuestions.map((q) => q.id);
    const finalCount = Math.min(10, finalQuestionIds.length);
    const topicName = (body.topic_name ?? "").trim() || (topicRow as any).title || "Repaso";

    const { error: sessionError } = await supabase.from("exam_sessions").insert({
      id: sessionId,
      user_id: user.id,
      university_id: universityId,
      course_id: finalCourseId,
      name: topicName,
      mode: "repaso",
      topic_ids: [topicId],
      question_count: finalCount,
      timed: false,
      time_limit_minutes: null,
      current_index: 0,
      flagged_question_ids: [],
    });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    const questionRows = finalQuestionIds.slice(0, finalCount).map((id, idx) => ({
      session_id: sessionId,
      question_id: id,
      position: idx,
    }));

    const { error: questionsError } = await supabase.from("exam_session_questions").insert(questionRows);

    if (questionsError) {
      await supabase.from("exam_sessions").delete().eq("id", sessionId);
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    return NextResponse.json({ sessionId, questionCount: finalCount });
  }

  const courseId = body.courseId ?? body.course_id ?? "";
  const topicIds = (body.topicIds ?? []).filter(Boolean);
  const name = (body.name ?? "").trim() || (mode === "simulacro" ? "Simulacro" : "Pr\u00e1ctica");

  if (!courseId || topicIds.length === 0) {
    return NextResponse.json({ error: "Faltan curso o temas." }, { status: 400 });
  }

  const requestedCount = Math.max(1, Math.min(500, Number(body.questionCount ?? 10)));
  const timed = mode === "simulacro" ? true : !!body.timed;
  const timeLimit = timed ? Number(body.timeLimitMinutes ?? null) : null;
  const safeTimeLimit = timed && timeLimit && timeLimit > 0 ? Math.min(timeLimit, 500) : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("university_id")
    .eq("id", user.id)
    .single();

  const universityId = (profile as any)?.university_id ?? null;

  const { data: courseRow, error: courseError } = await supabase
    .from("courses")
    .select("id, university_id")
    .eq("id", courseId)
    .single();

  if (courseError || !courseRow?.id) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  if (universityId && (courseRow as any).university_id && (courseRow as any).university_id !== universityId) {
    return NextResponse.json({ error: "El curso no pertenece a tu universidad." }, { status: 403 });
  }

  const { data: topicRows } = await supabase
    .from("topics")
    .select("id, course_id")
    .in("id", topicIds)
    .eq("course_id", courseId);

  const validTopicIds = (topicRows ?? []).map((t: any) => t.id).filter(Boolean);

  if (validTopicIds.length === 0) {
    return NextResponse.json({ error: "No hay temas v\u00e1lidos para este curso." }, { status: 400 });
  }

  const questionsQuery = supabase
    .from("questions")
    .select("id", { count: "exact", head: true })
    .in("topic_id", validTopicIds)
    .eq("course_id", courseId);

  if (universityId) {
    questionsQuery.eq("university_id", universityId);
  }

  const { count: availableCount, error: countError } = await questionsQuery;

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const safeAvailableCount = availableCount ?? 0;

  if (safeAvailableCount === 0) {
    return NextResponse.json({ error: "No se encontraron preguntas para los temas elegidos." }, { status: 400 });
  }

  if (safeAvailableCount < requestedCount) {
    return NextResponse.json(
      {
        error: `Solo hay ${safeAvailableCount} preguntas disponibles para los temas elegidos (necesitas ${requestedCount}).`,
      },
      { status: 400 }
    );
  }

  const sessionId = randomUUID();
  const selectedQuestions = await selectQuestions({
    supabase,
    topicIds: validTopicIds,
    courseId,
    universityId,
    limit: requestedCount,
    seed: sessionId,
  });

  if (!selectedQuestions.length) {
    return NextResponse.json({ error: "No se encontraron preguntas para los temas elegidos." }, { status: 400 });
  }

  const orderedIds = shuffleWithSeed(
    selectedQuestions.map((q) => q.id),
    sessionId
  ).slice(0, requestedCount);

  const finalQuestionIds = orderedIds.length ? orderedIds : selectedQuestions.map((q) => q.id);
  const finalCount = Math.min(requestedCount, finalQuestionIds.length);

  const { error: sessionError } = await supabase.from("exam_sessions").insert({
    id: sessionId,
    user_id: user.id,
    university_id: universityId,
    course_id: courseId,
    name,
    mode,
    topic_ids: validTopicIds,
    question_count: finalCount,
    timed,
    time_limit_minutes: safeTimeLimit,
    current_index: 0,
    flagged_question_ids: [],
  });

  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 });
  }

  const questionRows = finalQuestionIds.slice(0, finalCount).map((id, idx) => ({
    session_id: sessionId,
    question_id: id,
    position: idx,
  }));

  const { error: questionsError } = await supabase.from("exam_session_questions").insert(questionRows);

  if (questionsError) {
    await supabase.from("exam_sessions").delete().eq("id", sessionId);
    return NextResponse.json({ error: questionsError.message }, { status: 500 });
  }

  return NextResponse.json({ sessionId, questionCount: finalCount });
}
