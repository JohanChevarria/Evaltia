// File: /Users/jchevarria/Evaltia/src/app/(public)/public components/Differentiator.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "Contenido adaptado a tu universidad", evaltia: true, others: false },
  { feature: "Organización por cursos y temas reales", evaltia: true, others: false },
  { feature: "Seguimiento de progreso detallado", evaltia: true, others: true },
  { feature: "Preguntas con retroalimentación", evaltia: true, others: true },
  { feature: "Actualización según cambios curriculares", evaltia: true, others: false },
  { feature: "Diseñado para el contexto local", evaltia: true, others: false },
];

export default function Differentiator() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="diferencial" className="mt-16" ref={ref}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* TEXTO */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="
            rounded-3xl
            border border-white/20
            bg-[#1e2f42]/70
            backdrop-blur-sm
            p-10
            shadow-[0_30px_70px_rgba(0,0,0,0.35)]
          "
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            ¿Por qué Exemy es diferente?
          </h2>

          <p className="mt-5 text-sm md:text-base text-white/90 leading-relaxed">
            Muchas plataformas ofrecen bancos de preguntas genéricos. Exemy se
            construye alrededor del plan académico real de tu universidad, con
            contenido que se actualiza según los cambios curriculares.
          </p>

          <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed">
            No se trata de responder más preguntas, sino de estudiar mejor.
            Exemy te muestra exactamente dónde estás y qué necesitas reforzar,
            para que uses tu tiempo de forma inteligente.
          </p>
        </motion.div>

        {/* TABLA */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="
            rounded-3xl
            border border-white/20
            bg-[#1e2f42]/70
            backdrop-blur-sm
            p-8
            shadow-[0_30px_70px_rgba(0,0,0,0.35)]
          "
        >
          <div className="grid grid-cols-3 gap-4 mb-5 pb-4 border-b border-white/20">
            <div className="text-xs font-medium text-white/70">Característica</div>
            <div className="text-xs font-medium text-white text-center">Exemy</div>
            <div className="text-xs font-medium text-white/60 text-center">
              Otras plataformas
            </div>
          </div>

          <div className="space-y-4">
            {comparisons.map((item, index) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                className="grid grid-cols-3 gap-4 items-center"
              >
                <div className="text-sm text-white/90 font-medium">
                  {item.feature}
                </div>

                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex justify-center">
                  {item.others ? (
                    <div className="w-7 h-7 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
