/**
 * Serviço para consulta de CEP usando a API ViaCEP
 * Documentação: https://viacep.com.br/
 */

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export interface EnderecoViaCep {
  cep: string;
  endereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

/**
 * Valida o formato do CEP (deve ter 8 dígitos)
 */
export const validarCep = (cep: string): boolean => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
};

/**
 * Busca endereço por CEP usando a API ViaCEP
 * @param cep - CEP no formato de 8 dígitos (com ou sem formatação)
 * @returns Promise com os dados do endereço ou null se não encontrado
 */
export const buscarCep = async (cep: string): Promise<EnderecoViaCep | null> => {
  // Limpar CEP (remover formatação)
  const cepLimpo = cep.replace(/\D/g, '');

  // Validar formato
  if (!validarCep(cepLimpo)) {
    throw new Error('CEP inválido. Deve conter 8 dígitos.');
  }

  try {
    // Fazer requisição para a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar CEP: ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    // Verificar se o CEP foi encontrado
    if (data.erro) {
      return null;
    }

    // Mapear resposta da API para o formato interno
    return {
      cep: data.cep.replace(/\D/g, ''), // Remover formatação do CEP retornado
      endereco: data.logradouro || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error instanceof Error ? error : new Error('Erro desconhecido ao buscar CEP');
  }
};

export const cepService = {
  buscarCep,
  validarCep,
};

