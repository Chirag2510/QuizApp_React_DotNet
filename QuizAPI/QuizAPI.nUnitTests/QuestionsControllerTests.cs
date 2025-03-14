using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using QuizAPI.Controllers;
using QuizAPI.Models;
using QuizAPI.Exceptions;

namespace QuizAPI.Tests
{
    [TestFixture]
    public class QuestionsControllerTests
    {
        private QuestionsController _controller;
        private QuizDbContext _context;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<QuizDbContext>()
                .UseInMemoryDatabase(databaseName: "QuizDb")
                .Options;

            _context = new QuizDbContext(options);
            _controller = new QuestionsController(_context);

            _context.Questions.AddRange(new List<Question>
            {
                new Question { QnId = 1, QnInWords = "What is 2+2?", ImageName = "", Option1 = "3", Option2 = "4", Option3 = "5", Option4 = "6", Answer = 2},
                new Question { QnId = 2, QnInWords = "What is 3+5?", ImageName = "", Option1 = "7", Option2 = "8", Option3 = "9", Option4 = "10", Answer = 2 },
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
        public async Task GetQuestions_ReturnsQuestions()
        {
            var result = await _controller.GetQuestions();
            Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<QuestionDto>>>());
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());

            var okResult = result.Result as OkObjectResult;
            var questions = okResult.Value as IEnumerable<QuestionDto>;
            Assert.That(questions.Count(), Is.EqualTo(2));
        }

        [Test, Order(2)]
        public async Task GetQuestion_ReturnsCorrectQuestion()
        {
            var result = await _controller.GetQuestion(1);
            Assert.That(result, Is.InstanceOf<ActionResult<Question>>());
            Assert.That(result.Value?.QnInWords, Is.EqualTo("What is 2+2?"));
        }

        [Test, Order(3)]
        public void GetQuestion_NotFound_ThrowsNotFoundException()
        {
            var ex = Assert.ThrowsAsync<NotFoundException>(async () => await _controller.GetQuestion(99));
            Assert.That(ex.Message, Is.EqualTo("Question with ID 99 not found"));
        }

        [Test, Order(4)]
        public async Task PutQuestion_UpdatesQuestion()
        {
            var question = _context.Questions.First();
            question.QnInWords = "Updated Question?";
            var result = await _controller.PutQuestion(question.QnId, question);

            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(_context.Questions.First().QnInWords, Is.EqualTo("Updated Question?"));
        }

        [Test, Order(5)]
        public async Task RetrieveAnswers_ReturnsCorrectAnswers()
        {
            var result = await _controller.RetrieveAnswers(new int[] { 1, 2 });
            Assert.That(result, Is.InstanceOf<ActionResult<IEnumerable<QuestionAnswerDto>>>());
            Assert.That(result.Result, Is.InstanceOf<OkObjectResult>());

            var okResult = result.Result as OkObjectResult;
            var answers = okResult.Value as IEnumerable<QuestionAnswerDto>;
            Assert.That(answers.Count(), Is.EqualTo(2));
        }

        [Test, Order(6)]
        public void RetrieveAnswers_NoIdsProvided_ThrowsBadRequestException()
        {
            var ex = Assert.ThrowsAsync<BadRequestException>(async () => await _controller.RetrieveAnswers(new int[] { }));
            Assert.That(ex.Message, Is.EqualTo("No question IDs provided"));
        }

        [Test, Order(7)]
        public async Task DeleteQuestion_RemovesQuestion()
        {
            var result = await _controller.DeleteQuestion(1);

            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(_context.Questions.Count(), Is.EqualTo(1));
        }

        [Test, Order(8)]
        public void DeleteQuestion_NotFound_ThrowsNotFoundException()
        {
            var ex = Assert.ThrowsAsync<NotFoundException>(async () => await _controller.DeleteQuestion(99));
            Assert.That(ex.Message, Is.EqualTo("Question with ID 99 not found"));
        }
    }
}