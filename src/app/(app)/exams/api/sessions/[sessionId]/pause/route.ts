import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ sessionId: string }>;
};

type PauseBody = {
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

  const { sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  }

  let body: PauseBody = {};
  try {
    body = await req.json();
  } catch {
    /* optional body */
  }

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, mode, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Sesi\u00f3n no encontrada" }, { status: 404 });
  }

  if ((session as any).mode !== "practica") {
    return NextResponse.json({ error: "Solo se puede pausar una practica." }, { status: 400 });
  }

  if ((session as any).status === "finished") {
    return NextResponse.json({ error: "La practica ya fue finalizada." }, { status: 400 });
  }

  const { error } = await supabase.rpc("pause_practice_session", {
    p_session_id: sessionId,
    p_user_id: user.id,
    p_current_index:
      typeof body.currentIndex === "number" && Number.isFinite(body.currentIndex)
        ? body.currentIndex
        : null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
