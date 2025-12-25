"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSentTo(null);

    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const redirectTo = `${origin}/update-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
        redirectTo,
      });

      if (error) throw error;

      setSentTo(normalized);
      setEmail("");
    } catch (err: any) {
      setError(err?.message ?? "No se pudo enviar el enlace. Intenta otra vez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-16 text-white">
      {/* Fondo Evaltia */}
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

      <div className="relative z-10 w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 space-y-6 text-slate-900">
        {/* Logo Evaltia */}
        <Link href="/" className="flex items-center justify-center">
          <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center shadow">
            <Image
              src="/evaltia-logo.png"
              alt="Evaltia"
              width={26}
              height={26}
              priority
            />
          </div>
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">¿Olvidaste tu contraseña?</h1>
          <p className="text-sm text-slate-500">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </div>
        )}

        {sentTo && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
            Enviamos el enlace a{" "}
            <span className="font-medium">{sentTo}</span>. Revisa tu correo
            (y spam).
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Enviando enlace..." : "Enviar enlace"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
