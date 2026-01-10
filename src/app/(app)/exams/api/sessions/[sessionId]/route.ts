import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionPayload } from "../../../lib/sessionData";

type Params = {
  params: { sessionId: string };
};

export async function GET(_req: Request, { params }: Params) {
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

  const payload = await getSessionPayload(supabase, sessionId, user.id);

  if (!payload) {
    return NextResponse.json({ error: "Sesi\u00f3n no encontrada" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
