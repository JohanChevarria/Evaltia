import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Panel de usuario | Evaltia",
  description: "Administra tu estudio y accede a tus cursos.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1) Sesión
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) redirect("/auth/login");

  // 2) Perfil (role + flags)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, university_onboarding_completed, onboarding_completed")
    .eq("id", user.id)
    .single();

  const role = (profile as any)?.role;

  // 3) Admin nunca entra a dashboard
  if (role === "admin" || role === "superadmin") redirect("/admin-studio");

  // 4) Gate 1: onboarding universidad (solo students)
  if (role === "student" && !(profile as any)?.university_onboarding_completed) {
    redirect("/university"); // ojo: por tu ruta src/app/(onboarding)/university/page.tsx
  }

  // 5) Gate 2: onboarding cursos (tu overlay actual)
  // Si aún no completó cursos, lo mandamos a /dashboard/main para que aparezca el overlay
  if (role === "student" && !(profile as any)?.onboarding_completed) {
    redirect("/dashboard/main");
  }

  // 6) Mantener tu UI wrapper tal cual
  return <section className="hero-background min-h-screen text-white font-sans">{children}</section>;
}
