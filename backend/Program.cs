using HRManagementAPI.Models;
using HRManagementAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<PayrollService>();
builder.Services.AddScoped<INSSService>();
builder.Services.AddScoped<PayrollCalculationService>();
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
    options.AddPolicy("AllowSpecificOrigins", builder => builder
        .WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "https://your-production-domain.com",
            "https://sistemagestaorh-hcvw.vercel.app"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
        .SetIsOriginAllowedToAllowWildcardSubdomains());
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

// Seed database with test users
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    // Apply pending migrations automatically
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
        
        // Create employee profile for RH
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
            HireDate = DateTime.Now.AddYears(-3),
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
        
        // Create employee profile for Gerente
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
            HireDate = DateTime.Now.AddYears(-5),
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
        
        // Create employee profile for Colaborador
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
            HireDate = DateTime.Now.AddYears(-1),
            UserId = colaboradorUser.Id,
            IsActive = true
        });
    }
    
    // Add some additional test employees
    context.SaveChanges();
}

app.Run();