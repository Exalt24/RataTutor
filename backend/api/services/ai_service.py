import os
import json
from io import BytesIO
from django.conf import settings
from openai import OpenAI
from docx import Document as DocxDocument
from pptx import Presentation as PptxPresentation
from PyPDF2 import PdfReader

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=settings.OPENROUTER_API_KEY,
)

def extract_text_from_pdf(path_on_disk: str) -> str:
    reader = PdfReader(path_on_disk)
    full_text = []
    for page in reader.pages:
        full_text.append(page.extract_text() or "")
    return "\n".join(full_text)

def extract_text_from_docx(path_on_disk: str) -> str:
    doc = DocxDocument(path_on_disk)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)

def read_text_file(path_on_disk: str) -> str:
    with open(path_on_disk, "r", encoding="utf-8") as f:
        return f.read()

def extract_text_from_pptx(path_on_disk: str) -> str:
    prs = PptxPresentation(path_on_disk)
    slides_text = []
    for slide in prs.slides:
        slide_paras = []
        for shape in slide.shapes:
            if hasattr(shape, "text") and shape.text.strip():
                slide_paras.append(shape.text.strip())
        if slide_paras:
            slides_text.append("\n".join(slide_paras))
    return "\n\n".join(slides_text)

def gather_material_text(material) -> str:
    """
    Concatenate all extractable text from the given Material’s attachments.
    """
    texts = []
    for attachment in material.attachments.all():
        path = attachment.file.path
        ext = os.path.splitext(path)[1].lower()
        if ext == ".pdf":
            texts.append(extract_text_from_pdf(path))
        elif ext == ".docx":
            texts.append(extract_text_from_docx(path))
        elif ext == ".txt":
            texts.append(read_text_file(path))
        elif ext == ".pptx":
            texts.append(extract_text_from_pptx(path))
        else:
            continue
    return "\n\n".join(texts).strip()

def generate_ai_response(text: str) -> str:
    """
    Send a plain-text prompt to DeepSeek/OpenRouter and return the assistant’s reply.
    """
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "user", "content": text}],
    )
    return response.choices[0].message.content

def generate_ai_response_for_material(material, prompt: str) -> str:
    """
    1) Extract text from every attachment in this Material.
    2) Append the user’s prompt.
    3) Send the combined string to DeepSeek and return the assistant’s reply.
    """
    # 1) Pull raw text from all attachments
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    # 2) Combine extracted text with the user’s prompt
    combined = f"{text_body}\n\nUser prompt:\n{prompt}"

    # 3) Call DeepSeek/OpenRouter chat endpoint
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "user", "content": combined}]
    )
    return response.choices[0].message.content


def generate_quiz_from_material(material, num_questions: int = 5) -> list[dict]:
    """
    Exactly as before: prompt the model to return JSON with a 'questions' array.
    """
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        "You are an AI tutor. Generate exactly " + str(num_questions) + " multiple‐choice questions "
        "based on the study material below. Each question must include:\n"
        "- 'question_text': the question string\n"
        "- 'choices': a JSON list of at least 4 options\n"
        "- 'correct_answer': one of those options exactly\n"
        "Return a single JSON object with key 'questions' mapping to a list of question objects. "
        "DO NOT include any additional explanation—only valid JSON.\n\n"
        "Example format:\n"
        "{\n  \"questions\": [\n"
        "    {\n      \"question_text\": \"...\",\n"
        "      \"choices\": [\"A\",\"B\",\"C\",\"D\"],\n"
        "      \"correct_answer\": \"B\"\n    },\n"
        "    … (total " + str(num_questions) + " questions)\n"
        "  ]\n}\n\n"
        "Now generate the JSON for the material below:\n"
        f"\"\"\"\n{text_body}\n\"\"\"\n"
    )

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[
            {"role": "system", "content": system_prompt}
        ],
    )
    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI did not return valid JSON: {e}\n\n{raw}")

    questions = parsed.get("questions")
    if not isinstance(questions, list) or len(questions) < 1:
        raise ValueError("AI JSON did not contain a 'questions' array.")

    validated = []
    for idx, qobj in enumerate(questions):
        qt = qobj.get("question_text", "").strip()
        ch = qobj.get("choices")
        ca = qobj.get("correct_answer", "").strip()
        if not qt or not isinstance(ch, list) or len(ch) < 2 or not ca:
            raise ValueError(f"Question #{idx+1} malformed: {qobj}")
        if ca not in [c.strip() for c in ch]:
            raise ValueError(f"Question #{idx+1} correct_answer not in choices: {qobj}")
        validated.append({
            "question_text": qt,
            "choices": [c.strip() for c in ch],
            "correct_answer": ca,
        })
    return validated

def generate_notes_from_material(material) -> list[dict]:
    """
    1) Extract raw text from attachments.
    2) Prompt the AI to produce a set of concise bullet-point notes, formatted as JSON.
    3) Return a list of dicts: { 'note_text': "<some bullet or paragraph>" }.
    """
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        "You are an AI study helper. Read the material below and produce a concise set of key points or "
        "bullet-point notes that capture the core concepts. Return the notes as a JSON object with key 'notes' "
        "mapping to a list of strings. Do NOT include any additional explanation—only valid JSON.\n\n"
        "Example format:\n"
        "{\n  \"notes\": [\n    \"First key point.\",\n    \"Second key point.\",\n    …\n  ]\n}\n\n"
        "Material:\n\"\"\"\n" + text_body + "\n\"\"\"\n"
    )

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "system", "content": system_prompt}],
    )
    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI did not return valid JSON for notes: {e}\n\n{raw}")

    notes = parsed.get("notes")
    if not isinstance(notes, list) or len(notes) < 1:
        raise ValueError("AI JSON did not contain a 'notes' array.")
    # Ensure each entry is a non-empty string
    output = []
    for idx, n in enumerate(notes):
        if not isinstance(n, str) or not n.strip():
            raise ValueError(f"Note #{idx+1} is not a valid non-empty string: {n}")
        output.append({"note_text": n.strip()})
    return output

def generate_flashcards_from_material(material, num_cards: int = 5) -> list[dict]:
    """
    1) Extract raw text from attachments.
    2) Prompt the AI to produce exactly num_cards of simple Q&A flashcards, in JSON:
       { 'flashcards': [ { 'question': "...", 'answer': "..." }, ... ] }
    3) Return a list of dicts with keys 'question' and 'answer'.
    """
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        "You are an AI study helper. From the following material, generate exactly " + str(num_cards) + 
        " simple question–answer flashcards. Return as JSON with key 'flashcards' mapping to a list of objects "
        "each having 'question' and 'answer' strings. Do NOT include any commentary—only valid JSON.\n\n"
        "Example format:\n"
        "{\n  \"flashcards\": [\n"
        "    { \"question\": \"What is X?\", \"answer\": \"X is ...\" },\n"
        "    … (total " + str(num_cards) + " cards) …\n"
        "  ]\n}\n\n"
        "Material:\n\"\"\"\n" + text_body + "\n\"\"\"\n"
    )

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "system", "content": system_prompt}],
    )
    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI did not return valid JSON for flashcards: {e}\n\n{raw}")

    cards = parsed.get("flashcards")
    if not isinstance(cards, list) or len(cards) < 1:
        raise ValueError("AI JSON did not contain a 'flashcards' array.")
    validated = []
    for idx, obj in enumerate(cards):
        q = obj.get("question", "").strip()
        a = obj.get("answer", "").strip()
        if not q or not a:
            raise ValueError(f"Flashcard #{idx+1} missing question or answer: {obj}")
        validated.append({"question": q, "answer": a})
    return validated
