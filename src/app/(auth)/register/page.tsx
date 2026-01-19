// src/app/(auth)/register/page.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [firstName, setFirstName] = useState("");
  const [lastNameP, setLastNameP] = useState("");
  const [lastNameM, setLastNameM] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName || !lastNameP || !lastNameM || !username || !email || !password || !confirmPassword) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg("Debes aceptar los términos y condiciones.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMsg("La contraseña debe tener mínimo 8 caracteres, con mayúscula, minúscula y número.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // ✅ RUTA CORRECTA: (onboarding) NO aparece en URL
      // Tu página vive en /university (NO /onboarding/university)
      const redirectTo = `${window.location.origin}/university`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name_paterno: lastNameP,
            last_name_materno: lastNameM,
            username,
            accepted_terms: acceptedTerms,
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-16 text-white">
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

      <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 space-y-6 text-slate-900">
        <Link href="/" className="inline-block">
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow">
              <Image src="/evaltia-logo.png" alt="Evaltia" width={24} height={24} priority />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Evaltia</span>
              <span className="text-[11px] text-slate-500">
                Tu camino más fácil para estudiar medicina.
              </span>
            </div>
          </div>
        </Link>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-center mt-1">Crear cuenta</h1>
          <p className="text-xs text-center text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">Nombre</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">Apellido paterno</label>
              <input
                value={lastNameP}
                onChange={(e) => setLastNameP(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-slate-700">Apellido materno</label>
              <input
                value={lastNameM}
                onChange={(e) => setLastNameM(e.target.value)}
                className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Nombre de usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Mínimo 8 caracteres, con mayúscula, minúscula y número.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700">Repite la contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="text-xs flex items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            Acepto los términos y condiciones
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>
      </div>
    </main>
  );
}
