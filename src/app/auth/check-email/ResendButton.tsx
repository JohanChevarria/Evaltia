"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResendButton({ email }: { email: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    setMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setMsg(error.message);
      } else {
        setMsg("Listo. Si no llega, revisa Spam/Promociones.");
      }
    } catch (e) {
      setMsg("Error inesperado al reenviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={resend}
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-60"
      >
        {loading ? "Reenviando…" : "Reenviar correo"}
      </button>

      {msg && (
        <p className="mt-2 text-xs text-center text-slate-500 leading-relaxed">
          {msg}
        </p>
      )}
    </div>
  );
}
