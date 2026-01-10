import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditorClient from "./EditorClient";

type PageProps = { params: Promise<{ uni: string }> };

export default async function EditorCoursesPage({ params }: PageProps) {
  const supabase = await createClient();
  const { uni } = await params;

  // 1) Sesión
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) redirect("/auth/login");

  // 2) Perfil y rol
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, university_id")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");
  if (profile.role !== "admin") redirect("/dashboard/main");

  // 3) Universidad por código URL (usmp/upc/...)
  const uniCode = (uni || "").toLowerCase();

  const { data: uniRow } = await supabase
    .from("universities")
    .select("id, code, name")
    .ilike("code", uniCode)
    .single();

  if (!uniRow) redirect("/admin-studio");

  // 4) Bloqueo: admin solo puede ver SU universidad
  if (!profile.university_id || profile.university_id !== uniRow.id) {
    redirect("/admin-studio");
  }

  // 5) Cursos de ESA universidad
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name, description")
    .eq("university_id", uniRow.id)
    .order("name", { ascending: true });

  if (coursesError) {
    // si quieres, puedes mostrar un mensaje en UI, pero por ahora redirijo simple:
    redirect("/admin-studio");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Editor</h1>
          <p className="text-sm text-slate-600">
            Universidad: <span className="font-semibold">{uniRow.name}</span>{" "}
            <span className="text-slate-400">({uniRow.code})</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Paso 1: elige un curso. Luego verás sus temas y sus preguntas.
          </p>
        </div>

        <Link
          href={`/studio/${uniCode}`}
          className="px-3 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
        >
          Volver al Studio
        </Link>
      </div>

      {/* Realtime listener (CMS) */}
      <EditorClient universityId={uniRow.id} />

      {/* Cursos */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <h2 className="font-semibold">1) Cursos</h2>

        {(!courses || courses.length === 0) ? (
          <p className="text-sm text-slate-500 mt-3">
            Aún no hay cursos creados para esta universidad.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
            {courses.map((c: any) => (
              <Link
                key={c.id}
                href={`/studio/${uniCode}/editor/${c.id}`}   // ✅ ahora es ruta clara
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-4 transition"
              >
                <p className="font-semibold text-slate-900">{c.name}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {c.description || "Sin descripción"}
                </p>
                <p className="text-xs text-slate-400 mt-3">
                  Click para ver temas y preguntas
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
