"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  role?: string | null; // "admin" | "user"
  is_admin?: boolean | null;
  university_code?: string | null;
  uni_code?: string | null;
  university_short_name?: string | null;
};

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1) Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setErrorMsg("No se pudo obtener el usuario. Inténtalo nuevamente.");
        setLoading(false);
        return;
      }

      // 2) Leer perfil para decidir redirect
      // Ajusta nombres de columnas si tu schema usa otros.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_admin, university_code, uni_code, university_short_name")
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

      // Si tu tabla/proceso de creación de perfil aún no está listo,
      // no bloqueamos el login: caemos a dashboard user.
      if (profileError) {
        console.warn("Profile lookup error:", profileError.message);
      }

      const isAdmin =
        profile?.role === "admin" || profile?.is_admin === true;

      const uniCode =
        profile?.university_code ||
        profile?.uni_code ||
        profile?.university_short_name ||
        "usmp";

      const target = isAdmin ? `/studio/${uniCode}` : `/dashboard/main`;

      // 3) Redirect + refresh (para que server/middleware vean cookies)
      router.replace(target);
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error. Inténtalo nuevamente.");
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 text-white">
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

      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow">
              <Image
                src="/evaltia-logo.png"
                alt="Evaltia"
                width={24}
                height={24}
                priority
              />
            </div>
            <span className="font-semibold text-lg text-slate-800">
              Evaltia
            </span>
          </Link>

          <h1 className="text-2xl font-bold mt-2 text-slate-900">
            Inicia sesión
          </h1>
          <p className="text-sm text-slate-600 text-center max-w-xs leading-relaxed">
            Accede a tu progreso, simulacros personalizados y práctica
            inteligente.
          </p>
        </div>

        <p className="text-xs text-center text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/auth/register" className="text-indigo-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {errorMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">
              Contraseña
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 rounded-md border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition"
              >
                {showPassword ? (
                  <svg width="18" height="18" stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 004.243 4.243M5.121 5.121A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.52 10.52 0 01-4.293 5.774" />
                  </svg>
                ) : (
                  <svg width="18" height="18" stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-indigo-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
