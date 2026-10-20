import { createClient } from '@supabase/supabase-js';

const isConfigured: boolean = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || 'https://zxamlpfvggvoynhssbzd.supabase.co';
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YW1scGZ2Z2d2b3luaHNzYnpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4OTcxNDYsImV4cCI6MjA5NzQ3MzE0Nn0.ooXFK1txYdWUhuW9KQ7ekXRDFCwI8YXmdXllC2nsMO4';

// Wrapper function to inject a random 2 to 40 seconds delay into every data fetch & update
const randomDelayFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const delayMs = Math.floor(Math.random() * (40000 - 2000 + 1)) + 2000;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return fetch(input, init);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: randomDelayFetch,
  },
});

export { isConfigured };
