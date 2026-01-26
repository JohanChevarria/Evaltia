// File: /Users/jchevarria/Evaltia/src/app/(public)/public components/FAQEvaltia.tsx
"use client";

import { useMemo, useState } from "react";

type FAQItem = {
  q: string;
  a: React.ReactNode;
};

export default function FAQEvaltia() {
  // ✅ No abrir nada por defecto
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items: FAQItem[] = useMemo(
    () => [
      {
        q: "¿Qué ofrece Exemy?",
        a: (
          <div className="space-y-3">
            <p>
              Exemy ofrece bancos de preguntas personalizados según la malla
              curricular de cada universidad.
            </p>
            <p>
              Nuestros simulacros están diseñados para replicar fielmente el
              estilo, dificultad y formato de los exámenes reales, brindando una
              preparación práctica y realista para los estudiantes de Medicina.
            </p>
          </div>
        ),
      },
      {
        q: "¿Los bancos de preguntas de Exemy son gratuitos?",
        a: (
          <div className="space-y-3">
            <p>Actualmente, Exemy se encuentra en fase DEMO.</p>
            <p>
              Esta etapa nos permite analizar cómo los estudiantes interactúan
              con la plataforma y recopilar sugerencias para optimizar la
              experiencia.
            </p>
            <p>
              Nuestro compromiso es utilizar este feedback para mejorar la
              calidad de la educación médica y desarrollar un servicio sólido y
              confiable para el futuro.
            </p>
          </div>
        ),
      },
      {
        q: "¿Qué beneficios obtengo al usar Exemy?",
        a: (
          <div className="space-y-3">
            <p>
              Acceso a bancos de preguntas constantemente actualizados según tu
              universidad. Simulacros alineados a evaluaciones reales.
              Estadísticas de rendimiento para identificar tus áreas de mejora.
            </p>

            <div className="pt-2">
              <p className="font-semibold text-white">
                Team Exemy (Summer Internship)
              </p>
              <p className="mt-2">
                Es un internship remunerado de verano dirigido a estudiantes
                destacados que hayan completado satisfactoriamente sus cursos.
              </p>
              <p className="mt-2">
                Los seleccionados participarán en la actualización de cambios
                curriculares recientes, revisión y mejora de bancos de
                preguntas, y desarrollo de nuevos contenidos académicos. Esto
                permite que los futuros estudiantes reciban material alineado a
                la realidad académica actual.
              </p>
            </div>
          </div>
        ),
      },
      {
        q: "¿Qué son los Embajadores de Exemy y cómo puedo ser uno?",
        a: (
          <div className="space-y-3">
            <p>
              Los Embajadores de Exemy son estudiantes representantes de cada
              universidad.
            </p>
            <p>
              Revisan los bancos de preguntas, analizan comentarios de los
              estudiantes, se mantienen al tanto de cambios curriculares y
              comunican mejoras al equipo Exemy.
            </p>
            <p>
              Duración del cargo: 1 año. Si deseas postular, próximamente
              anunciaremos convocatorias oficiales.
            </p>
          </div>
        ),
      },
      {
        q: "¿Exemy funciona en todos los países?",
        a: (
          <div className="space-y-3">
            <p>
              Actualmente, Exemy está adaptada a universidades del Perú y
              cuenta con un plan general compatible con la mayoría de
              universidades de Latinoamérica, apoyado con inteligencia
              artificial.
            </p>
            <p>
              Estamos en proceso de expansión a más países y universidades.
            </p>
            <p>
              Si deseas ser embajador de tu universidad o colaborar con
              nosotros, escríbenos a{" "}
              <a
                className="underline decoration-white/30 hover:decoration-white transition"
                href="mailto:soporte@exemy.com"
              >
                soporte@exemy.com
              </a>
              .
            </p>
          </div>
        ),
      },
      {
        q: "¿Exemy ofrecerá preparación para exámenes como ENAM o ENARM?",
        a: (
          <div className="space-y-3">
            <p>
              Sí. Al finalizar la fase DEMO, Exemy incorporará bancos de
              preguntas especializados y clases enfocadas en distintos exámenes
              médicos.
            </p>
            <p>
              Entre ellos se incluirán evaluaciones como el ENAM (Perú), el
              ENARM (México) y otros exámenes internacionales relevantes para
              estudiantes de Medicina.
            </p>
            <p>
              Nuestro objetivo es brindar una preparación integral y de alto
              nivel, combinando práctica constante, contenido actualizado y
              simulacros diseñados para acercarse lo más posible a las
              evaluaciones reales.
            </p>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <section id="faq" className="mt-16">
      <div
        className="
          rounded-3xl
          border border-white/20
          bg-[#1e2f42]/70
          backdrop-blur-sm
          p-7 md:p-9
          shadow-[0_30px_70px_rgba(0,0,0,0.35)]
        "
      >
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="mt-7 max-w-3xl mx-auto">
          <div className="divide-y divide-white/15">
            {items.map((item, idx) => {
              const open = openIndex === idx;

              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-sm md:text-base font-semibold text-white/95 leading-snug">
                      {item.q}
                    </span>

                    <span
                      className={[
                        "shrink-0 h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center transition",
                        open ? "bg-white/25" : "hover:bg-white/25",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className={[
                          "transition-transform duration-200",
                          open ? "rotate-180" : "rotate-0",
                        ].join(" ")}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="rgba(255,255,255,0.9)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={[
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    ].join(" ")}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-3 text-sm md:text-base text-white/85 leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 text-sm text-white/75">
            ¿Tienes más consultas? Escríbenos a{" "}
            <a
              className="text-white underline decoration-white/25 hover:decoration-white transition"
              href="mailto:soporte@exemy.com"
            >
              soporte@exemy.com
            </a>
            .
          </div>
        </div>
      </div>
    </section>
  );
}
