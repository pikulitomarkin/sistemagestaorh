import { clsx } from "clsx";

/**
 * Combina classes CSS usando clsx
 */
export function cn(...inputs) {
  return clsx(inputs);
}

/**
 * Formata valor monetário em BRL
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data no padrão brasileiro
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

/**
 * Formata data com hora
 */
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(date));
}

/**
 * Calcula o valor por hora com base no salário mensal
 */
export function calculateHourlyRate(monthlySalary) {
  return monthlySalary / 220; // 220 horas mensais
}

/**
 * Trunca texto com elipsis
 */
export function truncate(str, length = 50) {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Debounce function para otimizar buscas
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
