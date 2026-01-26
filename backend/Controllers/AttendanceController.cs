using HRManagementAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<AttendanceController> _logger;

    public AttendanceController(AppDbContext context, ILogger<AttendanceController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> GetAllAttendances(
        [FromQuery] int? month,
        [FromQuery] int? year)
    {
        try
        {
            var query = _context.Attendances
                .Include(a => a.Employee)
                .AsQueryable();

            if (month.HasValue && year.HasValue)
            {
                var startDate = new DateTime(year.Value, month.Value, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);
                query = query.Where(a => a.Date.Date >= startDate.Date && a.Date.Date <= endDate.Date);
            }

            var attendances = await query
                .OrderByDescending(a => a.Date)
                .Select(a => new
                {
                    a.Id,
                    a.EmployeeId,
                    EmployeeName = a.Employee.Name,
                    a.Date,
                    a.EntryTime,
                    a.ExitTime,
                    a.IsAbsent,
                    HoursWorked = 8,
                    OvertimeHours50 = a.OvertimeHours,
                    OvertimeHours100 = a.DoubleTimeHours,
                    Absences = a.IsAbsent ? 1 : 0,
                    a.Notes,
                    Cycle = 1
                })
                .ToListAsync();

            return Ok(attendances);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all attendances");
            return StatusCode(500, new { error = "An error occurred while fetching attendance records" });
        }
    }

    [HttpGet("employee/{employeeId}")]
    [Authorize(Roles = "RH,Gerente,Colaborador")]
    public async Task<IActionResult> GetAttendanceByEmployee(
        int employeeId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        try
        {
            // Security check: Colaboradores can only see their own records
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Colaborador")
            {
                var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null) return Unauthorized();
                
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
                if (employee == null || employee.Id != employeeId)
                {
                    return Forbid();
                }
            }

            var query = _context.Attendances
                .Where(a => a.EmployeeId == employeeId);

            if (startDate.HasValue)
            {
                query = query.Where(a => a.Date.Date >= startDate.Value.Date);
            }

            if (endDate.HasValue)
            {
                query = query.Where(a => a.Date.Date <= endDate.Value.Date);
            }

            var attendances = await query
                .OrderByDescending(a => a.Date)
                .Select(a => new
                {
                    a.Id,
                    a.Date,
                    a.EntryTime,
                    a.ExitTime,
                    a.IsAbsent,
                    a.OvertimeHours,
                    a.DoubleTimeHours,
                    a.Notes,
                    a.CreatedAt,
                    a.CreatedBy
                })
                .ToListAsync();

            return Ok(attendances);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance for employee {EmployeeId}", employeeId);
            return StatusCode(500, new { error = "An error occurred while fetching attendance records" });
        }
    }

    [HttpGet("cycle")]
    [Authorize(Roles = "RH,Gerente")]
    public async Task<IActionResult> GetAttendanceByCycle(
        [FromQuery] DateTime referenceDate,
        [FromQuery] string cycleType)
    {
        try
        {
            DateTime startDate, endDate;

            if (cycleType == "FirstCycle")
            {
                startDate = new DateTime(referenceDate.Year, referenceDate.Month, 5);
                endDate = new DateTime(referenceDate.Year, referenceDate.Month, 19);
            }
            else if (cycleType == "SecondCycle")
            {
                endDate = new DateTime(referenceDate.Year, referenceDate.Month, 4);
                startDate = new DateTime(referenceDate.Year, referenceDate.Month, 20).AddMonths(-1);
            }
            else
            {
                return BadRequest(new { error = "Invalid cycle type. Use 'FirstCycle' or 'SecondCycle'" });
            }

            var attendances = await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.Date.Date >= startDate.Date && a.Date.Date <= endDate.Date)
                .OrderBy(a => a.Employee.Name)
                .ThenBy(a => a.Date)
                .Select(a => new
                {
                    a.Id,
                    a.EmployeeId,
                    EmployeeName = a.Employee.Name,
                    a.Date,
                    a.EntryTime,
                    a.ExitTime,
                    a.IsAbsent,
                    a.OvertimeHours,
                    a.DoubleTimeHours,
                    a.Notes
                })
                .ToListAsync();

            return Ok(new
            {
                cycleType,
                startDate,
                endDate,
                attendances
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cycle attendance");
            return StatusCode(500, new { error = "An error occurred while fetching cycle attendance" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> CreateAttendance([FromBody] CreateAttendanceRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if employee exists and is active
            var employee = await _context.Employees.FindAsync(request.EmployeeId);
            if (employee == null || !employee.IsActive)
            {
                return BadRequest(new { error = "Employee not found or inactive" });
            }

            // Check if attendance already exists for this date
            var existingAttendance = await _context.Attendances
                .AnyAsync(a => a.EmployeeId == request.EmployeeId && a.Date.Date == request.Date.Date);

            if (existingAttendance)
            {
                return BadRequest(new { error = "Attendance record already exists for this date" });
            }

            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            var attendance = new Attendance
            {
                EmployeeId = request.EmployeeId,
                Date = request.Date.Date,
                EntryTime = request.EntryTime,
                ExitTime = request.ExitTime,
                IsAbsent = request.IsAbsent,
                OvertimeHours = request.OvertimeHours,
                DoubleTimeHours = request.DoubleTimeHours,
                Notes = request.Notes,
                CreatedBy = username
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Attendance created: {AttendanceId} for Employee {EmployeeId}", 
                attendance.Id, attendance.EmployeeId);

            return CreatedAtAction(nameof(GetAttendanceByEmployee), 
                new { employeeId = attendance.EmployeeId }, 
                new
                {
                    attendance.Id,
                    attendance.EmployeeId,
                    attendance.Date,
                    attendance.EntryTime,
                    attendance.ExitTime,
                    attendance.IsAbsent,
                    attendance.OvertimeHours,
                    attendance.DoubleTimeHours
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating attendance");
            return StatusCode(500, new { error = "An error occurred while creating the attendance record" });
        }
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> CreateBulkAttendance([FromBody] List<CreateAttendanceRequest> requests)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var attendances = new List<Attendance>();
            var errors = new List<string>();

            foreach (var request in requests)
            {
                // Check if employee exists
                var employee = await _context.Employees.FindAsync(request.EmployeeId);
                if (employee == null || !employee.IsActive)
                {
                    errors.Add($"Employee {request.EmployeeId} not found or inactive");
                    continue;
                }

                // Check if attendance already exists
                var existingAttendance = await _context.Attendances
                    .AnyAsync(a => a.EmployeeId == request.EmployeeId && a.Date.Date == request.Date.Date);

                if (existingAttendance)
                {
                    errors.Add($"Attendance for Employee {request.EmployeeId} on {request.Date:yyyy-MM-dd} already exists");
                    continue;
                }

                attendances.Add(new Attendance
                {
                    EmployeeId = request.EmployeeId,
                    Date = request.Date.Date,
                    EntryTime = request.EntryTime,
                    ExitTime = request.ExitTime,
                    IsAbsent = request.IsAbsent,
                    OvertimeHours = request.OvertimeHours,
                    DoubleTimeHours = request.DoubleTimeHours,
                    Notes = request.Notes,
                    CreatedBy = username
                });
            }

            if (attendances.Any())
            {
                _context.Attendances.AddRange(attendances);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("Bulk attendance created: {Count} records", attendances.Count);

            return Ok(new
            {
                created = attendances.Count,
                errors = errors.Any() ? errors : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bulk attendance");
            return StatusCode(500, new { error = "An error occurred while creating attendance records" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> UpdateAttendance(int id, [FromBody] UpdateAttendanceRequest request)
    {
        try
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return NotFound(new { error = "Attendance record not found" });
            }

            attendance.EntryTime = request.EntryTime;
            attendance.ExitTime = request.ExitTime;
            attendance.IsAbsent = request.IsAbsent;
            attendance.OvertimeHours = request.OvertimeHours;
            attendance.DoubleTimeHours = request.DoubleTimeHours;
            attendance.Notes = request.Notes;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Attendance updated: {AttendanceId}", id);

            return Ok(new { message = "Attendance updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating attendance {AttendanceId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the attendance record" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "RH")]
    public async Task<IActionResult> DeleteAttendance(int id)
    {
        try
        {
            var attendance = await _context.Attendances.FindAsync(id);
            if (attendance == null)
            {
                return NotFound(new { error = "Attendance record not found" });
            }

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Attendance deleted: {AttendanceId}", id);

            return Ok(new { message = "Attendance deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting attendance {AttendanceId}", id);
            return StatusCode(500, new { error = "An error occurred while deleting the attendance record" });
        }
    }
}

public class CreateAttendanceRequest
{
    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public TimeSpan? EntryTime { get; set; }

    public TimeSpan? ExitTime { get; set; }

    public bool IsAbsent { get; set; } = false;

    [Range(0, 24)]
    public decimal OvertimeHours { get; set; } = 0;

    [Range(0, 24)]
    public decimal DoubleTimeHours { get; set; } = 0;

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateAttendanceRequest
{
    public TimeSpan? EntryTime { get; set; }

    public TimeSpan? ExitTime { get; set; }

    public bool IsAbsent { get; set; }

    [Range(0, 24)]
    public decimal OvertimeHours { get; set; }

    [Range(0, 24)]
    public decimal DoubleTimeHours { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
