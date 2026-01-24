using System.ComponentModel.DataAnnotations;

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
        public bool IsAbsent { get; set; } = false;
        public decimal OvertimeHours { get; set; } = 0; // Horas extras
        public decimal DoubleTimeHours { get; set; } = 0; // Dobras
    }
}