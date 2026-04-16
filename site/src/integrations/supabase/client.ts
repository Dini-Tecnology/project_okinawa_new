// Supabase browser client (env-driven; see fallbacks below when .env is missing).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// createClient throws if the URL is missing ("supabaseUrl is required"), which breaks the whole
// app (white screen) when .env is not present. Vite loads env from repo root (vite envDir: "..").
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "http://127.0.0.1:54321";
/** Local Supabase CLI default anon key — only used when VITE_SUPABASE_PUBLISHABLE_KEY is unset */
const DEV_FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEV_FALLBACK_ANON_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});