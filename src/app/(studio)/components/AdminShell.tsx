"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({
  children,
  university,
  userName,
}: {
  children: React.ReactNode;
  university: { shortName: string };
  userName: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fb] overflow-hidden">
      <div className="shrink-0">
        <AdminTopbar
          university={university}
          userName={userName}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />
      </div>

      <div className="flex flex-1 min-h-0">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
