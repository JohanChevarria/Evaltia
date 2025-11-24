"use client";

import { useMemo, useState } from "react";

type ExamBuilderModalProps = {
  slug: string;
  open: boolean;
  onClose: () => void;
};

// Mapeo de nombres de cursos por slug
function getCourseNameFromSlug(slug: string) {
  const map: Record<string, string> = {
    anatomia: "Anatomía",
    histologia: "Histología",
    embriologia: "Embriología",
    bioquimica: "Bioquímica",
    fisiologia: "Fisiología",
    parasitologia: "Parasitología",
    farmacologia: "Farmacología",
    patologia: "Patología",
    bioestadistica: "Bioestadística",
  };

  return map[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Temas temporales (mock)
const MOCK_TOPICS: Record<string, string[]> = {
  anatomia: [
    "Miembro superior",
    "Miembro inferior",
    "Tórax",
    "Abdomen",
    "Cabeza y cuello",
    "Neuroanatomía",
  ],
  histologia: [
    "Epitelios",
    "Tejido conjuntivo",
    "Sistema nervioso",
    "Sistema endocrino",
  ],
  embriologia: ["Gametogénesis", "Fecundación", "Organogénesis", "Malformaciones"],
};

export default function ExamBuilderModal({
  slug,
  open,
  onClose,
}: ExamBuilderModalProps) {
  const [examType, setExamType] = useState<"practica" | "simulacro">("practica");
  const [timed, setTimed] = useState(false);
  const [timeMinutes, setTimeMinutes] = useState<number>(60);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(20);

  const courseName = useMemo(() => getCourseNameFromSlug(slug), [slug]);
  const topics = useMemo(
    () => MOCK_TOPICS[slug] ?? ["Tema 1", "Tema 2", "Tema 3", "Tema 4"],
    [slug]
  );

  if (!open) return null;

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleQuestionPreset = (n: number) => {
    const value = Math.min(n, 50); // máximo 50
    setQuestionCount(value);
  };

  const handleQuestionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (Number.isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 50) value = 50;
    setQuestionCount(value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (Number.isNaN(value)) value = 1;
    if (value < 1) value = 1;
    if (value > 120) value = 120;
    setTimeMinutes(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      slug,
      courseName,
      examType,
      timed,
      timeMinutes: timed ? timeMinutes : null,
      selectedTopics,
      questionCount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm px-4">
      {/* Capa clickeable para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* CARD CENTRADA */}
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white/70 backdrop-blur border border-black/5 shadow-lg p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Crear examen
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Curso: <span className="font-medium">{courseName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 p-1.5 text-slate-700 bg-white hover:bg-slate-100 text-xs"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TIPO DE EXAMEN */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-800">
              Tipo de examen
            </h3>

            <div className="inline-flex bg-white border border-black/10 rounded-lg p-1">
              {["practica", "simulacro"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setExamType(type as any)}
                  className={`px-4 py-1.5 text-sm rounded-md transition 
                    ${
                      examType === type
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  {type === "practica" ? "Práctica" : "Simulacro"}
                </button>
              ))}
            </div>
          </div>

          {/* CRONOMETRADO + TIEMPO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-800">
                Cronometrado
              </h3>

              <button
                type="button"
                onClick={() => setTimed((t) => !t)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition 
                  ${timed ? "bg-indigo-600" : "bg-slate-300"}
                `}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition 
                    ${timed ? "translate-x-5" : "translate-x-1"}
                  `}
                />
              </button>
            </div>

            {timed && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700">
                  Tiempo (minutos)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={timeMinutes}
                  onChange={handleTimeChange}
                  className="h-9 w-24 rounded-xl border border-black/10 bg-white text-sm text-center text-slate-700 shadow-sm focus:ring-indigo-600 focus:outline-none"
                />
                <span className="text-xs text-slate-500">
                  Máx: 120 min
                </span>
              </div>
            )}
          </div>

          {/* TEMAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-800">Temas</h3>
              <p className="text-xs text-slate-600">
                Seleccionados: {selectedTopics.length}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((topic) => {
                const active = selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`rounded-xl px-3 py-2 text-sm border transition text-left 
                      ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-500 shadow"
                          : "bg-white/70 backdrop-blur border border-black/10 text-slate-700 hover:bg-slate-100"
                      }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PREGUNTAS */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-800">
              Número de preguntas
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {[10, 20, 30].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleQuestionPreset(n)}
                  className={`h-9 min-w-[3rem] rounded-xl px-3 text-sm border transition 
                    ${
                      questionCount === n
                        ? "bg-indigo-600 text-white border-indigo-500 shadow"
                        : "bg-white/70 border border-black/10 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  {n}
                </button>
              ))}

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Personalizado:</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={questionCount}
                  onChange={handleQuestionInput}
                  className="h-9 w-20 rounded-xl border border-black/10 bg-white text-sm text-center text-slate-700 shadow-sm focus:ring-indigo-600 focus:outline-none"
                />
                <span className="text-xs text-slate-500">Máx: 50</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white px-4 py-2 text-sm text-slate-700 border border-black/10 hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Crear examen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}