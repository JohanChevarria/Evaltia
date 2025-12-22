import type { Metadata } from "next";
import COURSES from "../../../../../components/courses/data";
import TopicsList from "../../../../../components/courses/TopicsList";
import CourseActions from "./CourseActions";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const course = COURSES.find((c) => c.slug === params.slug);
  return {
    title: course ? `${course.name} | Evaltia` : `Curso | ${params.slug}`,
  };
}

export default function CursoDetallePage({ params }: Props) {
  const course = COURSES.find((c) => c.slug === params.slug);

  // ✅ NO 404. Si no está en COURSES, igual mostramos la página.
  const title = course?.name ?? params.slug;

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 sm:p-7 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {title}
            </h1>

            <p className="text-sm text-slate-600 mt-1">
              Temas y prácticas del curso.
            </p>
          </div>

          <CourseActions slug={params.slug} />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Temas</h3>

          {/* ✅ TopicsList ahora recibe courseId */}
          <TopicsList courseId={course?.id} />
        </div>
      </section>
    </main>
  );
}
