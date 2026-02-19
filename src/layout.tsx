import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemy",
  description: "Tu plataforma para estudiantes de medicina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen w-full text-white bg-[#2c3e50]">
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(circle at 70% 30%, rgba(255,255,255,0.10) 0%, transparent 55%),
              radial-gradient(circle at 30% 70%, rgba(176,196,222,0.14) 0%, transparent 55%),
              linear-gradient(135deg,
                #2c3e50 0%,
                #3a506b 30%,
                #435e79 55%,
                #516b87 78%,
                #5f7995 100%
              )
            `,
            backgroundBlendMode: "soft-light, screen, normal",
            filter: "brightness(1.02) contrast(1.04)",
          }}
        />

        {children}
      </body>
    </html>
  );
}
