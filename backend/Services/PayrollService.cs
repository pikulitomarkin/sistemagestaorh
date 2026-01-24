using HRManagementAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace HRManagementAPI.Services
{
    public class PayrollService
    {
        private readonly AppDbContext _context;

        public PayrollService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculatePayrollAsync(int employeeId, DateTime periodStart, DateTime periodEnd)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee == null) throw new Exception("Employee not found");

            var attendances = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date >= periodStart && a.Date <= periodEnd)
                .ToListAsync();

            decimal baseSalary = employee.MonthlySalary / 2; // 50% do salário para cada ciclo
            decimal additions = 0;
            decimal deductions = 0;

            foreach (var attendance in attendances)
            {
                if (attendance.IsAbsent)
                {
                    deductions += employee.MonthlySalary / 20; // Falta = Salário / 20
                }
                additions += attendance.OvertimeHours * (employee.MonthlySalary / 160); // Assumindo 160 horas/mês
                additions += attendance.DoubleTimeHours * 2 * (employee.MonthlySalary / 160); // Dobras = 2x
            }

            return baseSalary + additions - deductions;
        }
    }
}