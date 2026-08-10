/**
 * Formatting utilities for BRL currency and PT-BR dates
 */

export const formatBRL = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseBRLInput = (valueString: string): number => {
  // Cleans input strings like "1.200,50" or "R$ 1.200,50" or "1200.5" into number
  if (!valueString) return 0;
  const cleaned = valueString
    .replace(/[^\d,-]/g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatDateBR = (isoDateStr: string): string => {
  if (!isoDateStr) return '';
  const parts = isoDateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDateStr;
};

export const getMonthName = (monthNumberZeroIndexed: number): string => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[monthNumberZeroIndexed] || '';
};

export const formatMonthYearHeader = (monthYear: string): string => {
  // monthYear format: 'YYYY-MM'
  if (!monthYear || !monthYear.includes('-')) return '';
  const [year, month] = monthYear.split('-');
  const monthIdx = parseInt(month, 10) - 1;
  const name = getMonthName(monthIdx);
  return `${name.toUpperCase()} ${year}`;
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  debito: 'Débito',
  credito: 'Crédito',
  transferencia: 'Transferência',
  boleto: 'Boleto',
  outro: 'Outro',
};

export const EXPENSE_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixo',
  variable: 'Variável',
};

export const RECURRENCE_LABELS: Record<string, string> = {
  none: 'Não recorrente',
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
};
