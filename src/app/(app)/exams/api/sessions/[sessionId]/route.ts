import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionPayload } from "../../../lib/sessionData";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { sessionId } = await context.params;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  }

  const payload = await getSessionPayload(supabase, sessionId, user.id);

  if (!payload) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
