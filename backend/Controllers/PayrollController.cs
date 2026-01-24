using HRManagementAPI.Models;
using HRManagementAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly PayrollService _payrollService;
    private readonly PayrollCalculationService _payrollCalculationService;
    private readonly AppDbContext _context;

    public PayrollController(
        PayrollService payrollService, 
        AppDbContext context,
        PayrollCalculationService payrollCalculationService)
    {
        _payrollService = payrollService;
        _context = context;
        _payrollCalculationService = payrollCalculationService;
    }

    [HttpPost("calculate-cycle")]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> CalculateCyclePay([FromBody] CycleCalculationRequest request)
    {
        try
        {
            var result = await _payrollCalculationService.CalculateCyclePay(request.EmployeeId, request.CycleType, request.ReferenceDate);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    
    [HttpPost("calculate")]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> CalculatePayroll([FromBody] PayrollRequest request)
    {
        var netSalary = await _payrollService.CalculatePayrollAsync(request.EmployeeId, request.PeriodStart, request.PeriodEnd);
        var payroll = new Payroll
        {
            EmployeeId = request.EmployeeId,
            PeriodStart = request.PeriodStart,
            PeriodEnd = request.PeriodEnd,
            BaseSalary = netSalary, // Simplificado; ajuste conforme necessário
            NetSalary = netSalary
        };
        _context.Payrolls.Add(payroll);
        await _context.SaveChangesAsync();
        return Ok(payroll);
    }

    [HttpGet("my-payrolls")]
    [Authorize(Roles = "Funcionario")]
    public async Task<IActionResult> GetMyPayrolls()
    {
        var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        if (username == null) return Unauthorized();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound();
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
        if (employee == null) return NotFound();
        var payrolls = await _context.Payrolls.Where(p => p.EmployeeId == employee.Id).ToListAsync();
        return Ok(payrolls);
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

public class PayrollRequest
{
    public int EmployeeId { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}