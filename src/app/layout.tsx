import "./globals.css";

export const metadata = {
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
      <body className="text-[14px] leading-normal antialiased bg-black">
        {children}
      </body>
    </html>
  );
}
