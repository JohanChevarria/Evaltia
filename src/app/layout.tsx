import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exemy",
  description: "Tu plataforma para estudiantes de medicina",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
