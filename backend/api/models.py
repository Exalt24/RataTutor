import os
import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Material(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="materials",
        help_text="The user who owns this material."
    )
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

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['owner', 'title'], name='unique_owner_title')
        ]

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"{self.title} — {short_desc}"
        return self.title


class Attachment(models.Model):
    material = models.ForeignKey(
        'Material',
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    file = models.FileField(
        upload_to='attachments/',
        help_text="Upload your file (DOCX, PPTX, TXT, PDF)."
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.id} for {self.material.title}"


class Note(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="notes"
    )
    title = models.CharField(
        max_length=255,
        help_text="A short title for this note.",
    )
    description = models.TextField(
        blank=True,
        help_text="(Optional) A longer description or details for this note."
    )
    content = models.TextField()
    public = models.BooleanField(
        default=False,
        help_text="If true, this note is shared publicly; otherwise it’s private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"Note '{self.title}' — {short_desc}"
        return f"Note '{self.title}'"


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
    description = models.TextField(
        blank=True,
        help_text="(Optional) Additional instructions or description for this quiz."
    )
    public = models.BooleanField(
        default=False,
        help_text="If true, this quiz is shared publicly; otherwise it’s private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"Quiz '{self.title}' — {short_desc}"
        return f"Quiz '{self.title}'"


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


class FlashcardSet(models.Model):
    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="flashcard_sets"
    )
    title = models.CharField(
        max_length=255,
        help_text="A short title for this flashcard set.",
    )
    description = models.TextField(
        blank=True,
        help_text="(Optional) A longer description or instructions for this flashcard set."
    )
    public = models.BooleanField(
        default=False,
        help_text="If true, this flashcard set is shared publicly; otherwise it’s private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"FlashcardSet '{self.title}' — {short_desc}"
        return f"FlashcardSet '{self.title}'"


class Flashcard(models.Model):
    flashcard_set = models.ForeignKey(
        FlashcardSet,
        on_delete=models.CASCADE,
        related_name="cards"
    )
    question = models.TextField()
    answer = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        short_q = (self.question[:27] + "...") if len(self.question) > 30 else self.question
        return f"Card for '{self.flashcard_set.title}': {short_q}"
