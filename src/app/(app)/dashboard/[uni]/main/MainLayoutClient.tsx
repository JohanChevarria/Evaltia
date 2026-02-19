"use client";

import DashboardNavbar from "@/app/(app)/nav/DashboardNavbar";

export default function MainLayoutClient({
  children,
  uni,
}: {
  children: React.ReactNode;
  uni: string;
}) {
  return (
    <div className="relative min-h-screen w-full text-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
            radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
            linear-gradient(135deg, #2c3e50 0%, #3a506b 30%, #435e79 55%, #516b87 78%, #5f7995 100%)
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.02) contrast(1.04)",
        }}
      />

      <section className="relative z-10 px-6 pt-7 pb-10 max-w-7xl mx-auto">
        <DashboardNavbar uni={uni} />

        <div className="mt-10">{children}</div>
      </section>
    </div>
  );
}
