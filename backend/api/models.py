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
        help_text="If true, this material can be shared publicly; otherwise it's private."
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
        help_text="If true, this note is shared publicly; otherwise it's private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['material', 'title'], name='unique_material_note_title')
        ]

    def __str__(self):
        if self.description:
            short_desc = (self.description[:27] + "...") if len(self.description) > 30 else self.description
            return f"Note '{self.title}' — {short_desc}"
        return f"Note '{self.title}'"



# models.py - Complete AIConversation with all the methods

class AIConversation(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="conversations",
        null=False,
        blank=False,
        help_text="The user who owns this conversation"
    )

    material = models.ForeignKey(
        Material,
        on_delete=models.CASCADE,
        related_name="conversations",
        null=True,
        blank=True,  # Allow conversations without a material
    )

    # ✅ FIXED: Use a callable for JSONField default
    messages = models.JSONField(default=list, blank=True)  # This should work
    last_user_message = models.TextField(blank=True, null=True)
    
    # Keep old context for backward compatibility
    context = models.TextField(default="", blank=True)
    
    # ✅ NEW: Smart context management fields
    summary_context = models.TextField(
        default="", 
        blank=True,
        help_text="AI-generated summary of conversation context"
    )
    
    messages_since_summary = models.IntegerField(
        default=0,
        help_text="Number of messages added since last summary generation"
    )
    
    last_summary_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the summary was last generated"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ✅ ADD THIS: Meta class to enforce one conversation per material per user
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'material'], 
                name='unique_user_material_conversation',
                condition=models.Q(material__isnull=False)  # Only apply when material is not null
            )
        ]

    def save(self, *args, **kwargs):
        # ✅ Ensure messages is always a list
        if self.messages is None:
            self.messages = []
        elif not isinstance(self.messages, list):
            self.messages = []
        super().save(*args, **kwargs)

    def addToMessage(self):
        if self.last_user_message:
            # ✅ Ensure messages is a list
            if not isinstance(self.messages, list):
                self.messages = []

            # Only append if it's not a duplicate of the last message
            if not self.messages or self.messages[-1].get("content") != self.last_user_message:
                self.messages.append({
                    "role": "user",
                    "content": self.last_user_message,
                    "timestamp": timezone.now().isoformat()
                })

                # Keep old context for backward compatibility
                if self.context:
                    self.context += f"\n user: {self.last_user_message}"
                else:
                    self.context = f"user: {self.last_user_message}"
                
                # Track messages since summary
                self.messages_since_summary += 1

    # ✅ CONVERSATION MANAGER METHODS (built into the model)
    
    def get_summary_threshold(self):
        """
        Dynamically adjust when to regenerate summaries based on conversation patterns
        """
        if not self.messages:
            return 8  # Default

        # More frequent summaries for complex topics
        recent_messages = self.messages[-5:]
        complexity_indicators = [
            'explain', 'how', 'why', 'complex', 'detail', 'elaborate',
            'understand', 'clarify', 'what does this mean'
        ]

        complexity_score = sum(
            1 for msg in recent_messages 
            for indicator in complexity_indicators
            if indicator in msg.get('content', '').lower()
        )

        if complexity_score > 3:
            return 5  # More frequent summaries for complex discussions
        elif complexity_score > 1:
            return 6
        else:
            return 8  # Standard frequency

    def should_regenerate_summary(self):
        """
        Determine if we should regenerate the conversation summary.
        Uses adaptive threshold based on conversation complexity.
        """
        threshold = self.get_summary_threshold()
        return (
            not self.summary_context or 
            self.messages_since_summary >= threshold
        )

    def should_include_material_context(self, prompt):
        """
        Decide whether to include material text based on question relevance
        """
        if not self.material or not self.material.attachments.exists():
            return False
            
        material_indicators = [
            'document', 'text', 'material', 'content', 'attachment',
            'what does it say', 'according to', 'in the material',
            'from the file', 'in the pdf', 'the document says'
        ]
        
        return any(indicator in prompt.lower() for indicator in material_indicators)

    def detect_conversation_topic(self):
        """
        Detect main topic of conversation for better context management
        """
        if not self.messages:
            return "general"

        recent_content = " ".join([
            msg.get('content', '') for msg in self.messages[-5:]
        ])

        # Topic detection with keywords
        topics = {
            'flashcards': ['flashcard', 'term', 'definition', 'memorize', 'remember'],
            'quiz': ['quiz', 'test', 'question', 'answer', 'multiple choice', 'exam'],
            'notes': ['note', 'summary', 'key point', 'important', 'summarize'],
            'study': ['study', 'learn', 'understand', 'explain', 'teach me'],
            'homework': ['homework', 'assignment', 'project', 'due date'],
        }

        for topic, keywords in topics.items():
            if any(keyword in recent_content.lower() for keyword in keywords):
                return topic

        return "general"

    def get_context_for_ai(self):
        """
        Get the context to send to AI - either summary + recent messages
        or just recent messages if conversation is short.
        """
        if len(self.messages) <= 6:
            # Short conversation: use all messages
            return self._format_recent_messages(self.messages)

        # Long conversation: use summary + recent messages
        recent_messages = self.messages[-4:]  # Last 4 messages

        context_parts = []
        if self.summary_context:
            context_parts.append(f"Previous conversation summary:\n{self.summary_context}")

        if recent_messages:
            context_parts.append(f"Recent messages:\n{self._format_recent_messages(recent_messages)}")

        return "\n\n".join(context_parts)

    def _format_recent_messages(self, messages):
        """Format messages for AI context"""
        formatted = []
        for msg in messages:
            role = msg.get('role', 'user')
            content = msg.get('content', '')
            formatted.append(f"{role}: {content}")
        return "\n".join(formatted)

    def get_context_aware_system_prompt(self):
        """
        Get a system prompt customized for this conversation's context
        """
        topic = self.detect_conversation_topic()
        
        base_prompt = "You are an AI tutor helping students learn. "
        
        topic_prompts = {
            'flashcards': "Focus on creating clear, memorable question-answer pairs. Help break down complex concepts into digestible flashcard format.",
            'quiz': "Help with test preparation and understanding question types. Provide clear explanations for answers.",
            'notes': "Emphasize key concepts and structured information. Help organize information clearly.",
            'study': "Provide clear explanations and effective learning strategies. Break down complex topics step by step.",
            'homework': "Help guide the student through their assignments without doing the work for them.",
            'general': "Assist with general learning questions in a helpful and encouraging manner."
        }
        
        material_info = ""
        if self.material:
            material_info = f"The student is working with material titled '{self.material.title}'. "
            if self.material.attachments.exists():
                material_info += "Reference the uploaded content when relevant. "
        
        return base_prompt + topic_prompts.get(topic, topic_prompts['general']) + material_info

    def reset_summary_counter(self):
        """Reset the summary counter after generating a new summary"""
        self.messages_since_summary = 0
        self.last_summary_at = timezone.now()

    def __str__(self):
        if self.material:
            return f"AIConversation for {self.material.title} (ID: {self.id})"
        return f"AIConversation (ID: {self.id}) — No Material"


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
        help_text="If true, this quiz is shared publicly; otherwise it's private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['material', 'title'], name='unique_material_quiz_title')
        ]

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
        help_text="If true, this flashcard set is shared publicly; otherwise it's private."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['material', 'title'], name='unique_material_flashcardset_title')
        ]

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