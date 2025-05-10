from django.conf import settings
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

def generate_ai_response(prompt: str) -> str:
    """Send the prompt to OpenRouter and return the assistant’s reply."""
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
