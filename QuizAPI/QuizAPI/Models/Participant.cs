using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuizAPI.Models
{
    public class Participant
    {
        [Key]
        public int ParticipantId { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string Email { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public string Name { get; set; }

         [Column(TypeName = "nvarchar(500)")]
        public string Password { get; set; }

        [Column(TypeName = "nvarchar(500)")]
        public string? Score { get; set; }

        [Column(TypeName = "nvarchar(500)")]
        public string? TimeTaken { get; set; }
    }

    public class ParticipantResult
    {
        public int ParticipantId { get; set; }

        public string Score { get; set; }

        public string TimeTaken { get; set; }
    }

    public class ParticipantLogin 
    {
        public string Email { get; set; }

        public string Password { get; set; }

    }

}
