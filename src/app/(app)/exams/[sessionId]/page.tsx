import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionPayload } from "../lib/sessionData";
import ExamSolveClient from "./ExamSolveClient";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function ExamSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const payload = await getSessionPayload(supabase, sessionId, user.id);
  if (!payload) redirect("/exams");

  return (
    <div className="relative min-h-screen text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
            linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
          `,
          backgroundBlendMode: "soft-light, screen, normal",
        }}
      />

      {/* ✅ antes: max-w-6xl. Ahora: más ancho tipo AMBOSS */}
      <div className="relative z-10 mx-auto w-full max-w-7xl 2xl:max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <ExamSolveClient payload={payload} />
      </div>
    </div>
  );
}
