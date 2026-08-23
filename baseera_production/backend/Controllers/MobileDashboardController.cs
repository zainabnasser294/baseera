using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace BaseeraAPI.Controllers
{
    // Custom Action Filter to validate the Team API Key
    public class TeamApiKeyAuthorizeAttribute : ActionFilterAttribute
    {
        private const string API_KEY_HEADER_NAME = "X-Team-API-Key";
        private const string EXPECTED_API_KEY = "BSR_MOBILE_DEV_2026_x9f8e7d6c5b";

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.HttpContext.Request.Headers.TryGetValue(API_KEY_HEADER_NAME, out var extractedApiKey))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "API Key is missing." });
                return;
            }

            if (!EXPECTED_API_KEY.Equals(extractedApiKey))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Invalid API Key." });
                return;
            }

            base.OnActionExecuting(context);
        }
    }

    [ApiController]
    [Route("api/dashboard")]
    [TeamApiKeyAuthorize] // Secures all endpoints in this controller
    public class MobileDashboardController : ControllerBase
    {
        [HttpGet("stats")]
        public IActionResult GetStats()
        {
            var stats = new
            {
                daily_revenue = 8450,
                active_orders = 32,
                canceled_orders = 3,
                top_selling_item = "Iced Americano"
            };

            return Ok(stats);
        }

        [HttpGet("charts")]
        public IActionResult GetCharts()
        {
            var charts = new[]
            {
                new { time = "08:00 AM", sales = 150 },
                new { time = "09:00 AM", sales = 320 },
                new { time = "10:00 AM", sales = 500 },
                new { time = "11:00 AM", sales = 420 },
                new { time = "12:00 PM", sales = 800 }
            };

            return Ok(charts);
        }

        [HttpGet("ai-recommendations")]
        public IActionResult GetAiRecommendations()
        {
            var insight = new
            {
                status = "success",
                ai_insight = "مبيعات اللاتيه تنخفض في المساء، نقترح إطلاق عرض ترويجي.",
                action_required = "Create Promo"
            };

            return Ok(insight);
        }
    }
}
