from django.db import models
from django.utils import timezone

def attachment_upload_to(instance, filename):
    return f"uploads/material_{instance.material.id}/{filename}"


class Material(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("trash", "Trash"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
        help_text="(Optional) A short description of this material."
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="active"
    )

    pinned = models.BooleanField(
        default=False,
        help_text="If true, this material is pinned (e.g. shown at top of lists)."
    )
    public = models.BooleanField(
        default=False,
        help_text="If true, this material can be shared publicly; otherwise it’s private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"{self.title} — {short_desc}"
        return self.title


class Attachment(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="attachments"
    )
    file = models.FileField(upload_to=attachment_upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.id} for {self.material.title}"


class Note(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="notes"
    )
    content = models.TextField()

    def __str__(self):
        return f"Note for {self.material.title}"


class Flashcard(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="flashcards"
    )
    question = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return f"Flashcard for {self.material.title}"


class AIConversation(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="conversations"
    )
    messages = models.JSONField(default=list, blank=True)
    last_user_message = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.last_user_message:
            if not isinstance(self.messages, list):
                self.messages = []
            if not self.messages or self.messages[-1].get("content") != self.last_user_message:
                self.messages.append({
                    "role": "user",
                    "content": self.last_user_message,
                    "timestamp": timezone.now().isoformat()
                })
        super().save(*args, **kwargs)

    def __str__(self):
        return f"AIConversation for {self.material.title} (ID: {self.id})"


class Quiz(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )
    title = models.CharField(
        max_length=255,
        help_text="A title or description for this quiz."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quiz '{self.title}' for {self.material.title}"


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question_text = models.TextField()
    choices = models.JSONField(
        help_text="A JSON array of multiple‐choice options (must be at least two)."
    )
    correct_answer = models.TextField(
        help_text="The correct answer; must match one of the choices exactly."
    )

    def __str__(self):
        return f"Question {self.id} for quiz '{self.quiz.title}'"
