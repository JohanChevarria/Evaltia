"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroEvaltia } from "../components/HeroEvaltia";

export default function Home() {
  return (
    <>
      {/* HEADER */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-[#06121F] sticky top-0 z-50 shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/evaltia-logo.png" alt="Logo" width={40} height={40} priority />
          <span className="text-white text-lg font-semibold">Evaltia</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-white text-sm hover:underline">
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="bg-white text-black px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition"
          >
            Probar demo
          </Link>
        </div>
      </header>

      {/* LANDING PRINCIPAL */}
      <HeroEvaltia />

      {/* FOOTER */}
      <footer className="bg-[#0B1B34] text-gray-300 pt-16 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Evaltia</h4>
            <p className="text-gray-400 text-xs">
              Plataforma de estudio médico adaptada a tu ritmo.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Compañía</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Nosotros</a></li>
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Cursos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Términos y condiciones</a></li>
              <li><a href="#" className="hover:underline">Política de privacidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Soporte</h4>
            <ul className="space-y-1">
              <li><a href="#" className="hover:underline">Centro de ayuda</a></li>
              <li><a href="mailto:soporte@evaltia.com" className="hover:underline">soporte@evaltia.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Evaltia. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}