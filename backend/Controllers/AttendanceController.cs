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
    [Authorize(Roles = "Gerente")]
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
                    HoursWorked = a.WorkedHours,
                    WorkedHours = a.WorkedHours,
                    AbsenceDays = a.AbsenceDays,
                    OvertimeHours50 = a.OvertimeHours,
                    OvertimeHours100 = a.DoubleTimeHours,
                    OvertimeHours = a.OvertimeHours,
                    DoubleTimeHours = a.DoubleTimeHours,
                    Absences = a.AbsenceDays > 0 ? a.AbsenceDays : (a.IsAbsent ? 1 : 0),
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
    [Authorize(Roles = "Gerente,Colaborador")]
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
                    a.WorkedHours,
                    a.AbsenceDays,
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
    [Authorize(Roles = "Gerente")]
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
                    a.WorkedHours,
                    a.AbsenceDays,
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

    [HttpGet("daily")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> GetDailyLaunch([FromQuery] DateTime date)
    {
        try
        {
            var targetDate = date == default ? DateTime.UtcNow.Date : date.Date;

            var employees = await _context.Employees
                .Where(e => e.IsActive)
                .OrderBy(e => e.Name)
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Department,
                    e.Position
                })
                .ToListAsync();

            var attendances = await _context.Attendances
                .Where(a => a.Date.Date == targetDate)
                .ToDictionaryAsync(a => a.EmployeeId, a => a);

            var result = employees.Select(e =>
            {
                attendances.TryGetValue(e.Id, out var launch);
                return new
                {
                    employeeId = e.Id,
                    employeeName = e.Name,
                    e.Department,
                    e.Position,
                    date = targetDate,
                    attendanceId = launch?.Id,
                    workedHours = launch?.WorkedHours ?? 0,
                    overtimeHours = launch?.OvertimeHours ?? 0,
                    doubleTimeHours = launch?.DoubleTimeHours ?? 0,
                    absenceDays = launch?.AbsenceDays ?? 0,
                    notes = launch?.Notes ?? string.Empty
                };
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching daily launch data");
            return StatusCode(500, new { error = "An error occurred while fetching daily launch data" });
        }
    }

    [HttpPost("daily")]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> UpsertDailyLaunch([FromBody] DailyLaunchRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            var targetDate = request.Date.Date;
            var created = 0;
            var updated = 0;

            foreach (var item in request.Entries)
            {
                var employee = await _context.Employees.FindAsync(item.EmployeeId);
                if (employee == null || !employee.IsActive)
                {
                    continue;
                }

                var existing = await _context.Attendances
                    .FirstOrDefaultAsync(a => a.EmployeeId == item.EmployeeId && a.Date.Date == targetDate);

                var normalizedAbsenceDays = item.AbsenceDays ?? 0;
                var isAbsent = normalizedAbsenceDays > 0;

                if (existing == null)
                {
                    _context.Attendances.Add(new Attendance
                    {
                        EmployeeId = item.EmployeeId,
                        Date = targetDate,
                        WorkedHours = item.WorkedHours,
                        OvertimeHours = item.OvertimeHours,
                        DoubleTimeHours = item.DoubleTimeHours,
                        AbsenceDays = normalizedAbsenceDays,
                        IsAbsent = isAbsent,
                        Notes = item.Notes,
                        CreatedBy = username
                    });
                    created++;
                }
                else
                {
                    existing.WorkedHours = item.WorkedHours;
                    existing.OvertimeHours = item.OvertimeHours;
                    existing.DoubleTimeHours = item.DoubleTimeHours;
                    existing.AbsenceDays = normalizedAbsenceDays;
                    existing.IsAbsent = isAbsent;
                    existing.Notes = item.Notes;
                    updated++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Daily launch saved successfully",
                created,
                updated,
                date = targetDate
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving daily launch data");
            return StatusCode(500, new { error = "An error occurred while saving daily launch data" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Gerente")]
    public async Task<IActionResult> CreateAttendance([FromBody] CreateAttendanceRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var username = User.FindFirst(ClaimTypes.Name)?.Value;

            // Security check: Colaboradores can only create their own records
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (userRole == "Colaborador")
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null) return Unauthorized();
                
                var employee = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == user.Id);
                if (employee == null || employee.Id != request.EmployeeId)
                {
                    return Forbid();
                }
            }

            // Check if employee exists and is active
            var employeeRecord = await _context.Employees.FindAsync(request.EmployeeId);
            if (employeeRecord == null || !employeeRecord.IsActive)
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

            var attendance = new Attendance
            {
                EmployeeId = request.EmployeeId,
                Date = request.Date.Date,
                EntryTime = request.EntryTime,
                ExitTime = request.ExitTime,
                WorkedHours = request.WorkedHours ?? request.HoursWorked ?? 0,
                AbsenceDays = request.AbsenceDays ?? request.Absences ?? (request.IsAbsent ? 1 : 0),
                IsAbsent = (request.AbsenceDays ?? request.Absences ?? (request.IsAbsent ? 1 : 0)) > 0,
                OvertimeHours = request.OvertimeHours ?? request.OvertimeHours50 ?? 0,
                DoubleTimeHours = request.DoubleTimeHours ?? request.OvertimeHours100 ?? 0,
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
                    attendance.WorkedHours,
                    attendance.IsAbsent,
                    attendance.AbsenceDays,
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
    [Authorize(Roles = "Gerente")]
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
                    WorkedHours = request.WorkedHours ?? request.HoursWorked ?? 0,
                    AbsenceDays = request.AbsenceDays ?? request.Absences ?? (request.IsAbsent ? 1 : 0),
                    IsAbsent = (request.AbsenceDays ?? request.Absences ?? (request.IsAbsent ? 1 : 0)) > 0,
                    OvertimeHours = request.OvertimeHours ?? request.OvertimeHours50 ?? 0,
                    DoubleTimeHours = request.DoubleTimeHours ?? request.OvertimeHours100 ?? 0,
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
    [Authorize(Roles = "Gerente")]
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
            attendance.WorkedHours = request.WorkedHours ?? request.HoursWorked ?? attendance.WorkedHours;
            attendance.AbsenceDays = request.AbsenceDays ?? request.Absences ?? attendance.AbsenceDays;
            attendance.IsAbsent = attendance.AbsenceDays > 0 || request.IsAbsent;
            attendance.OvertimeHours = request.OvertimeHours ?? request.OvertimeHours50 ?? attendance.OvertimeHours;
            attendance.DoubleTimeHours = request.DoubleTimeHours ?? request.OvertimeHours100 ?? attendance.DoubleTimeHours;
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
    [Authorize(Roles = "Gerente")]
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
    public decimal? WorkedHours { get; set; }

    [Range(0, 24)]
    public decimal? HoursWorked { get; set; }

    [Range(0, 31)]
    public decimal? AbsenceDays { get; set; }

    [Range(0, 31)]
    public decimal? Absences { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours50 { get; set; }

    [Range(0, 24)]
    public decimal? DoubleTimeHours { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours100 { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateAttendanceRequest
{
    public TimeSpan? EntryTime { get; set; }

    public TimeSpan? ExitTime { get; set; }

    public bool IsAbsent { get; set; }

    [Range(0, 24)]
    public decimal? WorkedHours { get; set; }

    [Range(0, 24)]
    public decimal? HoursWorked { get; set; }

    [Range(0, 31)]
    public decimal? AbsenceDays { get; set; }

    [Range(0, 31)]
    public decimal? Absences { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours50 { get; set; }

    [Range(0, 24)]
    public decimal? DoubleTimeHours { get; set; }

    [Range(0, 24)]
    public decimal? OvertimeHours100 { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class DailyLaunchRequest
{
    [Required]
    public DateTime Date { get; set; }

    [Required]
    [MinLength(1)]
    public List<DailyLaunchEntryRequest> Entries { get; set; } = new();
}

public class DailyLaunchEntryRequest
{
    [Required]
    public int EmployeeId { get; set; }

    [Range(0, 24)]
    public decimal WorkedHours { get; set; }

    [Range(0, 24)]
    public decimal OvertimeHours { get; set; }

    [Range(0, 24)]
    public decimal DoubleTimeHours { get; set; }

    [Range(0, 31)]
    public decimal? AbsenceDays { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
