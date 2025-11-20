"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../lib/utils";

export function HeroEvaltia() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Imagen de fondo */}
      <Image
        src="/images/thought-catalog-UK78i6vK3sc-unsplash.jpg"
        alt="Hero background"
        layout="fill"
        objectFit="cover"
        priority
      />

      {/* Capa oscura con degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050E1E]/80 to-transparent z-10" />

      {/* Header sticky con cambio de fondo */}
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-20 transition-colors duration-300",
          scrolled ? "bg-[#06121F]/90 shadow-md" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-white font-semibold text-lg">
            <Image src="/evaltia-logo.png" alt="Logo" width={40} height={40} />
            Evaltia
          </Link>
          <Link
            href="/register"
            className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
          >
            Probar demo
          </Link>
        </div>
      </header>

      {/* Contenido del hero */}
      <section className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-3xl"
        >
          Toma el control de tu estudio con Evaltia
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 text-lg md:text-xl max-w-xl text-white/90"
        >
          Simulacros interactivos, calendario de estudio y seguimiento de tu progreso. Todo en una sola app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-10"
        >
          <Link
            href="/register"
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition"
          >
            Probar demo
          </Link>
        </motion.div>
      </section>
    </div>
  );
}