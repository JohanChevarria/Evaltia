// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Lanzamos error claro en dev para evitar clientes "undefined"
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  );
}

// Exportamos de ambas formas para evitar conflictos de import
export const supabase = createClient(url, anon);
export default supabase;