using HRManagementAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(AppDbContext context, ILogger<EmployeesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> GetEmployees([FromQuery] bool includeInactive = false)
    {
        try
        {
            var query = _context.Employees.Include(e => e.User).AsQueryable();
            
            if (!includeInactive)
            {
                query = query.Where(e => e.IsActive);
            }
            
            var employees = await query
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.CPF,
                    e.MonthlySalary,
                    e.Position,
                    e.Department,
                    e.HireDate,
                    e.IsActive,
                    Username = e.User.Username,
                    Role = e.User.Role
                })
                .ToListAsync();
                
            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employees");
            return StatusCode(500, new { error = "An error occurred while fetching employees" });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> GetEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (employee == null)
            {
                return NotFound(new { error = "Employee not found" });
            }

            return Ok(new
            {
                employee.Id,
                employee.Name,
                employee.CPF,
                employee.MonthlySalary,
                employee.MonthlyWorkHours,
                employee.Position,
                employee.Department,
                employee.HireDate,
                employee.TerminationDate,
                employee.IsActive,
                Username = employee.User.Username,
                Role = employee.User.Role
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee {EmployeeId}", id);
            return StatusCode(500, new { error = "An error occurred while fetching the employee" });
        }
    }

    [HttpGet("my-profile")]
    [Authorize(Roles = "Funcionario")]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (username == null) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound(new { error = "User not found" });

            var employee = await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == user.Id);

            if (employee == null)
            {
                return NotFound(new { error = "Employee profile not found" });
            }

            return Ok(new
            {
                employee.Id,
                employee.Name,
                employee.CPF,
                employee.MonthlySalary,
                employee.Position,
                employee.Department,
                employee.HireDate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employee profile");
            return StatusCode(500, new { error = "An error occurred while fetching your profile" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if CPF already exists
            var existingEmployee = await _context.Employees
                .AnyAsync(e => e.CPF == request.CPF);
                
            if (existingEmployee)
            {
                return BadRequest(new { error = "CPF already registered" });
            }

            // Check if username exists
            var existingUser = await _context.Users
                .AnyAsync(u => u.Username == request.Username);
                
            if (existingUser)
            {
                return BadRequest(new { error = "Username already exists" });
            }

            // Create user account
            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create employee
            var employee = new Employee
            {
                Name = request.Name,
                CPF = request.CPF,
                MonthlySalary = request.MonthlySalary,
                MonthlyWorkHours = request.MonthlyWorkHours,
                Position = request.Position,
                Department = request.Department,
                HireDate = request.HireDate,
                UserId = user.Id,
                IsActive = true
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Employee created: {EmployeeId} - {EmployeeName}", employee.Id, employee.Name);

            return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, new
            {
                employee.Id,
                employee.Name,
                employee.CPF,
                employee.Position,
                employee.Department
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating employee");
            return StatusCode(500, new { error = "An error occurred while creating the employee" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeRequest request)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { error = "Employee not found" });
            }

            employee.Name = request.Name;
            employee.MonthlySalary = request.MonthlySalary;
            employee.MonthlyWorkHours = request.MonthlyWorkHours;
            employee.Position = request.Position;
            employee.Department = request.Department;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Employee updated: {EmployeeId}", id);

            return Ok(new { message = "Employee updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee {EmployeeId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the employee" });
        }
    }

    [HttpPost("{id}/deactivate")]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> DeactivateEmployee(int id)
    {
        try
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound(new { error = "Employee not found" });
            }

            employee.IsActive = false;
            employee.TerminationDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Employee deactivated: {EmployeeId}", id);

            return Ok(new { message = "Employee deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating employee {EmployeeId}", id);
            return StatusCode(500, new { error = "An error occurred while deactivating the employee" });
        }
    }
}

public class CreateEmployeeRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; }

    [Required]
    [MaxLength(14)]
    public string CPF { get; set; }

    [Required]
    [Range(0.01, 999999.99)]
    public decimal MonthlySalary { get; set; }

    [Required]
    [Range(1, 220)]
    public int MonthlyWorkHours { get; set; } = 220;

    [Required]
    [MaxLength(100)]
    public string Position { get; set; }

    [Required]
    [MaxLength(100)]
    public string Department { get; set; }

    [Required]
    public DateTime HireDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; }

    [Required]
    [MinLength(6)]
    public string Password { get; set; }

    [Required]
    public string Role { get; set; } = "Funcionario";
}

public class UpdateEmployeeRequest
{
    [Required]
    public string Name { get; set; }

    [Required]
    public decimal MonthlySalary { get; set; }

    [Required]
    public int MonthlyWorkHours { get; set; }

    [Required]
    public string Position { get; set; }

    [Required]
    public string Department { get; set; }
}
