using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRManagementAPI.Models
{
    public class Payroll
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; }
        
        [Required]
        public DateTime PeriodStart { get; set; }
        
        [Required]
        public DateTime PeriodEnd { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal BaseSalary { get; set; }
        
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Additions { get; set; }
        
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Deductions { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal NetSalary { get; set; }
        
        [Required]
        [MaxLength(20)]
        public string CycleType { get; set; } // "FirstCycle" or "SecondCycle"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(100)]
        public string? CreatedBy { get; set; }
        
        public bool IsProcessed { get; set; } = false;
        
        public string? PayrollDetails { get; set; } // JSON with full breakdown
    }
}