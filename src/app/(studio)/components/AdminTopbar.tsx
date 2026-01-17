"use client";

import { Search, Grid, Bell, User, Menu } from "lucide-react";
import Image from "next/image";

const EVALTIA_BLUE = "#3A5873";

export default function AdminTopbar({
  userName,
  university,
  collapsed,
  onToggleSidebar,
}: {
  userName: string;
  university: { shortName: string };
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  void collapsed;
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b">
      {/* LEFT: toggle + logo + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md transition hover:bg-gray-100"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>

        {/* LOGO + TEXTO */}
        <div className="flex items-center gap-2">
          {/* Logo con fondo azul oficial */}
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: EVALTIA_BLUE }}
          >
            <Image
              src="/evaltia-logo.png"
              alt="Evaltia"
              width={22}
              height={22}
              className="opacity-100"  // ← YA NO SE INVIERTE, SE VE BLANCO
            />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-[15px] text-gray-900">
              Evaltia Studio
            </span>
            <span className="text-[11px] text-gray-500">
              Panel de administración
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: University indicator */}
      <div className="hidden md:flex items-center gap-1 text-sm text-gray-700">
        <span className="text-xs text-gray-500">Universidad</span>
        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition text-sm">
          {university.shortName}
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* RIGHT: icons */}
      <div className="flex items-center gap-4">
        <Search className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
        <Grid className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />
        <Bell className="w-5 h-5 text-gray-600 hover:text-gray-800 cursor-pointer" />

        {/* USER */}
        <button className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition">
          <span className="hidden sm:block text-sm text-gray-700">{userName}</span>
          <span className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
            <User className="w-5 h-5 text-gray-700" />
          </span>
        </button>
      </div>
    </header>
  );
}
