// src/lib/supabase.ts
// ❌ NO USAR: este cliente causa mezcla de auth (localStorage) vs SSR cookies.
// ✅ Usa:
// - "@/lib/supabase/client" en componentes "use client"
// - "@/lib/supabase/server" en server components / route handlers / middleware

throw new Error(
  "No uses src/lib/supabase.ts. Usa '@/lib/supabase/client' (browser SSR) o '@/lib/supabase/server' (server SSR)."
);
