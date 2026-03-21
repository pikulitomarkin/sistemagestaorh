using HRManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HRManagementAPI.Services
{
    // Enum para definir o ciclo de pagamento
    public enum CycleType
    {
        FirstCycle, // Dia 20
        SecondCycle // Dia 05
    }

    public class PayrollCalculationService
    {
        private readonly INSSService _inssService;
        private readonly AppDbContext _context;
        private const decimal FGTSRate = 0.08m;

        public PayrollCalculationService(INSSService inssService, AppDbContext context)
        {
            _inssService = inssService;
            _context = context;
        }

        /// <summary>
        /// Método principal que orquestra o cálculo da folha para um ciclo específico.
        /// </summary>
        public async Task<CyclePayResult> CalculateCyclePay(int employeeId, CycleType cycleType, DateTime referenceDate, bool includeOvertime = true, bool includeDoubleTime = true)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null)
            {
                throw new ArgumentException("Employee not found");
            }

            var (startDate, endDate) = GetDateRangeForCycle(cycleType, referenceDate);

            // Buscar lançamentos de ponto no período
            var attendances = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date.Date >= startDate.Date && a.Date.Date <= endDate.Date)
                .ToListAsync();

            int absenceDays = attendances.Count(a => a.IsAbsent);
            decimal overtimeHours = includeOvertime ? attendances.Sum(a => a.OvertimeHours) : 0m;
            decimal doubleTimeHours = includeDoubleTime ? attendances.Sum(a => a.DoubleTimeHours) : 0m;

            // Cálculos financeiros
            decimal hourlyRate = employee.HourlyRate;
            decimal baseAmountForCycle = employee.MonthlySalary / 2; // 50% para cada ciclo
            
            // Regra de negócio: Falta = Salário / 20. Usamos o salário base MENSAL.
            decimal absenceDeduction = (employee.MonthlySalary / 20m) * absenceDays;

            decimal overtimeValue = CalculateOvertimeValue(employee.OvertimeHourlyRate, hourlyRate, overtimeHours);
            decimal doubleTimeValue = CalculateDoubleTimeValue(employee.DoubleTimeHourlyRate, hourlyRate, doubleTimeHours);
            decimal totalAdditions = overtimeValue + doubleTimeValue;
            
            decimal grossPayForCycle = baseAmountForCycle + totalAdditions - absenceDeduction;

            decimal inssDeduction = 0;
            if (cycleType == CycleType.SecondCycle)
            {
                // No segundo ciclo (Dia 05), o INSS é calculado sobre o salário MENSAL total e descontado integralmente.
                inssDeduction = _inssService.CalculateINSS(employee.MonthlySalary);
            }
            // No primeiro ciclo (Dia 20), o INSS é zero.

            decimal netPayForCycle = grossPayForCycle - inssDeduction;

            // O FGTS é calculado sobre o salário mensal total, apenas para provisionamento.
            decimal fgtsProvision = CalculateFGTS(employee.MonthlySalary);

            return new CyclePayResult
            {
                EmployeeId = employeeId,
                EmployeeName = employee.Name,
                ReferenceDate = referenceDate,
                Cycle = cycleType.ToString(),
                PeriodStartDate = startDate,
                PeriodEndDate = endDate,
                
                BaseAmount = baseAmountForCycle,
                TotalAdditions = totalAdditions,
                TotalDeductions = absenceDeduction + inssDeduction,
                
                GrossPay = grossPayForCycle,
                NetPay = netPayForCycle,

                Breakdown = new PaymentBreakdown
                {
                    AbsenceDays = absenceDays,
                    AbsenceDeduction = absenceDeduction,
                    OvertimeHours = overtimeHours,
                    OvertimeValue = overtimeValue,
                    DoubleTimeHours = doubleTimeHours,
                    DoubleTimeValue = doubleTimeValue,
                    INSSDeduction = inssDeduction
                },
                
                Provisions = new ProvisionDetails
                {
                    FullMonthlySalary = employee.MonthlySalary,
                    FGTSAmount = fgtsProvision
                }
            };
        }

        private (DateTime startDate, DateTime endDate) GetDateRangeForCycle(CycleType cycleType, DateTime refDate)
        {
            if (cycleType == CycleType.FirstCycle) // Dia 20
            {
                // Lançamentos entre os dias 05 e 19 do mês de referência.
                var startDate = new DateTime(refDate.Year, refDate.Month, 5);
                var endDate = new DateTime(refDate.Year, refDate.Month, 19);
                return (startDate, endDate);
            }
            else // Dia 05
            {
                // Lançamentos entre o dia 20 do mês ANTERIOR e o dia 04 do mês ATUAL.
                var endDate = new DateTime(refDate.Year, refDate.Month, 4);
                var startDate = new DateTime(refDate.Year, refDate.Month, 20).AddMonths(-1);
                return (startDate, endDate);
            }
        }
        
        // --- Métodos de Apoio (já existentes ou ligeiramente modificados) ---

        public decimal CalculateHourlyRate(decimal monthlySalary, int monthlyHours)
        {
            if (monthlyHours <= 0) return 0;
            return monthlySalary / monthlyHours;
        }

        public decimal CalculateOvertimeValue(decimal configuredOvertimeRate, decimal fallbackHourlyRate, decimal overtimeHours)
            => (configuredOvertimeRate > 0 ? configuredOvertimeRate : fallbackHourlyRate) * overtimeHours;

        public decimal CalculateDoubleTimeValue(decimal configuredDoubleTimeRate, decimal fallbackHourlyRate, decimal doubleTimeHours)
            => (configuredDoubleTimeRate > 0 ? configuredDoubleTimeRate : fallbackHourlyRate) * doubleTimeHours;

        public decimal CalculateFGTS(decimal grossSalary) => grossSalary * FGTSRate;
    }

    // --- Classes de Resultado para clareza ---
    
    public class CyclePayResult
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public DateTime ReferenceDate { get; set; }
        public string Cycle { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        
        public decimal BaseAmount { get; set; } // Salário / 2
        public decimal TotalAdditions { get; set; }
        public decimal TotalDeductions { get; set; }
        public decimal GrossPay { get; set; }
        public decimal NetPay { get; set; }
        
        public PaymentBreakdown Breakdown { get; set; }
        public ProvisionDetails Provisions { get; set; }
    }

    public class PaymentBreakdown
    {
        public int AbsenceDays { get; set; }
        public decimal AbsenceDeduction { get; set; }
        public decimal OvertimeHours { get; set; }
        public decimal OvertimeValue { get; set; }
        public decimal DoubleTimeHours { get; set; }
        public decimal DoubleTimeValue { get; set; }
        public decimal INSSDeduction { get; set; }
    }

    public class ProvisionDetails
    {
        public decimal FullMonthlySalary { get; set; }
        public decimal FGTSAmount { get; set; }
    }
}