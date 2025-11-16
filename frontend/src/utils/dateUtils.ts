/**
 * Utilitários para formatação de datas
 * Corrige problemas de timezone ao converter datas do formato YYYY-MM-DD
 */

/**
 * Formata uma data no formato brasileiro (DD/MM/YYYY)
 * Corrige o problema de timezone que faz a data aparecer 1 dia antes
 * 
 * @param dateString - Data no formato YYYY-MM-DD ou ISO string
 * @returns Data formatada no formato DD/MM/YYYY ou '-' se vazia
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  // Se a data já está no formato YYYY-MM-DD (sem hora), criar Date no timezone local
  // Isso evita o problema de timezone que faz a data aparecer 1 dia antes
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  }
  
  // Se já tem hora/timezone, usar normalmente
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data com hora no formato brasileiro
 * 
 * @param dateString - Data no formato ISO string
 * @returns Data e hora formatada no formato DD/MM/YYYY HH:mm ou '-' se vazia
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Converte uma string de data YYYY-MM-DD para Date no timezone local
 * Evita problemas de timezone
 * 
 * @param dateString - Data no formato YYYY-MM-DD
 * @returns Objeto Date no timezone local
 */
export const parseLocalDate = (dateString: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
};

