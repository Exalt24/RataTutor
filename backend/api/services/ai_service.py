import os
import json
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
    return "\n\n".join(texts).strip()

def generate_ai_response(text: str) -> str:
    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "user", "content": text}],
    )
    return response.choices[0].message.content

def generate_ai_response_for_material(material, prompt: str) -> str:
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    combined = f"{text_body}\n\nUser prompt:\n{prompt}"

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "user", "content": combined}]
    )
    return response.choices[0].message.content

def generate_quiz_from_material(material, num_questions: int = 5) -> dict:
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        f"You are an AI tutor. Generate exactly {num_questions} multiple-choice questions "
        "based on the study material below. Additionally, generate a title and a description "
        "for the quiz. Return JSON with this structure:\n"
        "{\n"
        "  \"title\": \"<quiz title>\",\n"
        "  \"description\": \"<quiz description>\",\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question_text\": \"...\",\n"
        "      \"choices\": [\"A\",\"B\",\"C\",\"D\"],\n"
        "      \"correct_answer\": \"B\"\n"
        "    },\n"
        f"    … (total {num_questions} questions)\n"
        "  ]\n"
        "}\n\n"
        f"Material:\n\"\"\"\n{text_body}\n\"\"\"\n"
    )

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "system", "content": system_prompt}],
    )
    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI did not return valid JSON for quiz: {e}\n\n{raw}")

    title = parsed.get("title")
    description = parsed.get("description")
    questions = parsed.get("questions")

    if not isinstance(title, str) or not title.strip():
        raise ValueError("AI did not return a valid 'title' for the quiz.")
    if not isinstance(description, str):
        description = ""
    if not isinstance(questions, list) or len(questions) < 1:
        raise ValueError("AI JSON did not contain a valid 'questions' array.")

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

    return {
        "title": title.strip(),
        "description": description.strip(),
        "questions": validated,
    }

def generate_notes_from_material(material) -> dict:
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        "You are an AI study helper. Read the material below and produce a concise set of key points or "
        "bullet-point notes that capture the core concepts. Additionally, generate a title and a description "
        "for the note set. Return JSON with this structure:\n"
        "{\n"
        "  \"title\": \"<note set title>\",\n"
        "  \"description\": \"<note set description>\",\n"
        "  \"notes\": [\n"
        "    \"First key point.\",\n"
        "    \"Second key point.\",\n"
        "    …\n"
        "  ]\n"
        "}\n\n"
        f"Material:\n\"\"\"\n{text_body}\n\"\"\"\n"
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

    title = parsed.get("title")
    description = parsed.get("description")
    notes = parsed.get("notes")

    if not isinstance(title, str) or not title.strip():
        raise ValueError("AI did not return a valid 'title' for the notes.")
    if not isinstance(description, str):
        description = ""
    if not isinstance(notes, list) or len(notes) < 1:
        raise ValueError("AI JSON did not contain a valid 'notes' array.")

    output = []
    for idx, n in enumerate(notes):
        if not isinstance(n, str) or not n.strip():
            raise ValueError(f"Note #{idx+1} is not a valid non-empty string: {n}")
        output.append({"note_text": n.strip()})

    return {
        "title": title.strip(),
        "description": description.strip(),
        "notes": output,
    }

def generate_flashcards_from_material(material, num_cards: int = 5) -> dict:
    text_body = gather_material_text(material)
    if not text_body:
        raise ValueError("No extractable text found in this Material’s attachments.")

    system_prompt = (
        f"You are an AI study helper. From the material below, generate exactly {num_cards} "
        "simple question-answer flashcards. Additionally, generate a title and description "
        "for the flashcard set. Return JSON with the following structure:\n"
        "{\n"
        "  \"title\": \"<title for flashcard set>\",\n"
        "  \"description\": \"<description or instructions>\",\n"
        "  \"flashcards\": [\n"
        "    { \"question\": \"...\", \"answer\": \"...\" },\n"
        "    ...\n"
        "  ]\n"
        "}\n\n"
        f"Material:\n\"\"\"\n{text_body}\n\"\"\"\n"
    )

    response = client.chat.completions.create(
        model="deepseek/deepseek-chat-v3-0324:free",
        messages=[{"role": "system", "content": system_prompt}],
    )
    raw = response.choices[0].message.content.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI did not return valid JSON for flashcards with metadata: {e}\n\n{raw}")

    title = parsed.get("title")
    description = parsed.get("description")
    cards = parsed.get("flashcards")

    if not isinstance(title, str) or not title.strip():
        raise ValueError("AI did not return a valid 'title' for the flashcard set.")
    if not isinstance(description, str):
        description = ""
    if not isinstance(cards, list) or len(cards) < 1:
        raise ValueError("AI JSON did not contain a valid 'flashcards' array.")

    validated = []
    for idx, obj in enumerate(cards):
        q = obj.get("question", "").strip()
        a = obj.get("answer", "").strip()
        if not q or not a:
            raise ValueError(f"Flashcard #{idx+1} missing question or answer: {obj}")
        validated.append({"question": q, "answer": a})

    return {
        "title": title.strip(),
        "description": description.strip(),
        "flashcards": validated,
    }
