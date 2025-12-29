// src/app/(app)/nav/DashboardNavbar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Settings, Users } from "lucide-react";

export default function DashboardNavbar({ uni }: { uni: string }) {
  const baseAccount = `/dashboard/${uni}/account`;

  return (
    <div className="w-full flex items-center justify-between">
      <Link href={`/dashboard/${uni}/main`} className="flex items-center gap-3">
        <Image src="/evaltia-logo.png" alt="Evaltia" width={34} height={34} priority />
        <span className="text-xl font-semibold">Evaltia</span>
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href={`${baseAccount}/amigos`}
          title="Amigos"
          className="h-10 w-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        >
          <Users className="h-5 w-5" />
        </Link>

        <Link
          href={`${baseAccount}/configuracion`}
          title="Configuración"
          className="h-10 w-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        >
          <Settings className="h-5 w-5" />
        </Link>

        <Link
          href={`${baseAccount}/perfil`}
          title="Perfil"
          className="h-10 w-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
        >
          <User className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
