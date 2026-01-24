using System.ComponentModel.DataAnnotations;

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
        public decimal BaseSalary { get; set; }
        public decimal Additions { get; set; }
        public decimal Deductions { get; set; }
        public decimal NetSalary { get; set; }
    }
}