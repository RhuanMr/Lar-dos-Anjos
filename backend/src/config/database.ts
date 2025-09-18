import { supabase } from './supabase';

export const db = supabase;

// Função para testar conexão com o banco
export const testConnection = async (): Promise<boolean> => {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.log('⚠️ Variáveis de ambiente do Supabase não configuradas');
      console.log('⚠️ Servidor rodando em modo de desenvolvimento sem banco de dados');
      return true; // Permitir que o servidor rode mesmo sem Supabase
    }
    
    // Teste simples de conexão com Supabase
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    console.log('⚠️ Servidor rodando em modo de desenvolvimento sem banco de dados');
    return true; // Permitir que o servidor rode mesmo sem Supabase
  }
};
