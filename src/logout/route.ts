// src/app/logout/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // ✅ Pase lo que pase, redirige.
  // (Esto evita la pantalla negra mientras arreglamos el server logout)
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
