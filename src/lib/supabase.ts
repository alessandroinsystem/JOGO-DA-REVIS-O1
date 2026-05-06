import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Apenas inicializa o cliente se as variáveis existirem e não forem os placeholders do template
const isValidConfig = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project');

export const supabase = isValidConfig 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

if (!isValidConfig) {
  console.error('ERRO: Configuração do Supabase ausente ou inválida. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nos Secrets.');
}
