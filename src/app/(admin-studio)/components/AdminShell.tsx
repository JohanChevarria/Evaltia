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
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      <AdminTopbar
        university={university}
        userName={userName}
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed(!collapsed)}
      />

      <div className="flex flex-1">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
