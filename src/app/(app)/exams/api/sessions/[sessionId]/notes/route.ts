import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ sessionId: string }>;
};

type NoteBody = {
  questionId?: string;
  text?: string;
};

export async function POST(req: Request, { params }: Params) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: NoteBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload inv\u00e1lido" }, { status: 400 });
  }

  const { sessionId } = await params;
  const questionId = body.questionId ?? "";
  const text = (body.text ?? "").toString();

  if (!sessionId || !questionId) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id")
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

  if (!text.trim()) {
    await supabase
      .from("exam_notes")
      .delete()
      .eq("session_id", sessionId)
      .eq("question_id", questionId);

    return NextResponse.json({ removed: true });
  }

  const { data: upserted, error } = await supabase
    .from("exam_notes")
    .upsert(
      {
        session_id: sessionId,
        question_id: questionId,
        text: text.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id,question_id" }
    )
    .select("id, question_id, text, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: upserted });
}
