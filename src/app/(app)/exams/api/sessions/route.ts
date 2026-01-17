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

  // legacy / compat
  course_id?: string;
  topic_id?: string;
  topic_name?: string;
  university_id?: string;
};

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const mode: ExamMode = body.mode ?? "practica";
    if (!["practica", "simulacro", "repaso"].includes(mode)) {
      return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
    }

    const isReview = mode === "repaso" && typeof body.topic_id === "string";

    // =========================
    // REPASO
    // =========================
    if (isReview) {
      const topicId = (body.topic_id ?? "").toString().trim();
      if (!topicId) return NextResponse.json({ error: "topic_id requerido" }, { status: 400 });

      const courseId = (body.courseId ?? body.course_id ?? "").toString().trim();

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("university_id")
        .eq("id", user.id)
        .single();

      if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
      const universityId = (profile as any)?.university_id ?? null;

      let topicQuery = supabase.from("topics").select("id, title, course_id").eq("id", topicId);
      if (courseId) topicQuery = topicQuery.eq("course_id", courseId);

      const { data: topicRow, error: topicError } = await topicQuery.single();
      if (topicError || !topicRow?.id) return NextResponse.json({ error: "Tema no encontrado" }, { status: 404 });

      const finalCourseId = (topicRow as any).course_id ?? courseId;
      if (!finalCourseId) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });

      // ƒo. Si hay un repaso abierto (no finalizado) de este mismo topic, se reanuda.
      const { data: existingReview } = await supabase
        .from("exam_sessions")
        .select("id, question_count, finished_at, status")
        .eq("user_id", user.id)
        .eq("mode", "repaso")
        .contains("topic_ids", [topicId])
        .is("finished_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReview?.id && (existingReview as any).status !== "finished") {
        return NextResponse.json({
          sessionId: existingReview.id,
          questionCount: (existingReview as any).question_count ?? 0,
          resumed: true,
        });
      }

      // Diagnóstico rápido de lectura questions (RLS / mismatch)
      const diag = await diagnoseQuestionsRead({
        supabase,
        courseId: finalCourseId,
        topicIds: [topicId],
        universityId,
      });

      const sessionId = randomUUID();
      const selected = await selectQuestions({
        supabase,
        topicIds: [topicId],
        courseId: finalCourseId,
        universityId,
        limit: 10,
        seed: sessionId,
      });

      if (!selected.length) {
        return NextResponse.json(
          {
            error: "No se encontraron preguntas para el tema elegido.",
            diagnostic: diag,
          },
          { status: 400 }
        );
      }

      const orderedIds = shuffleWithSeed(selected.map((q) => q.id), sessionId).slice(0, 10);
      const finalQuestionIds = orderedIds.length ? orderedIds : selected.map((q) => q.id);
      const finalCount = Math.min(10, finalQuestionIds.length);

      const topicName = (body.topic_name ?? "").toString().trim() || (topicRow as any).title || "Repaso";

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
        status: "in_progress",
        started_at: new Date().toISOString(),
        paused_at: null,
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

    // =========================
    // PRACTICA / SIMULACRO
    // =========================
    const courseId = (body.courseId ?? body.course_id ?? "").toString().trim();
    const topicIds = Array.isArray(body.topicIds) ? body.topicIds.filter(Boolean) : [];

    const name =
      (body.name ?? "").toString().trim() || (mode === "simulacro" ? "Simulacro" : "Práctica");

    if (!courseId || topicIds.length === 0) {
      return NextResponse.json({ error: "Faltan curso o temas." }, { status: 400 });
    }

    const requestedCount = Math.max(1, Math.min(500, Number(body.questionCount ?? 10)));
    const timed = mode === "simulacro" ? true : !!body.timed;

    const timeLimit = timed ? Number(body.timeLimitMinutes ?? null) : null;
    const safeTimeLimit = timed && timeLimit && timeLimit > 0 ? Math.min(timeLimit, 500) : null;

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("university_id")
      .eq("id", user.id)
      .single();

    if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
    const universityId = (profile as any)?.university_id ?? null;

    // ✅ topics válidos del curso
    const { data: topicRows, error: topicsErr } = await supabase
      .from("topics")
      .select("id")
      .in("id", topicIds)
      .eq("course_id", courseId);

    if (topicsErr) return NextResponse.json({ error: topicsErr.message }, { status: 500 });

    const validTopicIds = (topicRows ?? []).map((t: any) => t.id).filter(Boolean);

    if (validTopicIds.length === 0) {
      return NextResponse.json({ error: "No hay temas válidos para este curso." }, { status: 400 });
    }

    // ✅ Diagnóstico ANTES de seleccionar (para detectar RLS o mismatch de uni)
    const diag = await diagnoseQuestionsRead({
      supabase,
      courseId,
      topicIds: validTopicIds,
      universityId,
    });

    const sessionId = randomUUID();
    const selected = await selectQuestions({
      supabase,
      topicIds: validTopicIds,
      courseId,
      universityId,
      limit: requestedCount,
      seed: sessionId,
    });

    if (!selected.length) {
      return NextResponse.json(
        {
          error: "No se encontraron preguntas para los temas elegidos.",
          diagnostic: diag,
        },
        { status: 400 }
      );
    }

    const orderedIds = shuffleWithSeed(selected.map((q) => q.id), sessionId).slice(0, requestedCount);
    const finalQuestionIds = orderedIds.length ? orderedIds : selected.map((q) => q.id);
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
      status: "in_progress",
      started_at: new Date().toISOString(),
      paused_at: null,
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Error inesperado creando sesión" },
      { status: 500 }
    );
  }
}

/**
 * Diagnóstico: intenta leer questions con (course+topics+uni), luego sin uni, luego sin course.
 * Si todo da 0 desde la API pero tú en SQL ves 47 => RLS 99% seguro.
 */
async function diagnoseQuestionsRead(opts: {
  supabase: any;
  courseId: string;
  topicIds: string[];
  universityId: string | null;
}) {
  const { supabase, courseId, topicIds, universityId } = opts;

  const run = async (label: string, q: any) => {
    const { data, error, count } = await q;
    return {
      label,
      count: typeof count === "number" ? count : null,
      sample: Array.isArray(data) ? data.slice(0, 3).map((r: any) => r.id) : [],
      error: error ? error.message : null,
    };
  };

  // Nota: NO usamos head:true para evitar count null raro. Solo limit 3.
  const base = supabase.from("questions").select("id", { count: "exact" }).in("topic_id", topicIds);

  const q1 = base.eq("course_id", courseId).limit(3);
  if (universityId) q1.eq("university_id", universityId);

  const q2 = base.eq("course_id", courseId).limit(3); // sin university_id

  const q3 = supabase
    .from("questions")
    .select("id", { count: "exact" })
    .in("topic_id", topicIds)
    .limit(3); // solo topic

  return {
    courseId,
    topicIds,
    universityId,
    checks: [
      await run("course+topics+uni", q1),
      await run("course+topics", q2),
      await run("topics-only", q3),
    ],
  };
}
