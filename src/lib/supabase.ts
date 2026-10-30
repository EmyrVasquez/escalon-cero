import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// La anon key es pública por diseño: el acceso a los datos lo controlan
// las políticas de Row Level Security definidas en supabase/schema.sql.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
