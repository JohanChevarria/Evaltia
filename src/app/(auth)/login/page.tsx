"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const FORGOT_PASSWORD_PATH = "/forgot-password";
const UNIVERSITY_ONBOARDING_PATH = "/university";

type ProfileRow = {
  id: string;
  role?: string | null;

  university_id?: string | null;

  onboarding_completed?: boolean | null;
  university_onboarding_completed?: boolean | null;
};

function safeLower(x: string | null | undefined) {
  return (x ?? "").trim().toLowerCase();
}

function formatSupabaseError(err: any) {
  if (!err) return "unknown_error";
  return JSON.stringify(
    {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint,
      status: err.status,
      name: err.name,
    },
    null,
    2
  );
}

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, university_id, onboarding_completed, university_onboarding_completed")
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

      if (profileError) {
        console.error("profiles select error:", profileError);
        setErrorMsg("profiles select error:\n" + formatSupabaseError(profileError));
        setLoading(false);
        return;
      }

      if (!profile) {
        setErrorMsg(
          "No se encontró tu fila en profiles (profile=null). Verifica que exista profiles.id = auth.user.id"
        );
        setLoading(false);
        return;
      }

      const isAdmin = safeLower(profile.role) === "admin";

      const hasUniversityId = !!profile.university_id;

      if (isAdmin) {
        if (!hasUniversityId) {
          setErrorMsg(
            "Tu cuenta admin no tiene university_id en profiles. Asigna university_id a este admin (pre-afiliación) y vuelve a intentar."
          );
          setLoading(false);
          return;
        }

        const { data: uniRow, error: uniErr } = await supabase
          .from("universities")
          .select("code")
          .eq("id", profile.university_id!)
          .maybeSingle();

        if (uniErr) {
          console.error("universities select error:", uniErr);
          setErrorMsg("universities select error:\n" + formatSupabaseError(uniErr));
          setLoading(false);
          return;
        }

        const uni = safeLower(uniRow?.code) || "usmp";
        window.location.replace(`/studio/${uni}`);
        return;
      }

      const uniOnboardingDone = profile.university_onboarding_completed === true;

      if (!uniOnboardingDone || !hasUniversityId) {
        window.location.replace(UNIVERSITY_ONBOARDING_PATH);
        return;
      }

      const { data: uniRow, error: uniErr } = await supabase
        .from("universities")
        .select("code")
        .eq("id", profile.university_id!)
        .maybeSingle();

      if (uniErr) {
        console.error("universities select error:", uniErr);
        setErrorMsg("universities select error:\n" + formatSupabaseError(uniErr));
        setLoading(false);
        return;
      }

      const uni = safeLower(uniRow?.code) || "usmp";
      window.location.replace(`/dashboard/${uni}/main`);
      return;
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error. Inténtalo nuevamente.");
      setLoading(false);
      return;
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
              <Image src="/evaltia-logo.png" alt="Exemy" width={24} height={24} priority />
            </div>
            <span className="font-semibold text-lg text-slate-800">Exemy</span>
          </Link>

          <h1 className="text-2xl font-bold mt-2 text-slate-900">Inicia sesión</h1>
          <p className="text-sm text-slate-600 text-center max-w-xs leading-relaxed">
            Accede a tu progreso, simulacros personalizados y práctica inteligente.
          </p>
        </div>

        <p className="text-xs text-center text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/register" className="text-indigo-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>

        {errorMsg && (
          <pre className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded whitespace-pre-wrap">
            {errorMsg}
          </pre>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-700">Correo electrónico</label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Contraseña</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-12 rounded-md border border-slate-300 text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition"
                disabled={loading}
                aria-label="Mostrar/Ocultar contraseña"
              >
                {showPassword ? (
                  <svg width="18" height="18" stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 3l18 18M10.5 10.5a3 3 0 004.243 4.243M5.121 5.121A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.52 10.52 0 01-4.293 5.774"
                    />
                  </svg>
                ) : (
                  <svg width="18" height="18" stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href={FORGOT_PASSWORD_PATH} className="text-xs text-indigo-600 hover:underline">
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
