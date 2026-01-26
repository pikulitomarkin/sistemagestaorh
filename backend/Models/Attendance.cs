using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRManagementAPI.Models
{
    public class Attendance
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; }
        
        [Required]
        public DateTime Date { get; set; }
        
        public TimeSpan? EntryTime { get; set; }
        
        public TimeSpan? ExitTime { get; set; }
        
        public bool IsAbsent { get; set; } = false;
        
        [Range(0, 24)]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal OvertimeHours { get; set; } = 0; // Horas extras (50%)
        
        [Range(0, 24)]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal DoubleTimeHours { get; set; } = 0; // Dobras (100%)
        
        [MaxLength(500)]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(100)]
        public string? CreatedBy { get; set; }
    }
}