from google import genai
import os

# Ensure API key is set if provided in the previous steps
api_key = ""
if not os.environ.get("GEMINI_API_KEY"):
    os.environ["GEMINI_API_KEY"] = api_key

try:
    client = genai.Client()

    stream = client.interactions.create(
        model="gemini-3.6-flash",
        input="Explain how AI works",
        stream=True
    )
    for event in stream:
        print(event)
except Exception as e:
    print(f"Error occurred: {e}")
