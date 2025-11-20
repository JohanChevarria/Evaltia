import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Desde [slug] hasta src/components => 5 niveles arriba
import COURSES from "../../../../../components/courses/data";

import CourseActions from "./CourseActions";
import TopicsList from "../../../../../components/courses/TopicsList";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const course = COURSES.find((c) => c.slug === params.slug);
  return { title: course ? `${course.name} | Evaltia` : "Curso | Evaltia" };
}

export default function CursoDetallePage({ params }: Props) {
  const course = COURSES.find((c) => c.slug === params.slug);
  if (!course) return notFound();

  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/60 backdrop-blur border border-white/20 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{course.name}</h1>
          {/* ✅ Enviar la prop EXACTA que esperan los componentes */}
          <CourseActions slug={course.slug} />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Temas</h3>
          <TopicsList slug={course.slug} />
        </div>
      </section>
    </main>
  );
}