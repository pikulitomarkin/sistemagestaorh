/**
 * ============================================
 * INSS Service - Cálculo Progressivo CLT
 * ============================================
 * Implementa a lógica de cálculo do INSS conforme
 * tabela progressiva 2024/2025
 */

// Tabela INSS 2024/2025
export const INSS_TABLE = [
  { min: 0, max: 1412.00, rate: 7.5 },
  { min: 1412.01, max: 2666.68, rate: 9.0 },
  { min: 2666.69, max: 4000.03, rate: 12.0 },
  { min: 4000.04, max: 7786.02, rate: 14.0 },
];

/**
 * Calcula o INSS progressivo
 * @param {number} salary - Salário mensal bruto
 * @returns {number} - Valor do INSS a descontar
 */
export function calculateINSS(salary) {
  let remaining = salary;
  let totalINSS = 0;

  for (const bracket of INSS_TABLE) {
    if (remaining <= 0) break;

    const bracketBase = Math.min(remaining, bracket.max - bracket.min);
    const bracketINSS = bracketBase * (bracket.rate / 100);

    totalINSS += bracketINSS;
    remaining -= bracketBase;
  }

  return Number(totalINSS.toFixed(2));
}

/**
 * Calcula o FGTS (8% sobre salário bruto)
 * @param {number} salary - Salário mensal bruto
 * @returns {number} - Valor do FGTS provisionado
 */
export function calculateFGTS(salary) {
  return Number((salary * 0.08).toFixed(2));
}

/**
 * Calcula desconto por faltas
 * @param {number} monthlySalary - Salário mensal
 * @param {number} absenceDays - Número de dias de falta
 * @returns {number} - Valor a descontar
 */
export function calculateAbsenceDeduction(monthlySalary, absenceDays) {
  const dailyRate = monthlySalary / 20;
  return Number((dailyRate * absenceDays).toFixed(2));
}

/**
 * Calcula valor de horas extras
 * @param {number} monthlySalary - Salário mensal
 * @param {number} hours - Número de horas extras
 * @param {number} multiplier - Multiplicador (1.5 ou 2.0)
 * @returns {number} - Valor das horas extras
 */
export function calculateOvertime(monthlySalary, hours, multiplier) {
  const hourlyRate = monthlySalary / 220; // 220 horas mensais
  return Number((hourlyRate * hours * multiplier).toFixed(2));
}

/**
 * Calcula folha de pagamento completa
 * @param {Object} params - Parâmetros da folha
 * @returns {Object} - Cálculo completo
 */
export function calculatePayroll(params) {
  const {
    monthlySalary,
    cycle,
    overtimeHours50 = 0,
    overtimeHours100 = 0,
    absences = 0,
  } = params;

  // Salário base do ciclo (50%)
  const grossPay = monthlySalary / 2;

  // Horas extras
  const overtimePay50 = calculateOvertime(monthlySalary, overtimeHours50, 1.5);
  const overtimePay100 = calculateOvertime(monthlySalary, overtimeHours100, 2.0);

  // Descontos
  const absenceDeduction = calculateAbsenceDeduction(monthlySalary, absences);
  const inssAmount = cycle === 2 ? calculateINSS(monthlySalary) : 0;

  // Totais
  const totalEarnings = grossPay + overtimePay50 + overtimePay100;
  const totalDeductions = inssAmount + absenceDeduction;
  const netPay = totalEarnings - totalDeductions;

  // FGTS (provisionado, não descontado)
  const fgtsAmount = calculateFGTS(monthlySalary);

  return {
    baseSalary: monthlySalary,
    cycle,
    grossPay,
    overtimePay50,
    overtimePay100,
    absenceDeduction,
    inssAmount,
    fgtsAmount,
    totalEarnings,
    totalDeductions,
    netPay,
  };
}
