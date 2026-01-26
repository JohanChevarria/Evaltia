import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import ResendButton from "./ResendButton";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const { email } = await searchParams;

  // ðŸš« Si no hay email en la URL, redirigimos a register
  if (!email) {
    redirect("/register");
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 text-white">
      {/* Fondo igual al login/register */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 30% 70%, rgba(176, 196, 222, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, 
              #2c3e50 0%,
              #3a506b 25%,
              #435e79 50%,
              #516b87 75%,
              #5f7995 100%
            )
          `,
          backgroundBlendMode: "soft-light, screen, normal",
          filter: "brightness(1.05) contrast(1.05)",
        }}
      />

      {/* Tarjeta */}
      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 text-slate-900">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow">
            <Image
              src="/evaltia-logo.png"
              alt="Exemy"
              width={26}
              height={26}
              priority
            />
          </div>

          <h1 className="text-2xl font-bold mt-2 text-slate-900 text-center">
            Confirma tu correo
          </h1>

          <p className="text-sm text-slate-600 text-center leading-relaxed max-w-xs">
            Te enviamos un enlace de verificaciÃ³n a{" "}
            <span className="font-semibold">{email}</span>. Revisa tu bandeja
            de entrada y carpeta de spam.
          </p>
        </div>

        {/* Botones */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Ya confirmÃ© â†’ Iniciar sesiÃ³n
          </Link>

          {/* Resend, estilo â€œsecundarioâ€ y limpio */}
          <ResendButton email={email} />

          <p className="text-xs text-slate-500 text-center">
            Â¿Correo incorrecto?{" "}
            <Link href="/register" className="text-indigo-600 underline">
              registrarme otra vez
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

