using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Diagnostics;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace BaseeraAPI.Controllers
{
    [ApiController]
    [Route("api/insights")]
    public class InsightController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string _uploadsFolder;
        private readonly string _analyzeScriptPath;

        public InsightController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            
            // Set up folders relative to execution directory
            var baseDir = AppContext.BaseDirectory;
            var projectDir = Path.GetFullPath(Path.Combine(baseDir, "..", "..", ".."));
            _uploadsFolder = Path.Combine(projectDir, "uploads");
            _analyzeScriptPath = Path.Combine(projectDir, "analyze.py");

            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        public class SandboxExecutionRequest
        {
            public string PythonCode { get; set; } = null!;
        }

        public class GeneralAskRequest
        {
            public string Question { get; set; } = null!;
            public string Language { get; set; } = "ar";
        }

        public class ChatMessage
        {
            public string Role { get; set; } = null!; // user, assistant
            public string Content { get; set; } = null!;
        }

        public class ChatRequest
        {
            public List<ChatMessage> Messages { get; set; } = null!;
            public string? FileContext { get; set; } // Optional: details of the analyzed file
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> RunAnalysis([FromBody] SandboxExecutionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PythonCode))
            {
                return BadRequest(new { message = "Python code is required." });
            }

            var client = _httpClientFactory.CreateClient();
            var sandboxUrl = "http://baseera-sandbox:8000/run";

            try
            {
                var response = await client.PostAsJsonAsync(sandboxUrl, new { code = request.PythonCode });
                
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<JsonDocument>();
                    return Ok(result);
                }
                else
                {
                    var errorDetails = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { message = "Sandbox execution failed", details = errorDetails });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { message = "Sandbox container is unreachable. Make sure docker-compose is running.", error = ex.Message });
            }
        }

        [HttpPost("ask")]
        public IActionResult GeneralAsk([FromBody] GeneralAskRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new { message = "Question is required." });
            }

            var q = request.Question.ToLower();

            // Simulate database queries based on questions
            if (q.Contains("كورتادو") || q.Contains("cortado"))
            {
                return Ok(new
                {
                    title = "مبيعات الكورتادو (كوفي شوب)",
                    labels = new[] { "2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16" },
                    data = new[] { 180, 216, 270, 198, 252, 324, 288 }
                });
            }
            else if (q.Contains("سبانش") || q.Contains("latte") || q.Contains("لاتيه"))
            {
                return Ok(new
                {
                    title = "مبيعات سبانش لاتيه بارد",
                    labels = new[] { "2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16" },
                    data = new[] { 220, 308, 440, 396, 352, 550, 484 }
                });
            }
            else if (q.Contains("زعتر") || q.Contains("croissant") || q.Contains("كرواسون"))
            {
                return Ok(new
                {
                    title = "مبيعات كرواسون زعتر",
                    labels = new[] { "2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16" },
                    data = new[] { 75, 120, 150, 90, 105, 180, 165 }
                });
            }
            else
            {
                return Ok(new
                {
                    title = "مقارنة المبيعات الإجمالية للأصناف",
                    labels = new[] { "سبانش لاتيه بارد", "كورتادو", "كرواسون زعتر" },
                    data = new[] { 2750.00, 1728.00, 885.00 }
                });
            }
        }

        [HttpPost("upload-analysis")]
        public async Task<IActionResult> UploadAndAnalyze(IFormFile file, [FromForm] string question)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            if (string.IsNullOrWhiteSpace(question))
            {
                return BadRequest(new { message = "Question is required." });
            }

            // Save file
            var fileExtension = Path.GetExtension(file.FileName);
            var tempFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(_uploadsFolder, tempFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            try
            {
                // Run python process with UTF-8 encoding support
                var start = new ProcessStartInfo
                {
                    FileName = "python",
                    Arguments = $"\"{_analyzeScriptPath}\" \"{filePath}\" \"{question}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    StandardOutputEncoding = System.Text.Encoding.UTF8, // Fix Arabic encoding!
                    StandardErrorEncoding = System.Text.Encoding.UTF8
                };

                using (var process = Process.Start(start))
                {
                    if (process == null)
                    {
                        return StatusCode(500, new { message = "Failed to start python analysis process." });
                    }

                    string output = await process.StandardOutput.ReadToEndAsync();
                    string error = await process.StandardError.ReadToEndAsync();
                    await process.WaitForExitAsync();

                    if (process.ExitCode != 0)
                    {
                        return StatusCode(500, new { message = "Python script error", details = error });
                    }

                    try
                    {
                        var jsonResult = JsonSerializer.Deserialize<JsonElement>(output);
                        return Ok(jsonResult);
                    }
                    catch (JsonException)
                    {
                        return Ok(new { title = "نتائج التحليل الإجمالية", rawOutput = output });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error executing analysis.", details = ex.Message });
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        [HttpPost("chat")]
        public async Task Chat([FromBody] ChatRequest request)
        {
            if (request.Messages == null || request.Messages.Count == 0)
            {
                Response.StatusCode = 400;
                await Response.WriteAsync("Messages are required.");
                return;
            }

            var apiKey = _configuration["GeminiApiKey"] ?? "";
            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key={apiKey}";

            var contents = new List<object>();
            foreach (var msg in request.Messages)
            {
                contents.Add(new
                {
                    role = msg.Role == "assistant" ? "model" : "user",
                    parts = new[] { new { text = msg.Content } }
                });
            }

            // Optional: inject file context invisibly
            if (!string.IsNullOrWhiteSpace(request.FileContext))
            {
                contents.Insert(0, new
                {
                    role = "user",
                    parts = new[] { new { text = $"System Context (Do not mention this context directly unless relevant): The user uploaded a file with these details: {request.FileContext}" } }
                });
            }

            var payload = new
            {
                contents = contents,
                systemInstruction = new
                {
                    role = "user",
                    parts = new[] { new { text = @"أنت محرك الذكاء الاصطناعي الأساسي المتقدم لمنصة ""بصيرة"" (Baseera)، والذي تم تصميمه ليضاهي أدوات التحليل المالي والبياني المتقدمة مثل Julius AI. هدفك الرئيسي هو تقديم استشارات مالية ورؤى عميقة (Deep Insights) للشركات الصغيرة والمتوسطة (SMEs).

ملاحظة هامة جداً عن القطاعات: النظام مصمم ليكون شاملاً ومرناً لجميع القطاعات حرفياً (عقارات، صيدليات، مطاعم، تجزئة، وغيرها). استنتج نوع القطاع من أسماء الأعمدة في العينة، وقدم تحليلاتك واستشاراتك مخصصة بالكامل للقطاع المستنتج.

هام جداً عن البيانات: أنت لا تملك مجموعة البيانات كاملة، بل يرسل لك النظام عينة من 5 صفوف لفهم هيكلية الأعمدة. لذلك:
- يُمنع منعاً باتاً تأليف أرقام أو أسماء منتجات، أو محاولة حساب مجاميع في ردك النصي.
- يجب أن يكون ردك النصي تحليلياً منهجياً واستشارياً، يوجه المستخدم لكيفية التفكير في بياناته وما هي الرسوم البيانية التي تدعم هذا التفكير.
- عند التوصية بتحليل معين، قم بإرفاق هيكلية المخطط بصيغة JSON داخل كود بلوك (```json). الواجهة الأمامية ستحسب الأرقام الحقيقية.

إرشادات التحليل المتقدم (Advanced Analytics Guidelines):
1. تحليل التباين (Variance Analysis): اسأل ووجه المستخدم للبحث عن الفروقات في الأداء (مثلاً: لماذا انخفضت أرباح هذا الربع مقارنة بالربع الماضي؟).
2. تحليل الأسباب الجذرية (Root Cause Analysis): لا تكتفِ بذكر المشكلة، بل اقترح محاور للبحث عن السبب (هل هو تسعير، تكلفة مورد، كفاءة تسويق؟).
3. التوصيات الاستراتيجية (Strategic Recommendations): قدم نصائح عملية وقابلة للتنفيذ بناءً على سياق سؤال المستخدم وعينة البيانات.
4. استخدم نبرة استشارية احترافية، مدعمة بالمنطق الاقتصادي والمالي.

إرشادات التنسيق للمخططات (JSON):
يجب أن يكون الـ JSON متوافقاً تماماً مع هذا الهيكل فقط:
```json
{
  ""widgets"": [
    {
      ""type"": ""bar_chart"", // Options: bar_chart, line_chart, pie_chart, kpi_card
      ""title"": ""عنوان المخطط"",
      ""config"": {
        ""x_axis"": ""اسم عمود الفئات"",
        ""y_axis"": ""اسم عمود القيم"",
        ""aggregation"": ""SUM"" // Options: SUM, AVG, COUNT
      }
    }
  ]
}
```

بروتوكولات الأمان: يُمنع التدخل في خدمة العملاء الحية. أي شكوى يتم توجيهها للنظام المناسب.
هام جداً: أجب بنفس لغة المستخدم بدقة واحترافية." } }
                }
            };

            var client = _httpClientFactory.CreateClient();
            var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint);
            httpRequest.Content = JsonContent.Create(payload);

            using var response = await client.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead);

            if (response.IsSuccessStatusCode)
            {
                Response.ContentType = "text/event-stream";
                using var stream = await response.Content.ReadAsStreamAsync();
                var buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    await Response.Body.WriteAsync(buffer, 0, bytesRead);
                    await Response.Body.FlushAsync();
                }
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                Response.StatusCode = (int)response.StatusCode;
                await Response.WriteAsync(error);
            }
        }
    }
}
