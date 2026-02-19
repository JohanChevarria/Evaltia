import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
