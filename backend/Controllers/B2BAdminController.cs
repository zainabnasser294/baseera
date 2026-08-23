using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BaseeraAPI.Data;
using BaseeraAPI.Domain;

namespace BaseeraAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class B2BAdminController : ControllerBase
    {
        private readonly BaseeraDbContext _context;

        public B2BAdminController(BaseeraDbContext context)
        {
            _context = context;
        }

        // --- Users ---
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt })
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}/logs")]
        public async Task<IActionResult> GetUserAuthLogs(Guid id)
        {
            var logs = await _context.AuthLogs
                .Where(l => l.UserId == id)
                .OrderByDescending(l => l.Timestamp)
                .Take(20)
                .ToListAsync();
            return Ok(logs);
        }

        // --- Subscriptions ---
        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetSubscriptions()
        {
            var subs = await _context.Subscriptions
                .Include(s => s.User)
                .Select(s => new {
                    s.Id,
                    UserName = s.User.Name,
                    s.PlanName,
                    s.Price,
                    s.Status,
                    s.StartDate,
                    s.EndDate
                })
                .ToListAsync();
            return Ok(subs);
        }

        // --- Invoices ---
        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var invoices = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Subscription)
                .Select(i => new {
                    i.Id,
                    UserName = i.User.Name,
                    PlanName = i.Subscription.PlanName,
                    i.Amount,
                    i.PaymentStatus,
                    i.PaymentDate,
                    i.ThawaniTransactionId
                })
                .ToListAsync();
            return Ok(invoices);
        }

        // --- Notifications ---
        [HttpGet("notifications/{userId}")]
        public async Task<IActionResult> GetUserNotifications(Guid userId)
        {
            var notes = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
            return Ok(notes);
        }

        [HttpPost("notifications")]
        public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserNotifications), new { userId = notification.UserId }, notification);
        }
        
        // --- System History ---
        [HttpGet("history")]
        public async Task<IActionResult> GetSystemHistory()
        {
            var history = await _context.SystemHistories
                .Include(h => h.User)
                .OrderByDescending(h => h.Timestamp)
                .Take(50)
                .Select(h => new {
                    h.Id,
                    UserName = h.User.Name,
                    h.ActionType,
                    h.Details,
                    h.Timestamp
                })
                .ToListAsync();
            return Ok(history);
        }
    }
}
