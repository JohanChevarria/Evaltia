import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ sessionId: string }>;
};

type ProgressBody = {
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

  let body: ProgressBody = {};
  try {
    body = await req.json();
  } catch {
    /* optional body */
  }

  const updatePayload: Record<string, any> = {};
  if (typeof body.currentIndex === "number" && Number.isFinite(body.currentIndex)) {
    updatePayload.current_index = body.currentIndex;
  }

  if (!Object.keys(updatePayload).length) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("exam_sessions")
    .update(updatePayload)
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
