export const metadata = {
  title: "Panel de usuario | Evaltia",
  description: "Administra tu estudio y accede a tus cursos.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="hero-background min-h-screen text-white font-sans">
      {children}
    </section>
  );
}
