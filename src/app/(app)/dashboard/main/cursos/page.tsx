import type { Metadata } from "next";
import CoursesGrid from "@/components/courses/CoursesGrid";

export const metadata: Metadata = {
  title: "Cursos | Evaltia",
  description: "Explora tus cursos base de preclínica.",
};

export default function CursosPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6">
      <section className="rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-sm p-5 sm:p-7">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Cursos
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Elige un curso para continuar.
          </p>
        </div>

        <CoursesGrid />
      </section>
    </main>
  );
}
