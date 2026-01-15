// File: /Users/jchevarria/Evaltia/src/app/(public)/public components/HeroEvaltia.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Differentiator from "./Differentiator";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// 👉 TU screenshot real
const DASH_SRC = "/landing/dashboard-screenshot.png";

function DashboardFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="
      relative overflow-hidden rounded-3xl
      border border-white/20 bg-white/10 backdrop-blur-md
      shadow-[0_28px_70px_rgba(0,0,0,0.20)]
    ">
      {/* Barra superior tipo app */}
      <div className="
        absolute top-0 left-0 right-0 h-12
        border-b border-white/15 bg-white/10
        flex items-center px-4 gap-2 z-10
      ">
        <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="ml-4 h-2 w-40 rounded bg-white/25" />
      </div>

      {/* Contenido */}
      <div className="pt-12">{children}</div>
    </div>
  );
}

export function HeroEvaltia() {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pt-14 pb-20">

      {/* HERO TEXT */}
      <div className="text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.35 }}
          className="text-white/85 text-sm"
        >
          Bienvenido a Evaltia
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.38, delay: 0.03 }}
          className="
            mt-5 text-4xl md:text-6xl lg:text-7xl
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
            mt-5 mx-auto max-w-3xl
            text-base md:text-lg text-white/85
            leading-relaxed
          "
        >
          Diseñada para integrarse a tu ritmo, tu contexto
          y tu forma de aprender medicina.
        </motion.p>

        {/* BOTONES */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/register"
            className="
              rounded-xl bg-white px-7 py-3
              text-[#0b1a2b] font-semibold
              hover:bg-white/90 transition
              shadow-[0_10px_18px_rgba(0,0,0,0.18)]
            "
          >
            Probar demo
          </Link>

          <Link
            href="/#como-funciona"
            className="
              rounded-xl border border-white/25
              bg-white/10 px-7 py-3
              text-white/95
              hover:bg-white/15 transition
            "
          >
            Ver cómo funciona
          </Link>
        </motion.div>
      </div>

      {/* DASHBOARD (FIJO, SIN SUPERPOSICIÓN) */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="mt-14"
      >
        <div className="mx-auto max-w-6xl">
          <DashboardFrame>
            <div className="
              relative h-[260px]
              sm:h-[340px]
              md:h-[420px]
            ">
              <Image
                src={DASH_SRC}
                alt="Dashboard Evaltia"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 94vw, 920px"
              />
            </div>
          </DashboardFrame>

          {/* sombra */}
          <div className="
            mx-auto mt-6
            h-10 w-[92%]
            rounded-full bg-black/20
            blur-2xl
          " />
        </div>
      </motion.div>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona" className="scroll-mt-28 mt-16">
        <motion.div {...fadeUp} transition={{ duration: 0.35 }}>
          <div className="
            rounded-3xl border border-white/20
            bg-white/10 backdrop-blur-md
            p-8 md:p-10
            shadow-[0_16px_40px_rgba(0,0,0,0.12)]
          ">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Una plataforma pensada para el estudio real de la medicina
            </h2>

            <p className="
              mt-4 text-sm md:text-base
              text-white/85 leading-relaxed
              max-w-4xl
            ">
              En Evaltia entendemos que estudiar medicina
              no es seguir un único método ni un único ritmo.
              Por eso construimos una plataforma que se adapta
              al contexto académico de cada estudiante.
            </p>
          </div>
        </motion.div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Estudia con libertad, mide tu progreso",
              d: "Visualiza tu avance real por cursos y temas."
            },
            {
              n: "02",
              t: "Contenido alineado a tu universidad",
              d: "Material actualizado según tu currícula."
            },
            {
              n: "03",
              t: "Evaltia mejora contigo",
              d: "Feedback real para mejorar el banco."
            }
          ].map((i, idx) => (
            <motion.div
              key={idx}
              {...fadeUp}
              transition={{ duration: 0.35, delay: 0.05 * idx }}
              className="
                rounded-2xl border border-white/20
                bg-white/10 backdrop-blur-md
                p-6 hover:bg-white/15 transition
              "
            >
              <div className="text-xs text-white/70">{i.n}</div>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {i.t}
              </h3>
              <p className="mt-2 text-sm text-white/85">
                {i.d}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECCIÓN INFERIOR */}
      <Differentiator />
    </section>
  );
}
