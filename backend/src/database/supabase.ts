import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'SUPABASE_URL e SUPABASE_ANON_KEY devem ser definidas em .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    // Tentar acessar a tabela users
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      // Erro de tabela não encontrada
      if (
        error.code === 'PGRST116' ||
        error.message.includes('does not exist') ||
        error.message.includes('relation') ||
        error.message.includes('not found')
      ) {
        console.warn('⚠️ Tabela "users" não encontrada.');
        console.warn('   Certifique-se de que o banco de dados foi criado.');
        console.warn('   Erro:', error.message);
        console.warn('   Código:', error.code);
        return false;
      }

      // Erro de permissão (RLS)
      if (
        error.message.includes('permission') ||
        error.message.includes('RLS') ||
        error.message.includes('policy') ||
        error.code === '42501' ||
        error.code === 'PGRST301'
      ) {
        console.warn('⚠️ Erro de permissão ao acessar tabela "users".');
        console.warn('   Verifique as políticas RLS (Row Level Security) no Supabase.');
        console.warn('   Erro:', error.message);
        console.warn('   Código:', error.code);
        console.warn('');
        console.warn('   💡 Solução temporária (desenvolvimento):');
        console.warn('   1. Acesse Supabase Dashboard → Authentication → Policies');
        console.warn('   2. Selecione a tabela "users"');
        console.warn('   3. Desabilite RLS ou crie uma política que permita acesso');
        return false;
      }

      // Outros erros
      console.error('❌ Erro ao conectar ao Supabase:');
      console.error('   Mensagem:', error.message);
      console.error('   Código:', error.code);
      if (error.details) console.error('   Detalhes:', error.details);
      if (error.hint) console.error('   Dica:', error.hint);
      return false;
    }

    console.log('✓ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error: any) {
    console.error('❌ Erro inesperado ao testar conexão:');
    console.error('   ', error?.message || error);
    return false;
  }
}
