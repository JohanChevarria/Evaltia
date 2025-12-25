export const metadata = {
  title: "Evaltia",
  description: "Tu camino más fácil para estudiar medicina.",
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
