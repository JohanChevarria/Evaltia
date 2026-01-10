// File: /Users/jchevarria/Evaltia/src/app/(public)/public components/HeroEvaltia.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Differentiator from "./Differentiator";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export function HeroEvaltia() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-14 pb-20">
      {/* HERO */}
      <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-8 md:p-12">
        <motion.div {...fadeUp} transition={{ duration: 0.35 }} className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            Educación médica con estructura
          </div>

          <h1 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            El mejor camino para tu{" "}
            <span className="text-white/90">formación médica</span>
          </h1>

          <p className="mt-5 mx-auto max-w-3xl text-base md:text-lg text-white/75 leading-relaxed">
            Diseñada para integrarse a tu ritmo, tu contexto y tu forma de aprender medicina.
          </p>

          {/* Botones */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-white px-7 py-3 text-[#06121F] font-semibold opacity-90 hover:opacity-100 transition"
            >
              Probar demo
            </Link>

            <Link
              href="/#como-funciona"
              className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-white/85 opacity-90 hover:opacity-100 transition"
            >
              Ver cómo funciona
            </Link>
          </div>

          {/* Preview placeholder */}
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-5xl">
              <div
                className="relative rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden"
                style={{ transform: "perspective(1200px) rotateX(6deg) rotateY(-10deg)" }}
              >
                <div className="h-[220px] sm:h-[300px] md:h-[360px] w-full bg-[#06121F]/35" />

                <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="ml-4 h-2 w-40 rounded bg-white/10" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                  <p className="text-white/75 text-sm md:text-base">
                    Aquí va el screenshot/preview del dashboard (cuando lo tengas).
                  </p>
                </div>
              </div>

              <div className="mx-auto mt-6 h-10 w-[92%] rounded-full bg-black/25 blur-2xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona" className="scroll-mt-28 mt-14">
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.05 }}>
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-md p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Una plataforma pensada para el estudio real de la medicina
            </h2>

            <p className="mt-4 text-sm md:text-base text-white/75 leading-relaxed max-w-4xl">
              En Evaltia entendemos que estudiar medicina no es seguir un único método ni un único ritmo.
              Por eso construimos una plataforma que se adapta al contexto académico de cada estudiante,
              organiza los recursos disponibles y permite evaluar el progreso de forma continua, clara y útil.
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6"
          >
            <div className="text-xs text-white/70">01</div>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Estudia con libertad, mide tu progreso con precisión
            </h3>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Accede a tus recursos desde donde estés y estudia según tu propio tiempo y dinámica.
              Evaltia centraliza el material de estudio y te permite visualizar tu avance real por cursos,
              temas y periodos, para que siempre sepas dónde estás y qué necesitas reforzar.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6"
          >
            <div className="text-xs text-white/70">02</div>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Contenido alineado a tu universidad y a tu realidad académica
            </h3>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              Nos adaptamos a la forma en que se enseña medicina en cada universidad.
              La plataforma se mantiene actualizada según los cambios curriculares y el contexto académico de
              cada institución, asegurando que el estudio sea relevante, vigente y alineado a lo que realmente se evalúa.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6"
          >
            <div className="text-xs text-white/70">03</div>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Evaltia mejora contigo
            </h3>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              La plataforma evoluciona a partir del uso real y del feedback de sus estudiantes.
              Las sugerencias sobre preguntas y respuestas permiten mejorar continuamente la calidad del contenido y,
              además, los usuarios que destacan por su desempeño y compromiso pueden acceder a oportunidades para formar
              parte del equipo de Evaltia y contribuir directamente a la mejora del banco de preguntas y del aprendizaje.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ✅ NUEVA SECCIÓN (tabla comparativa) */}
      <Differentiator />
    </section>
  );
}
