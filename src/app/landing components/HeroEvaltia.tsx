"use client";

import { motion } from "framer-motion";

export function HeroEvaltia() {
  return (
    <section className="bg-white text-slate-800 relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20">
      {/* Título animado */}
      <h1 className="text-center text-3xl font-extrabold md:text-5xl lg:text-6xl">
        {"Prepárate para tus exámenes con Evaltia".split(" ").map((w, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="mr-2 inline-block"
          >
            {w}
          </motion.span>
        ))}
      </h1>

      {/* Sub-copy */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="mt-4 max-w-2xl text-center text-lg text-gray-600"
      >
        Avanza con bancos de preguntas, calendarios y estadísticas que se adaptan a tu ritmo.
      </motion.p>

      {/* Botones (ahora NO clickeables) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.2 }}
        className="mt-8 flex flex-wrap justify-center gap-4"
      >
        <div className="rounded-full bg-[#06121F] px-8 py-3 text-white opacity-60 cursor-not-allowed">
          Probar demo
        </div>

        <div className="rounded-full border border-gray-300 px-8 py-3 text-gray-800 opacity-60 cursor-not-allowed">
          Ver características
        </div>
      </motion.div>
    </section>
  );
}
