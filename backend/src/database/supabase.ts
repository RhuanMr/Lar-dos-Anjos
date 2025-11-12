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
    const { error } = await supabase.from('usuarios').select('count()', {
      count: 'exact',
      head: true,
    });

    if (error) {
      console.error('Erro ao conectar ao Supabase:', error.message);
      return false;
    }

    console.log('✓ Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
}
