using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRManagementAPI.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(14)]
        public string CPF { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        [Range(0.01, 999999.99)]
        public decimal MonthlySalary { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        [Range(0.01, 999999.99)]
        public decimal HourlyRate { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        [Range(0, 999999.99)]
        public decimal OvertimeHourlyRate { get; set; } = 0;

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        [Range(0, 999999.99)]
        public decimal DoubleTimeHourlyRate { get; set; } = 0;

        [Required]
        [Range(1, 220)]
        public int MonthlyWorkHours { get; set; } = 220; // Default work hours

        [Required]
        [MaxLength(100)]
        public string Position { get; set; }

        [Required]
        [MaxLength(100)]
        public string Department { get; set; }
        
        [Required]
        public DateTime HireDate { get; set; }
        
        public DateTime? TerminationDate { get; set; }
        
        public bool IsActive { get; set; } = true;

        [Required]
        public int UserId { get; set; }
        public User User { get; set; }
        
        public ICollection<Attendance> Attendances { get; set; }
        public ICollection<Payroll> Payrolls { get; set; }
    }
}