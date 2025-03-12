using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuizAPI.Models;
using QuizAPI.Exceptions;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace QuizAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipantsController : ControllerBase
    {
        private readonly QuizDbContext _context;
        private readonly IConfiguration _configuration;

        public ParticipantsController(QuizDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // GET: api/Participants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Participant>>> GetParticipants()
        {
            var participants = await _context.Participants.ToListAsync();

            foreach (var participant in participants)
            {
                participant.Score = EncryptionHelper.DecryptData(participant.Score.ToString());
                participant.TimeTaken = EncryptionHelper.DecryptData(participant.TimeTaken.ToString());
            }

            return participants;
        }

        // GET: api/Participants/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Participant>> GetParticipant(int id)
        {
            var participant = await _context.Participants.FindAsync(id);

            if (participant == null)
            {
                throw new NotFoundException($"Participant with ID {id} not found");
            }

            participant.Score = EncryptionHelper.DecryptData(participant.Score.ToString());
            participant.TimeTaken = EncryptionHelper.DecryptData(participant.TimeTaken.ToString());

            return participant;
        }

        // PUT: api/Participants/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutParticipant(int id, ParticipantResult _participantResult)
        {
            if (id != _participantResult.ParticipantId)
            {
                throw new BadRequestException("ID mismatch");
            }

            Participant participant = await _context.Participants.FindAsync(id);
            if (participant == null)
            {
                throw new NotFoundException($"Participant with ID {id} not found");
            }

            participant.Score = EncryptionHelper.EncryptData(_participantResult.Score.ToString());
            participant.TimeTaken = EncryptionHelper.EncryptData(_participantResult.TimeTaken.ToString());

            _context.Entry(participant).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ParticipantExists(id))
                {
                    throw new NotFoundException($"Participant with ID {id} not found");
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/Participants/login
        [HttpPost("login")]
        public async Task<ActionResult> LoginParticipant(ParticipantLogin _participantLogin)
        {
            var participant = await _context.Participants
                .Where(x => x.Email == _participantLogin.Email)
                .FirstOrDefaultAsync();

            if (participant == null)
            {
                throw new UnauthorizedException("Invalid email or password");
            }

            // Verify the password
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(_participantLogin.Password));
                var hashedPassword = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();

                if (participant.Password != hashedPassword)
                {
                    throw new UnauthorizedException("Invalid email or password");
                }
            }

            var tokenString = GenerateJwtToken(participant);
            HttpContext.Session.SetString("authToken", tokenString);

            return Ok(new { participantId = participant.ParticipantId, token = tokenString });
        }

        // POST: api/Participants/signup
        [HttpPost("signup")]
        public async Task<ActionResult> PostParticipant(Participant participant)
        {
            var existingParticipant = await _context.Participants
                .Where(x => x.Email == participant.Email)
                .FirstOrDefaultAsync();

            if (existingParticipant != null)
            {
                throw new ConflictException("Email is already registered");
            }

            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(participant.Password));
                participant.Password = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            }

            _context.Participants.Add(participant);
            await _context.SaveChangesAsync();

            var tokenString = GenerateJwtToken(participant);
            HttpContext.Session.SetString("authToken", tokenString);

            return Ok(new { participantId = participant.ParticipantId, token = tokenString });
        }

        // POST: api/Participants/logout
        [HttpPost("logout")]
        public IActionResult LogoutParticipant()
        {
            // Clear the session
            HttpContext.Session.Clear();
            return Ok(new { message = "Logged out successfully." });
        }

        // DELETE: api/Participants/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParticipant(int id)
        {
            var participant = await _context.Participants.FindAsync(id);
            if (participant == null)
            {
                throw new NotFoundException($"Participant with ID {id} not found");
            }

            _context.Participants.Remove(participant);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ParticipantExists(int id)
        {
            return _context.Participants.Any(e => e.ParticipantId == id);
        }

        private string GenerateJwtToken(Participant participant)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, participant.ParticipantId.ToString()),
                    new Claim(ClaimTypes.Email, participant.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}