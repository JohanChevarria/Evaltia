"use client";

import Image from "next/image";
import Link from "next/link";

export function DashboardNavbar() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-evaltia-dark text-white">
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/images/evaltia-logo.png"
          alt="Logo"
          width={36}
          height={36}
        />
        <span className="text-lg font-bold">Evaltia</span>
      </Link>
      {/* Íconos (settings, perfil, etc.) pueden ir aquí más adelante */}
    </header>
  );
}