import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: { sessionId: string };
};

type AnswerBody = {
  questionId?: string;
  optionLabel?: string;
  currentIndex?: number;
};

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sessionId = params?.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  }

  let body: AnswerBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inv\u00e1lido" }, { status: 400 });
  }

  const questionId = body.questionId ?? "";
  const optionLabel = (body.optionLabel ?? "").toString().trim();

  if (!questionId || !optionLabel) {
    return NextResponse.json({ error: "Faltan datos de respuesta." }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("exam_sessions")
    .select("id, user_id, mode, finished_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Sesi\u00f3n no encontrada" }, { status: 404 });
  }

  if ((session as any).finished_at) {
    return NextResponse.json({ error: "La sesi\u00f3n ya fue finalizada." }, { status: 400 });
  }

  const { data: belongs } = await supabase
    .from("exam_session_questions")
    .select("question_id")
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .single();

  if (!belongs) {
    return NextResponse.json({ error: "La pregunta no pertenece a esta sesi\u00f3n." }, { status: 400 });
  }

  const { data: options } = await supabase
    .from("options")
    .select("label, is_correct")
    .eq("question_id", questionId);

  const selected = (options ?? []).find(
    (opt: any) => (opt.label ?? "").toString().toUpperCase() === optionLabel.toUpperCase()
  );

  if (!selected) {
    return NextResponse.json({ error: "Opci\u00f3n inv\u00e1lida." }, { status: 400 });
  }

  const { data: lastAnswer } = await supabase
    .from("exam_answers")
    .select("attempt")
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .order("attempt", { ascending: false })
    .limit(1)
    .single();

  if ((session as any).mode === "practica" && lastAnswer) {
    return NextResponse.json({ locked: true, attempt: lastAnswer.attempt }, { status: 200 });
  }

  const attempt = ((lastAnswer as any)?.attempt ?? 0) + 1;
  const isCorrect = !!(selected as any).is_correct;

  const { data: inserted, error: insertError } = await supabase
    .from("exam_answers")
    .insert({
      session_id: sessionId,
      question_id: questionId,
      selected_option_label: optionLabel,
      is_correct: isCorrect,
      attempt,
    })
    .select("id, attempt, created_at")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  if (typeof body.currentIndex === "number" && Number.isFinite(body.currentIndex)) {
    await supabase
      .from("exam_sessions")
      .update({ current_index: body.currentIndex })
      .eq("id", sessionId)
      .eq("user_id", user.id);
  }

  return NextResponse.json({
    answerId: inserted?.id ?? null,
    isCorrect,
    attempt,
    mode: (session as any).mode,
  });
}
