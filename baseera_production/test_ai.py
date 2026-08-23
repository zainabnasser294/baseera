from dashboard.services.ai_service import GeminiAIService
ai = GeminiAIService()
res = ai.extract_receipt_data('test_image.png')
print(res)
