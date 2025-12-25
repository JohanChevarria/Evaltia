"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Settings, Users } from "lucide-react";

export function DashboardNavbar() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between bg-evaltia-dark text-white">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <Image
          src="/images/evaltia-logo.png"
          alt="Logo"
          width={36}
          height={36}
        />
        <span className="text-lg font-bold">Evaltia</span>
      </Link>

      {/* Íconos derecha */}
      <div className="flex items-center gap-4">
        {/* Amigos */}
        <Link
          href="/dashboard/user/amigos"
          className="h-9 w-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
        >
          <Users className="h-5 w-5" />
        </Link>

        {/* Configuración */}
        <Link
          href="/dashboard/user/configuracion"
          className="h-9 w-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
        >
          <Settings className="h-5 w-5" />
        </Link>

        {/* Perfil */}
        <Link
          href="/dashboard/user/perfil"
          className="h-9 w-9 rounded-full border border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}