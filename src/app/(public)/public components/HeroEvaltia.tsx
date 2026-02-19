"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Differentiator from "./Differentiator";
import FAQEvaltia from "./FAQEvaltia";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function DashboardFrame() {
  return (
    <div className="relative mx-auto w-full max-w-[1350px]">
      <div className="relative aspect-[1100/638]">
        <Image
          src="/landing/mock-dashboard.png"
          alt="Dashboard Exemy"
          fill
          priority
          sizes="100vw"
          className="object-contain drop-shadow-[0_60px_120px_rgba(0,0,0,0.6)]"
        />
      </div>
    </div>
  );
}

export function HeroEvaltia() {
  return (
    <section className="relative mx-auto w-full max-w-[1500px] px-6 pt-6 pb-16">
      <div className="text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4 }}
          className="text-[12px] md:text-sm font-semibold tracking-[0.18em] uppercase text-white/70"
        >
          Bienvenido a Exemy
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-3 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white"
        >
          El mejor camino para tu{" "}
          <span className="text-white/95">formación médica</span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-3 mx-auto max-w-3xl text-base md:text-lg text-white/80 leading-relaxed"
        >
          Diseñada para integrarse a tu ritmo, tu contexto y tu forma de aprender
          medicina.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-6 flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-3 text-[#0b1a2b] font-semibold hover:bg-white/90 transition shadow-[0_15px_25px_rgba(0,0,0,0.3)]"
          >
            Probar demo
          </Link>

          <Link
            href="/#como-funciona"
            className="rounded-xl bg-[#1e2f42]/70 backdrop-blur-sm px-8 py-3 text-white hover:bg-[#1e2f42]/80 transition"
          >
            Ver cómo funciona
          </Link>
        </motion.div>
      </div>

      <motion.div
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8"
      >
        <DashboardFrame />
      </motion.div>

      <div id="como-funciona" className="scroll-mt-28 mt-20">
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
          <div className="rounded-3xl p-10 bg-[#1e2f42]/80 backdrop-blur-sm shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Una plataforma pensada para el estudio real de la medicina
            </h2>

            <p className="mt-4 text-sm md:text-base text-white/85 leading-relaxed max-w-4xl">
              En Exemy entendemos que estudiar medicina no es seguir un único
              método ni un único ritmo. Por eso construimos una plataforma que
              se adapta al contexto académico de cada estudiante.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
              t: "Exemy mejora contigo",
              d: "Feedback real para mejorar el banco.",
            },
          ].map((i, idx) => (
            <motion.div
              key={idx}
              {...fadeUp}
              transition={{ duration: 0.4, delay: 0.05 * idx }}
              className="rounded-2xl p-6 bg-[#1e2f42]/70 backdrop-blur-sm shadow-[0_40px_80px_rgba(0,0,0,0.35)] transition hover:bg-[#1e2f42]/80"
            >
              <div className="text-xs text-white/60">{i.n}</div>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {i.t}
              </h3>
              <p className="mt-2 text-sm text-white/80">{i.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-24">
        <Differentiator />
      </div>

      <div className="mt-24">
        <FAQEvaltia />
      </div>
    </section>
  );
}
