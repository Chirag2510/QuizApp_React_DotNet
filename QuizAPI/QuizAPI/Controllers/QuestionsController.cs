using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using QuizAPI.Models;
using QuizAPI.Exceptions;

namespace QuizAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionsController : ControllerBase
    {
        private readonly QuizDbContext _context;

        public QuestionsController(QuizDbContext context)
        {
            _context = context;
        }

        // GET: api/Questions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestions()
        {
            var random5Qns = await _context.Questions
                .Select(x => new QuestionDto
                {
                    QnId = x.QnId,
                    QnInWords = x.QnInWords,
                    ImageName = x.ImageName,
                    Options = new string[] { x.Option1, x.Option2, x.Option3, x.Option4 }
                })
                .OrderBy(y => Guid.NewGuid())
                .Take(5)
                .ToListAsync();

            return Ok(random5Qns);
        }

        // GET: api/Questions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Question>> GetQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);

            if (question == null)
            {
                throw new NotFoundException($"Question with ID {id} not found");
            }

            return question;
        }

        // PUT: api/Questions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutQuestion(int id, Question question)
        {
            if (id != question.QnId)
            {
                throw new BadRequestException("ID mismatch");
            }

            _context.Entry(question).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!QuestionExists(id))
                {
                    throw new NotFoundException($"Question with ID {id} not found");
                }
                throw;
            }

            return NoContent();
        }

        // POST: api/Questions/GetAnswers
        [HttpPost]
        [Route("GetAnswers")]
        public async Task<ActionResult<IEnumerable<QuestionAnswerDto>>> RetrieveAnswers(int[] qnIds)
        {
            if (qnIds == null || qnIds.Length == 0)
            {
                throw new BadRequestException("No question IDs provided");
            }

            var answers = await _context.Questions
                .Where(x => qnIds.Contains(x.QnId))
                .Select(y => new QuestionAnswerDto
                {
                    QnId = y.QnId,
                    QnInWords = y.QnInWords,
                    ImageName = y.ImageName,
                    Options = new string[] { y.Option1, y.Option2, y.Option3, y.Option4 },
                    Answer = y.Answer
                }).ToListAsync();

            if (!answers.Any())
            {
                throw new NotFoundException("No questions found for the provided IDs");
            }

            return Ok(answers);
        }

        // DELETE: api/Questions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuestion(int id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
            {
                throw new NotFoundException($"Question with ID {id} not found");
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool QuestionExists(int id)
        {
            return _context.Questions.Any(e => e.QnId == id);
        }
    }
}
