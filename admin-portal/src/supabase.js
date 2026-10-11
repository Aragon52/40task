import { createClient } from '@supabase/supabase-js';

const isConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zxamlpfvggvoynhssbzd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YW1scGZ2Z2d2b3luaHNzYnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4OTcxNDYsImV4cCI6MjA5NzQ3MzE0Nn0.ooXFK1txYdWUhuW9KQ7ekXRDFCwI8YXmdXllC2nsMO4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { isConfigured };

