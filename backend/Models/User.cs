using System.ComponentModel.DataAnnotations;

namespace HRManagementAPI.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        [Required]
        public string Role { get; set; } // "Gerente", "RH", "Funcionario"
    }
}