// File: /Users/jchevarria/Evaltia/src/app/(public)/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroEvaltia } from "./public components/HeroEvaltia";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Fondo tipo “moonlit fog” (SOLO landing) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176, 196, 222, 0.16) 0%, transparent 55%),
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

      {/* HEADER */}
      <header className="relative z-10 w-full px-6 py-4 flex justify-between items-center bg-[#06121F]/70 backdrop-blur-md sticky top-0 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/evaltia-logo.png" alt="Logo" width={40} height={40} priority />
          <span className="text-white text-lg font-semibold tracking-tight">Evaltia</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* “Cómo funciona” -> baja a la sección */}
          <Link href="/#como-funciona" className="text-white/90 text-sm hover:text-white transition">
            Cómo funciona
          </Link>

          <Link href="/login" className="text-white/90 text-sm hover:text-white transition">
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition"
          >
            Probar demo
          </Link>
        </div>
      </header>

      {/* LANDING */}
      <div className="relative z-10">
        <HeroEvaltia />
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#06121F]/70 backdrop-blur-md text-gray-200 pt-16 pb-10 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Evaltia</h4>
            <p className="text-white/70 text-xs leading-relaxed">
              Plataforma de estudio médico adaptada a tu ritmo. Simulacros, progreso y repaso inteligente.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Compañía</h4>
            <ul className="space-y-1 text-white/75">
              <li><a href="#" className="hover:text-white transition">Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Cursos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-1 text-white/75">
              <li><a href="#" className="hover:text-white transition">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-white transition">Política de privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Soporte</h4>
            <ul className="space-y-1 text-white/75">
              <li><a href="#" className="hover:text-white transition">Centro de ayuda</a></li>
              <li>
                <a href="mailto:soporte@evaltia.com" className="hover:text-white transition">
                  soporte@evaltia.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Evaltia. Todos los derechos reservados.
        </div>
      </footer>
    </main>
  );
}
