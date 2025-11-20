"use client";

import { useState } from "react";
// Desde [slug] → src/components/exams/ExamBuilderModal.tsx = 5 niveles arriba
import ExamBuilderModal from "../../../../../components/exams/ExamBuilderModal";

export default function CourseActions({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
      >
        Crear examen
      </button>

      <ExamBuilderModal slug={slug} open={open} onClose={() => setOpen(false)} />
    </>
  );
}