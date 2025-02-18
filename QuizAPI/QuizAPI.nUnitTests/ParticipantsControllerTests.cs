using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizAPI.Controllers;
using QuizAPI.Models;

namespace QuizAPI.Tests
{
    [TestFixture]
    public class ParticipantsControllerTests
    {
        private ParticipantsController _controller;
        private QuizDbContext _context;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "QuizDb")
                .Options;

            _context = new QuizDbContext(options);
            _controller = new ParticipantsController(_context);

            _context.Participants.AddRange(new List<Participant>
            {
                new Participant { ParticipantId = 1, Name = "John Doe", Email = "john@example.com", Score = 10, TimeTaken = 30 },
                new Participant { ParticipantId = 2, Name = "Jane Doe", Email = "jane@example.com", Score = 15, TimeTaken = 25 }
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
        }

        [Test, Order(2)]
        public async Task GetParticipant_ReturnsCorrectParticipant()
        {
            var result = await _controller.GetParticipant(1);
            Assert.That(result, Is.InstanceOf<ActionResult<Participant>>());
            Assert.That(result.Value?.Name, Is.EqualTo("John Doe"));
        }

        [Test, Order(3)]
        public async Task GetParticipant_NotFound()
        {
            var result = await _controller.GetParticipant(99);
            Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
        }

        [Test, Order(4)]
        public async Task PostParticipant_CreatesNewParticipant()
        {
            var newParticipant = new Participant { Name = "Alice", Email = "alice@example.com" };
            var result = await _controller.PostParticipant(newParticipant);
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());
        }

        [Test, Order(5)]
        public async Task DeleteParticipant_RemovesParticipant()
        {
            var result = await _controller.DeleteParticipant(1);

            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(_context.Participants.Count(), Is.EqualTo(1));
        }
    }
}