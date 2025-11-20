import "./globals.css";
export const metadata = {
  title: "Evaltia",
  description: "Tu plataforma para estudiantes de medicina",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
