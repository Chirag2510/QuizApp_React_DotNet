using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using QuizAPI.Controllers;
using QuizAPI.Models;
using QuizAPI.Exceptions;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace QuizAPI.Tests
{
    [TestFixture]
    public class ParticipantsControllerTests
    {
        private ParticipantsController _controller;
        private QuizDbContext _context;
        private Mock<IConfiguration> _configurationMock;
        private Mock<ISession> _sessionMock;
        private DefaultHttpContext _httpContext;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "QuizDb")
                .Options;

            _context = new QuizDbContext(options);
            _configurationMock = new Mock<IConfiguration>();
            _configurationMock.SetupGet(x => x["Jwt:Key"]).Returns("c7667110d4211b68aefef20d19f62f88f40e15e207e94af23d23698642813494743faed367da60f85ee61ce77c002e3b5279ef0a722acca537c3f05dabd3c9a3e7ac1cd076205749d78238c535c7eedc3f96526d8f3c600f19ce274196e285a1a772b3d64a7b5f9cd6db7c29eda6ad433faffe474096f7f504ece944c18eb6c4599ac1b2a6005fdd30ded3365062d47caad8647599f77b2bff960d0b654ffe1060be204541ddcb7dfdc2a3f7f1b10643aba8b06e7977e9e1e36fe5905fbed5948e7367923b374352ac4c10284bbbd5df3c4bd88b29ac3ef102dea7bae0f622a7b3d6fe1b1e66af4e35692446185c2a82737478763f19a84eb30014493507f5ce");
            
            _sessionMock = new Mock<ISession>();
            _httpContext = new DefaultHttpContext
            {
                Session = _sessionMock.Object
            };

            _controller = new ParticipantsController(_context, _configurationMock.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = _httpContext
                }
            };

            _context.Participants.AddRange(new List<Participant>
            {
                new Participant { ParticipantId = 1, Name = "John Doe", Email = "john@example.com", Score = EncryptionHelper.EncryptData("10"), TimeTaken = EncryptionHelper.EncryptData("30"), Password = "Test@123" },
                new Participant { ParticipantId = 2, Name = "Jane Doe", Email = "jane@example.com", Score = EncryptionHelper.EncryptData("15"), TimeTaken = EncryptionHelper.EncryptData("25"), Password = "Test@123" }
            });
            _context.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test, Order(1)]
        public async Task GetParticipants_ReturnsAllParticipants()
        {
            var result = await _controller.GetParticipants();
            Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<Participant>>>());
            Assert.That(result.Value?.Count(), Is.EqualTo(2));

            var participants = result.Value.ToList();
            Assert.That(int.Parse(participants[0].Score), Is.EqualTo(10));
            Assert.That(int.Parse(participants[0].TimeTaken), Is.EqualTo(30));
            Assert.That(int.Parse(participants[1].Score), Is.EqualTo(15));
            Assert.That(int.Parse(participants[1].TimeTaken), Is.EqualTo(25));
        }

        [Test, Order(2)]
        public async Task GetParticipant_ReturnsCorrectParticipant()
        {
            var result = await _controller.GetParticipant(1);
            Assert.That(result, Is.InstanceOf<ActionResult<Participant>>());
            Assert.That(result.Value?.Name, Is.EqualTo("John Doe"));
            Assert.That(int.Parse(result.Value?.Score ?? "0"), Is.EqualTo(10));
            Assert.That(int.Parse(result.Value?.TimeTaken ?? "0"), Is.EqualTo(30));
        }

        [Test, Order(3)]
        public void GetParticipant_NotFound_ThrowsNotFoundException()
        {
            var ex = Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetParticipant(99));
            Assert.That(ex.Message, Is.EqualTo("Participant with ID 99 not found"));
        }

        [Test, Order(4)]
        public async Task PutParticipant_UpdatesParticipant()
        {
            var participantResult = new ParticipantResult { ParticipantId = 1, Score = "20", TimeTaken = "40" };
            var result = await _controller.PutParticipant(1, participantResult);

            Assert.That(result, Is.InstanceOf<NoContentResult>());

            var updatedParticipant = await _context.Participants.FindAsync(1);
            Assert.That(int.Parse(EncryptionHelper.DecryptData(updatedParticipant.Score ?? "0")), Is.EqualTo(20));
            Assert.That(int.Parse(EncryptionHelper.DecryptData(updatedParticipant.TimeTaken ?? "0")), Is.EqualTo(40));
        }

        [Test, Order(5)]
        public async Task PostParticipant_CreatesNewParticipant()
        {
            var newParticipant = new Participant { Name = "Alice", Email = "alice@example.com", Password = "Test@123" };

            var result = await _controller.PostParticipant(newParticipant);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var createdParticipant = _context.Participants.FirstOrDefault(p => p.Email == "alice@example.com");
            Assert.That(createdParticipant, Is.Not.Null);
        }

        [Test, Order(6)]
        public async Task DeleteParticipant_RemovesParticipant()
        {
            var result = await _controller.DeleteParticipant(1);

            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(_context.Participants.Count(), Is.EqualTo(1));
        }
    }
}