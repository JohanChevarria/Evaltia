import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(_req: Request, { params }: Params) {
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

  const { data: session } = await supabase
    .from("exam_sessions")
    .select("id, mode, status")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 });
  }

  if ((session as any).mode !== "practica") {
    return NextResponse.json({ error: "Solo se puede reanudar una practica." }, { status: 400 });
  }

  if ((session as any).status === "finished") {
    return NextResponse.json({ error: "La practica ya fue finalizada." }, { status: 400 });
  }

  const { error } = await supabase
    .from("exam_sessions")
    .update({ status: "in_progress", paused_at: null })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
