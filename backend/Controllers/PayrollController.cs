using HRManagementAPI.Models;
using HRManagementAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly PayrollService _payrollService;
    private readonly PayrollCalculationService _payrollCalculationService;
    private readonly AppDbContext _context;
    private readonly ILogger<PayrollController> _logger;

    public PayrollController(
        PayrollService payrollService, 
        AppDbContext context,
        PayrollCalculationService payrollCalculationService,
        ILogger<PayrollController> logger)
    {
        _payrollService = payrollService;
        _context = context;
        _payrollCalculationService = payrollCalculationService;
        _logger = logger;
    }

    [HttpPost("calculate-cycle")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> CalculateCyclePay([FromBody] CycleCalculationRequest request)
    {
        try
        {
            var result = await _payrollCalculationService.CalculateCyclePay(
                request.EmployeeId, 
                request.CycleType, 
                request.ReferenceDate);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating cycle pay");
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    [HttpPost("process-cycle")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> ProcessCyclePayroll([FromBody] ProcessCycleRequest request)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var results = new List<object>();
            var errors = new List<string>();

            foreach (var employeeId in request.EmployeeIds)
            {
                try
                {
                    var calculation = await _payrollCalculationService.CalculateCyclePay(
                        employeeId,
                        request.CycleType,
                        request.ReferenceDate,
                        request.IncludeOvertime,
                        request.IncludeDoubleTime);

                    // Save payroll record
                    var payroll = new Payroll
                    {
                        EmployeeId = employeeId,
                        PeriodStart = calculation.PeriodStartDate,
                        PeriodEnd = calculation.PeriodEndDate,
                        BaseSalary = calculation.BaseAmount,
                        Additions = calculation.TotalAdditions,
                        Deductions = calculation.TotalDeductions,
                        NetSalary = calculation.NetPay,
                        CycleType = request.CycleType.ToString(),
                        CreatedBy = username,
                        IsProcessed = true,
                        PayrollDetails = JsonSerializer.Serialize(calculation)
                    };

                    _context.Payrolls.Add(payroll);
                    await _context.SaveChangesAsync();

                    results.Add(new
                    {
                        employeeId,
                        employeeName = calculation.EmployeeName,
                        netPay = calculation.NetPay,
                        payrollId = payroll.Id
                    });

                    _logger.LogInformation("Payroll processed for Employee {EmployeeId}, Payroll {PayrollId}", 
                        employeeId, payroll.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing payroll for Employee {EmployeeId}", employeeId);
                    errors.Add($"Employee {employeeId}: {ex.Message}");
                }
            }

            return Ok(new
            {
                processed = results,
                errors = errors.Any() ? errors : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing cycle payroll");
            return StatusCode(500, new { error = "An error occurred while processing payroll" });
        }
    }
    
    [HttpPost("calculate")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> CalculatePayroll([FromBody] PayrollRequest request)
    {
        try
        {
            var netSalary = await _payrollService.CalculatePayrollAsync(
                request.EmployeeId, 
                request.PeriodStart, 
                request.PeriodEnd);
                
            return Ok(new { netSalary });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating payroll");
            return StatusCode(500, new { error = $"Error calculating payroll: {ex.Message}" });
        }
    }

    [HttpGet("my-payrolls")]
    [Authorize(Roles = "Colaborador")]
    public async Task<IActionResult> GetMyPayrolls([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (username == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound(new { error = "User not found" });

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (employee == null) return NotFound(new { error = "Employee profile not found" });

            var query = _context.Payrolls
                .Where(p => p.EmployeeId == employee.Id);

            if (startDate.HasValue)
            {
                query = query.Where(p => p.PeriodStart >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.PeriodEnd <= endDate.Value);
            }

            var payrolls = await query
                .OrderByDescending(p => p.PeriodEnd)
                .Select(p => new
                {
                    p.Id,
                    p.PeriodStart,
                    p.PeriodEnd,
                    p.CycleType,
                    p.BaseSalary,
                    p.Additions,
                    p.Deductions,
                    p.NetSalary,
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(payrolls);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee payrolls");
            return StatusCode(500, new { error = "An error occurred while fetching payrolls" });
        }
    }

    [HttpGet("my-payroll/{id}")]
    [Authorize(Roles = "Colaborador")]
    public async Task<IActionResult> GetMyPayrollDetails(int id)
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (username == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound(new { error = "User not found" });

            var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
            if (employee == null) return NotFound(new { error = "Employee profile not found" });

            var payroll = await _context.Payrolls
                .Include(p => p.Employee)
                .FirstOrDefaultAsync(p => p.Id == id && p.EmployeeId == employee.Id);

            if (payroll == null)
            {
                return NotFound(new { error = "Payroll not found" });
            }

            object? details = null;
            if (!string.IsNullOrEmpty(payroll.PayrollDetails))
            {
                details = JsonSerializer.Deserialize<object>(payroll.PayrollDetails);
            }

            return Ok(new
            {
                payroll.Id,
                payroll.PeriodStart,
                payroll.PeriodEnd,
                payroll.CycleType,
                payroll.BaseSalary,
                payroll.Additions,
                payroll.Deductions,
                payroll.NetSalary,
                payroll.CreatedAt,
                employeeName = payroll.Employee.Name,
                employeeCPF = payroll.Employee.CPF,
                employeePosition = payroll.Employee.Position,
                details
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll details");
            return StatusCode(500, new { error = "An error occurred while fetching payroll details" });
        }
    }

    [HttpGet("all")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> GetAllPayrolls(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate,
        [FromQuery] string? cycleType)
    {
        try
        {
            var query = _context.Payrolls
                .Include(p => p.Employee)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(p => p.PeriodStart >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.PeriodEnd <= endDate.Value);
            }

            if (!string.IsNullOrEmpty(cycleType))
            {
                query = query.Where(p => p.CycleType == cycleType);
            }

            var payrolls = await query
                .OrderByDescending(p => p.PeriodEnd)
                .Select(p => new
                {
                    p.Id,
                    p.EmployeeId,
                    employeeName = p.Employee.Name,
                    employeeCPF = p.Employee.CPF,
                    employeePosition = p.Employee.Position,
                    p.PeriodStart,
                    p.PeriodEnd,
                    p.CycleType,
                    p.BaseSalary,
                    p.Additions,
                    p.Deductions,
                    p.NetSalary,
                    p.CreatedAt,
                    p.CreatedBy
                })
                .ToListAsync();

            return Ok(payrolls);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all payrolls");
            return StatusCode(500, new { error = "An error occurred while fetching payrolls" });
        }
    }

    [HttpGet("statistics")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> GetPayrollStatistics(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        try
        {
            var query = _context.Payrolls.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(p => p.PeriodStart >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(p => p.PeriodEnd <= endDate.Value);
            }

            var statistics = await query
                .GroupBy(p => 1)
                .Select(g => new
                {
                    totalPayrolls = g.Count(),
                    totalGrossPay = g.Sum(p => p.BaseSalary + p.Additions),
                    totalDeductions = g.Sum(p => p.Deductions),
                    totalNetPay = g.Sum(p => p.NetSalary),
                    averageNetPay = g.Average(p => p.NetSalary)
                })
                .FirstOrDefaultAsync();

            return Ok(statistics ?? new
            {
                totalPayrolls = 0,
                totalGrossPay = 0m,
                totalDeductions = 0m,
                totalNetPay = 0m,
                averageNetPay = 0m
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching payroll statistics");
            return StatusCode(500, new { error = "An error occurred while fetching statistics" });
        }
    }
}

public class CycleCalculationRequest
{
    [Required]
    public int EmployeeId { get; set; }
    
    [Required]
    public CycleType CycleType { get; set; }

    [Required]
    public DateTime ReferenceDate { get; set; }
}

public class ProcessCycleRequest
{
    [Required]
    public List<int> EmployeeIds { get; set; }

    [Required]
    public CycleType CycleType { get; set; }

    [Required]
    public DateTime ReferenceDate { get; set; }

    // Flags to include or exclude overtime/double-time during batch processing
    public bool IncludeOvertime { get; set; } = true;
    public bool IncludeDoubleTime { get; set; } = true;
}

public class PayrollRequest
{
    [Required]
    public int EmployeeId { get; set; }
    
    [Required]
    public DateTime PeriodStart { get; set; }
    
    [Required]
    public DateTime PeriodEnd { get; set; }
}