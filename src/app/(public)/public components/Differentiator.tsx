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
    <section id="diferencial" className="mt-10" ref={ref}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-8 md:p-10"
        >
          {/* ✅ Sin “Diferencial” (NO hay eyebrow) */}
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            ¿Por qué Evaltia es diferente?
          </h2>

          <p className="mt-4 text-sm md:text-base text-white/75 leading-relaxed">
            Muchas plataformas ofrecen bancos de preguntas genéricos. Evaltia se construye alrededor del
            plan académico real de tu universidad, con contenido que se actualiza según los cambios curriculares.
          </p>

          <p className="mt-4 text-sm md:text-base text-white/75 leading-relaxed">
            No se trata de responder más preguntas, sino de estudiar mejor. Evaltia te muestra exactamente dónde estás
            y qué necesitas reforzar, para que uses tu tiempo de forma inteligente.
          </p>
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-6 md:p-8"
        >
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10">
            <div className="text-xs md:text-sm font-medium text-white/60">Característica</div>
            <div className="text-xs md:text-sm font-medium text-white text-center">Evaltia</div>
            <div className="text-xs md:text-sm font-medium text-white/60 text-center">Otras plataformas</div>
          </div>

          <div className="space-y-3">
            {comparisons.map((item, index) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                className="grid grid-cols-3 gap-4 items-center py-2"
              >
                <div className="text-xs md:text-sm text-white/85">{item.feature}</div>

                <div className="flex justify-center">
                  <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex justify-center">
                  {item.others ? (
                    <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black/20 border border-white/10 flex items-center justify-center">
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
