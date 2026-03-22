using HRManagementAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { error = "Username and password are required" });
            }

            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

            if (user == null || !ValidatePassword(user, request.Password))
                return Unauthorized();

            var employee = _context.Employees.FirstOrDefault(e => e.UserId == user.Id);

            var token = GenerateJwtToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    id = user.Id,
                    username = user.Username,
                    role = user.Role,
                    name = employee?.Name ?? user.Username,
                    employeeId = employee?.Id
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Login processing failed", detail = ex.Message });
        }
    }

    private bool ValidatePassword(User user, string rawPassword)
    {
        try
        {
            if (!string.IsNullOrWhiteSpace(user.PasswordHash) && BCrypt.Net.BCrypt.Verify(rawPassword, user.PasswordHash))
            {
                return true;
            }
        }
        catch
        {
            // Legacy rows may store plain text or invalid hash format.
        }

        if (!string.IsNullOrWhiteSpace(user.PasswordHash) && user.PasswordHash == rawPassword)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(rawPassword);
            _context.SaveChanges();
            return true;
        }

        return false;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _config["Jwt:Key"];
        var jwtIssuer = _config["Jwt:Issuer"];
        var jwtAudience = _config["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey) || string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience))
        {
            throw new InvalidOperationException("JWT configuration is missing. Ensure Jwt:Key, Jwt:Issuer and Jwt:Audience are set.");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, string.IsNullOrWhiteSpace(user.Username) ? "unknown" : user.Username),
            new Claim(ClaimTypes.Role, string.IsNullOrWhiteSpace(user.Role) ? "Colaborador" : user.Role)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(jwtIssuer, jwtAudience, claims, expires: DateTime.Now.AddHours(1), signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
}