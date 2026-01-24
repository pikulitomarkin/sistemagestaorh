/**
 * Aplica máscara de CPF no formato 000.000.000-00
 * @param {string} value - Valor a ser formatado
 * @returns {string} - CPF formatado
 */
export const maskCPF = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `${limited.slice(0, 3)}.${limited.slice(3)}`;
  } else if (limited.length <= 9) {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9, 11)}`;
  }
};

/**
 * Remove a máscara do CPF, retornando apenas números
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {string} - CPF apenas com números
 */
export const unmaskCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
};

/**
 * Valida o CPF usando o algoritmo oficial
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean} - true se válido, false se inválido
 */
export const validateCPF = (cpf) => {
  const cleanCPF = unmaskCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }
  
  return true;
};

/**
 * Valida se o CPF está completo (tem 11 dígitos)
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean} - true se completo, false se incompleto
 */
export const isCPFComplete = (cpf) => {
  const cleanCPF = unmaskCPF(cpf);
  return cleanCPF.length === 11;
};
