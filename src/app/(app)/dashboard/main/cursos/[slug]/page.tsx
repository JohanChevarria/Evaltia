import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import TopicsList from "@/components/courses/TopicsList";
import CourseActions from "./CourseActions";

type Props = { params: { slug: string } };

function slugToCourseName(slug: string) {
  const map: Record<string, string> = {
    anatomia: "Anatomía",
    histologia: "Histología",
    bioquimica: "Bioquímica",
    embriologia: "Embriología",
    fisiologia: "Fisiología",
    parasitologia: "Parasitología",
    farmacologia: "Farmacología",
    patologia: "Patología",
    bioestadistica: "Bioestadística",
  };

  return map[slug] ?? slug;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = slugToCourseName(params.slug);
  return {
    title: `${title} | Evaltia`,
  };
}

export default async function CursoDetallePage({ params }: Props) {
  const supabase = await createClient();

  const courseName = slugToCourseName(params.slug);

  const { data: course } = await supabase
    .from("courses")
    .select("id, name")
    .ilike("name", courseName)
    .single();

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {courseName}
            </h1>

            <p className="text-sm text-slate-600 mt-1">
              Temas y prácticas del curso.
            </p>
          </div>

          <CourseActions slug={params.slug} />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Temas</h3>

          {course?.id ? (
            <TopicsList courseId={course.id} />
          ) : (
            <p className="text-sm text-slate-600">
              Este curso aún no está configurado.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
