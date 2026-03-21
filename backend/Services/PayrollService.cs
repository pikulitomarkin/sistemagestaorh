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
                var absenceDays = attendance.AbsenceDays > 0 ? attendance.AbsenceDays : (attendance.IsAbsent ? 1 : 0);
                deductions += (employee.MonthlySalary / 20) * absenceDays;

                var overtimeRate = employee.OvertimeHourlyRate > 0 ? employee.OvertimeHourlyRate : employee.HourlyRate;
                var doubleTimeRate = employee.DoubleTimeHourlyRate > 0 ? employee.DoubleTimeHourlyRate : employee.HourlyRate;

                additions += attendance.OvertimeHours * overtimeRate;
                additions += attendance.DoubleTimeHours * doubleTimeRate;
            }

            return baseSalary + additions - deductions;
        }
    }
}