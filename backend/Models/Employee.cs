using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HRManagementAPI.Models
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal MonthlySalary { get; set; }

        [Required]
        public int MonthlyWorkHours { get; set; } = 220; // Default work hours

        [Required]
        public string Position { get; set; }

        [Required]
        public string Department { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; }
    }
}