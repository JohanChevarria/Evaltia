import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Brain, LineChart, Clock } from "lucide-react";
import type { ReactNode } from "react";

// Landing principal de Evaltia (hero + secciones) con foto + colores del hub
export function HeroEvaltia() {
  return (
    <main className="relative min-h-screen text-white overflow-hidden">
      {/* Fondo con FOTO + overlay con el mismo gradiente del hub */}
      <div className="absolute inset-0 -z-20">
        <Image
          src="/laptop-nuevo.png"
          alt="Estudiante de medicina usando Evaltia"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.5]"
        />
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.14) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176, 196, 222, 0.22) 0%, transparent 55%),
            linear-gradient(135deg, 
              #2c3e50 0%,
              #3a506b 25%,
              #435e79 50%,
              #516b87 75%,
              #5f7995 100%
            )
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.04) contrast(1.05)",
        }}
      />

      {/* CONTENIDO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-24 md:pt-28 md:pb-28 space-y-16">
        {/* HERO */}
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
              Tu camino más fácil
              <span className="block">para estudiar medicina.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-100/95 max-w-xl">
              Simulacros interactivos, calendario de estudio y seguimiento de tu
              progreso. Bancos de preguntas por tema adaptados a tu malla
              curricular, para que practiques exactamente lo que ves en clase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CTA principal: igual que el botón del header */}
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#06121F] shadow-lg shadow-slate-900/40 hover:bg-slate-100 transition"
            >
              Probar demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            {/* Botón secundario glassy */}
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-slate-50 hover:bg-white/20 transition backdrop-blur-sm"
            >
              Ver cómo funciona
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-100/80">
            Bancos construidos por estudiantes de medicina, con foco en los
            temas que realmente entran en tus exámenes.
          </p>
        </div>

        {/* SECCIÓN: Qué ofrece Evaltia */}
        <section id="features" className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Elige cuándo y cuánto estudiar.
            </h2>
            <p className="text-sm sm:text-base text-slate-100/90">
              Evaltia te da el control: arma simulacros por curso y tema, revisa
              tu progreso y decide si haces una práctica rápida de 10 preguntas
              o un simulacro largo antes del examen.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Brain className="h-5 w-5" />}
              title="Práctica por tema"
              text="Organizado por curso y tema, para que repases justo lo que estás viendo esta semana."
            />
            <FeatureCard
              icon={<LineChart className="h-5 w-5" />}
              title="Progreso claro"
              text="Detecta rápido qué cursos llevas fuertes y cuáles necesitan refuerzo antes del parcial o final."
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5" />}
              title="Se adapta a tu tiempo"
              text="Bloques cortos entre clases o sesiones largas: tú eliges el ritmo, Evaltia se encarga del resto."
            />
          </div>
        </section>

        {/* SECCIÓN: Adaptada a tu universidad + demo */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.3fr),minmax(0,1fr)] items-start">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              Adaptada a cómo se enseña medicina donde estudias.
            </h2>
            <p className="text-sm sm:text-base text-slate-100/90">
              Empezamos con la malla de Histología y Bioquímica de la USMP y
              luego sumaremos más universidades. La idea es que Evaltia hable el
              mismo idioma que tu sílabo y tu cronograma real.
            </p>
            <ul className="space-y-2 text-sm text-slate-100/90">
              <li>• Temas alineados a sílabos reales, no nombres genéricos.</li>
              <li>• Vista de progreso por curso y por tema.</li>
              <li>• Pensado para parciales, finales y simulacros tipo ENAM.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
              Demo rápida
            </p>
            <p className="text-sm text-slate-50">En la demo podrás:</p>
            <ul className="space-y-2 text-sm text-slate-100">
              <li>• Navegar por tu hub como si fueras un estudiante real.</li>
              <li>• Ver cómo se organizan cursos, temas y prácticas.</li>
              <li>• Probar la sensación de resolver preguntas dentro de Evaltia.</li>
            </ul>
            <Link
              href="/auth/register"
              className="inline-flex mt-2 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white hover:from-indigo-400 hover:to-cyan-300 transition"
            >
              Probar demo ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  text: string;
};

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-[0_18px_40px_rgba(15,23,42,0.55)]/40">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1.5 text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-100/90">{text}</p>
    </div>
  );
}
