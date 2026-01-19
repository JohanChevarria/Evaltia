// File: /Users/jchevarria/Evaltia/src/app/(public)/public components/HeroEvaltia.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Differentiator from "./Differentiator";
import FAQEvaltia from "./FAQEvaltia";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

const DASH_SRC = "/landing/dashboard-screenshot.png";

/**
 * ✅ MISMO TONO QUE DIFFERENTIATOR
 */
const GLASS_CARD =
  "bg-[#1e2f42]/70 backdrop-blur-sm shadow-[0_30px_70px_rgba(0,0,0,0.35)]";
const GLASS_CARD_STRONG =
  "bg-[#1e2f42]/80 backdrop-blur-sm shadow-[0_30px_70px_rgba(0,0,0,0.35)]";

function DashboardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        relative overflow-hidden rounded-3xl
        bg-[#1e2f42]/70 backdrop-blur-sm
        shadow-[0_30px_70px_rgba(0,0,0,0.35)]
      "
    >
      {/* ✅ Barra superior MÁS CLARA (como antes), no negra */}
      <div
        className="
          absolute top-0 left-0 right-0 h-12
          bg-white/10 backdrop-blur-sm
          flex items-center px-4 gap-2 z-10
        "
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/28" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/22" />
        <div className="ml-4 h-2 w-40 rounded bg-white/20" />
      </div>

      <div className="pt-12">{children}</div>
    </div>
  );
}

export function HeroEvaltia() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-8 pb-16">
      {/* HERO TEXT */}
      <div className="text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.35 }}
          className="
            text-[12px] md:text-sm
            font-semibold tracking-[0.18em]
            uppercase
            text-white/70
          "
        >
          Bienvenido a Evaltia
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.38, delay: 0.03 }}
          className="
            mt-4 text-4xl md:text-6xl lg:text-7xl
            font-extrabold tracking-tight text-white
          "
        >
          El mejor camino para tu{" "}
          <span className="text-white/95">formación médica</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="
            mt-4 mx-auto max-w-3xl
            text-base md:text-lg
            text-white/80
            leading-relaxed
          "
        >
          Diseñada para integrarse a tu ritmo, tu contexto y tu forma de aprender
          medicina.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-7 flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/register"
            className="
              rounded-xl bg-white px-7 py-3
              text-[#0b1a2b] font-semibold
              hover:bg-white/90 transition
              shadow-[0_10px_18px_rgba(0,0,0,0.25)]
            "
          >
            Probar demo
          </Link>

          <Link
            href="/#como-funciona"
            className="
              rounded-xl
              bg-[#1e2f42]/70 backdrop-blur-sm
              px-7 py-3
              text-white/95
              hover:bg-[#1e2f42]/80 transition
            "
          >
            Ver cómo funciona
          </Link>
        </motion.div>
      </div>

      {/* DASHBOARD */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.45, delay: 0.14 }}
        className="mt-9"
      >
        <div className="mx-auto max-w-6xl">
          <DashboardFrame>
            {/* ✅ NO blanco: “screen” translúcido y claro */}
            <div className="bg-white/8">
              <div className="relative h-[260px] sm:h-[340px] md:h-[420px]">
                <Image
                  src={DASH_SRC}
                  alt="Dashboard Evaltia"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 94vw, 920px"
                />
              </div>
            </div>
          </DashboardFrame>

          <div className="mx-auto mt-5 h-9 w-[92%] rounded-full bg-black/40 blur-2xl" />
        </div>
      </motion.div>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona" className="scroll-mt-28 mt-12">
        <motion.div {...fadeUp} transition={{ duration: 0.35 }}>
          <div className={`rounded-3xl p-8 md:p-10 ${GLASS_CARD_STRONG}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Una plataforma pensada para el estudio real de la medicina
            </h2>

            <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed max-w-4xl">
              En Evaltia entendemos que estudiar medicina no es seguir un único
              método ni un único ritmo. Por eso construimos una plataforma que
              se adapta al contexto académico de cada estudiante.
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Estudia con libertad, mide tu progreso",
              d: "Visualiza tu avance real por cursos y temas.",
            },
            {
              n: "02",
              t: "Contenido alineado a tu universidad",
              d: "Material actualizado según tu currícula.",
            },
            {
              n: "03",
              t: "Evaltia mejora contigo",
              d: "Feedback real para mejorar el banco.",
            },
          ].map((i, idx) => (
            <motion.div
              key={idx}
              {...fadeUp}
              transition={{ duration: 0.35, delay: 0.05 * idx }}
              className={`rounded-2xl p-6 transition hover:bg-[#1e2f42]/80 ${GLASS_CARD}`}
            >
              <div className="text-xs text-white/60">{i.n}</div>
              <h3 className="mt-2 text-lg font-semibold text-white">{i.t}</h3>
              <p className="mt-2 text-sm text-white/80">{i.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* DIFERENCIADOR */}
      <div className="mt-14">
        <Differentiator />
      </div>

      {/* FAQ */}
      <div className="mt-14">
        <FAQEvaltia />
      </div>
    </section>
  );
}
