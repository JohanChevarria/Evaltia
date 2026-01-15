import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ sessionId: string }>;
};

type FlagBody = {
  questionId?: string;
};

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: FlagBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inv\u00e1lido" }, { status: 400 });
  }

  const { sessionId } = await params;
  const questionId = body.questionId ?? "";

  if (!sessionId || !questionId) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, user_id, flagged_question_ids")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Sesi\u00f3n no encontrada" }, { status: 404 });
  }

  const { data: belongs } = await supabase
    .from("exam_session_questions")
    .select("question_id")
    .eq("session_id", sessionId)
    .eq("question_id", questionId)
    .single();

  if (!belongs) {
    return NextResponse.json({ error: "La pregunta no pertenece a la sesi\u00f3n." }, { status: 400 });
  }

  const current = ((session as any).flagged_question_ids ?? []) as string[];
  const set = new Set(current);
  if (set.has(questionId)) set.delete(questionId);
  else set.add(questionId);

  const updated = Array.from(set);

  const { error: updateError } = await supabase
    .from("exam_sessions")
    .update({ flagged_question_ids: updated })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ flagged: updated });
}
