using HRManagementAPI.Models;
using HRManagementAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

string ResolveConnectionString(IConfiguration configuration)
{
    var explicitConnectionString = configuration.GetConnectionString("DefaultConnection");
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

    if (!string.IsNullOrWhiteSpace(databaseUrl) &&
        (databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
         databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)))
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.Trim('/');

        var sslMode = "Require";
        if (!string.IsNullOrWhiteSpace(uri.Query))
        {
            var queryParts = uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in queryParts)
            {
                var kv = part.Split('=', 2);
                if (kv.Length == 2 && kv[0].Equals("sslmode", StringComparison.OrdinalIgnoreCase))
                {
                    sslMode = Uri.UnescapeDataString(kv[1]);
                    break;
                }
            }
        }

        var port = uri.IsDefaultPort || uri.Port <= 0 ? 5432 : uri.Port;
        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode={sslMode};Trust Server Certificate=true";
    }

    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        return databaseUrl;
    }

    return explicitConnectionString ?? string.Empty;
}

var resolvedConnectionString = ResolveConnectionString(builder.Configuration);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(resolvedConnectionString));
builder.Services.AddScoped<PayrollService>();
builder.Services.AddScoped<INSSService>();
builder.Services.AddScoped<PayrollCalculationService>();

var configuredCorsOrigins = builder.Configuration
    .GetSection("Cors:Origins")
    .Get<string[]>() ?? Array.Empty<string>();

var staticCorsOrigins = new[]
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "https://sistemagestaorh-hcvw.vercel.app"
};

var allowedCorsOrigins = staticCorsOrigins
    .Concat(configuredCorsOrigins)
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy => policy
        .SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin))
            {
                return false;
            }

            if (allowedCorsOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
            {
                return true;
            }

            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            {
                return false;
            }

            var isLocalhost = uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) ||
                              uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);

            var isVercelPreview = uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);

            return isLocalhost || isVercelPreview;
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var pointsToLocalDb = resolvedConnectionString.Contains("localhost", StringComparison.OrdinalIgnoreCase) ||
                      resolvedConnectionString.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase);
var hasConnectionString = !string.IsNullOrWhiteSpace(resolvedConnectionString);

var runDbBootstrap = builder.Configuration.GetValue<bool?>("Database:RunMigrationsOnStartup")
    ?? (app.Environment.IsProduction() ? (hasConnectionString && !pointsToLocalDb) : true);
if (runDbBootstrap)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        context.Database.Migrate();

        // RH User - rh_test / 123
        if (!context.Users.Any(u => u.Username == "rh_test"))
        {
            var rhUser = new User
            {
                Username = "rh_test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = "RH"
            };
            context.Users.Add(rhUser);
            context.SaveChanges();

            context.Employees.Add(new Employee
            {
                Name = "Maria Silva",
                CPF = "111.222.333-44",
                MonthlySalary = 8000.00m,
                MonthlyWorkHours = 220,
                HourlyRate = 36.36m,
                OvertimeHourlyRate = 54.54m,
                DoubleTimeHourlyRate = 72.72m,
                Position = "Gerente de RH",
                Department = "Recursos Humanos",
                HireDate = DateTime.UtcNow.AddYears(-3),
                UserId = rhUser.Id,
                IsActive = true
            });
        }

        // Gerente User - gerente_test / 123
        if (!context.Users.Any(u => u.Username == "gerente_test"))
        {
            var gerenteUser = new User
            {
                Username = "gerente_test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = "Gerente"
            };
            context.Users.Add(gerenteUser);
            context.SaveChanges();

            context.Employees.Add(new Employee
            {
                Name = "João Santos",
                CPF = "222.333.444-55",
                MonthlySalary = 12000.00m,
                MonthlyWorkHours = 220,
                HourlyRate = 54.55m,
                OvertimeHourlyRate = 81.82m,
                DoubleTimeHourlyRate = 109.09m,
                Position = "Gerente Geral",
                Department = "Administração",
                HireDate = DateTime.UtcNow.AddYears(-5),
                UserId = gerenteUser.Id,
                IsActive = true
            });
        }

        // Colaborador User - colaborador_test / 123
        if (!context.Users.Any(u => u.Username == "colaborador_test"))
        {
            var colaboradorUser = new User
            {
                Username = "colaborador_test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = "Colaborador"
            };
            context.Users.Add(colaboradorUser);
            context.SaveChanges();

            context.Employees.Add(new Employee
            {
                Name = "Ana Costa",
                CPF = "333.444.555-66",
                MonthlySalary = 3500.00m,
                MonthlyWorkHours = 220,
                HourlyRate = 15.91m,
                OvertimeHourlyRate = 23.86m,
                DoubleTimeHourlyRate = 31.82m,
                Position = "Analista",
                Department = "Operações",
                HireDate = DateTime.UtcNow.AddYears(-1),
                UserId = colaboradorUser.Id,
                IsActive = true
            });
        }

        context.SaveChanges();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database bootstrap failed during startup.");
        if (!app.Environment.IsProduction())
        {
            throw;
        }
    }
}

app.Run();