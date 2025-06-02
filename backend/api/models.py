# backend/accounts/models.py   (or wherever your “File” lives)

from django.db import models
from django.utils import timezone

class File(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('trash', 'Trash'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(
        blank=True,
        help_text="(Optional) A short description of this file."
    )
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk:  # Only when creating a brand-new File
            base_title = self.title
            counter = 1
            while File.objects.filter(title=self.title).exists():
                self.title = f"{base_title} ({counter})"
                counter += 1
        super().save(*args, **kwargs)

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + '...') if len(self.description) > 30 else self.description
            return f"{self.title} — {short_desc}"
        return self.title


class Note(models.Model):
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    content = models.TextField()

    def __str__(self):
        return f"Note for {self.file.title}"


class Flashcard(models.Model):
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='flashcards'
    )
    question = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return f"Flashcard for {self.file.title}"


class AIConversation(models.Model):
    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='conversations'
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
        return f"AIConversation for {self.file.title} (ID: {self.id})"
