from django.core.validators import MinLengthValidator
from rest_framework import serializers

from api.models import File, Note, Flashcard, AIConversation

class NoteSerializer(serializers.ModelSerializer):
    file = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        help_text="ID of an existing File to which this note belongs.",
    )
    content = serializers.CharField(
        max_length=2000,
        validators=[
            MinLengthValidator(1, message="Note content cannot be empty."),
        ],
        help_text="The text content of the note. Must be at least 1 character."
    )

    class Meta:
        model = Note
        fields = ["id", "file", "content"]
        read_only_fields = ["id"]

    def validate_content(self, value):
        text = value.strip()
        if not text:
            raise serializers.ValidationError("Note content cannot be just whitespace.")
        return text

    def validate(self, data):
        request = self.context.get("request")
        file_obj = data.get("file")

        if request and hasattr(request, "user"):
            if hasattr(file_obj, "owner") and file_obj.owner != request.user:
                raise serializers.ValidationError("You do not have permission to add notes to that File.")
        return data

class FlashcardSerializer(serializers.ModelSerializer):
    file = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        help_text="ID of an existing File to which this flashcard belongs.",
    )
    question = serializers.CharField(
        max_length=2000,
        validators=[MinLengthValidator(1, message="Flashcard question cannot be empty.")],
        help_text="The question text for this flashcard."
    )
    answer = serializers.CharField(
        max_length=2000,
        validators=[MinLengthValidator(1, message="Flashcard answer cannot be empty.")],
        help_text="The answer text for this flashcard."
    )

    class Meta:
        model = Flashcard
        fields = ["id", "file", "question", "answer"]
        read_only_fields = ["id"]

    def validate_question(self, value):
        text = value.strip()
        if not text:
            raise serializers.ValidationError("Flashcard question cannot be just whitespace.")
        return text

    def validate_answer(self, value):
        text = value.strip()
        if not text:
            raise serializers.ValidationError("Flashcard answer cannot be just whitespace.")
        return text

    def validate(self, data):
        q = data.get("question", "").strip()
        a = data.get("answer", "").strip()
        if q == a:
            raise serializers.ValidationError("Flashcard question and answer cannot be identical.")

        request = self.context.get("request")
        file_obj = data.get("file")
        if request and hasattr(request, "user"):
            if hasattr(file_obj, "owner") and file_obj.owner != request.user:
                raise serializers.ValidationError("You do not have permission to add flashcards to that File.")
        return data

class FileSerializer(serializers.ModelSerializer):
    
    title = serializers.CharField(
        max_length=255,
        validators=[
            MinLengthValidator(1, message="Title cannot be blank or just whitespace."),
        ],
        help_text="A title for this File. If it already exists, the model will rename it automatically."
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=5000,
        help_text="(Optional) A short description of this file."
    )

    status = serializers.ChoiceField(
        choices=File.STATUS_CHOICES,
        default="active",
        help_text="Must be one of: 'active' or 'trash'."
    )

    notes = NoteSerializer(many=True, read_only=True)
    flashcards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = File
        fields = [
            "id",
            "title",
            "description",
            "status",
            "notes",
            "flashcards",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_title(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Title cannot be blank or just whitespace.")
        return clean

    def validate_description(self, value):
        return value.strip()

    def validate(self, data):
        request = self.context.get("request")

        if data.get("status") == "trash" and not data.get("description", "").strip():
            raise serializers.ValidationError("You must provide a description when marking a file as 'trash'.")

        
        instance = getattr(self, "instance", None)
        if instance and request and hasattr(request, "user"):
            if hasattr(instance, "owner") and instance.owner != request.user:
                raise serializers.ValidationError("You do not have permission to modify that File.")
        return data

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

class AIConversationSerializer(serializers.ModelSerializer):
    file = serializers.PrimaryKeyRelatedField(
        queryset=File.objects.all(),
        help_text="ID of the File to which this conversation belongs."
    )

    messages = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        help_text="Auto‐populated list of past messages."
    )

    last_user_message = serializers.CharField(
        allow_blank=True,
        required=False,
        help_text="The latest user message; it will be appended to messages on save."
    )

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            "id",
            "file",
            "messages",
            "last_user_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "messages", "created_at", "updated_at"]

    def validate_last_user_message(self, value):
        text = value.strip()
        if not text:
            raise serializers.ValidationError("last_user_message cannot be blank or whitespace.")
        return text

    def validate(self, data):
        request = self.context.get("request")
        file_obj = data.get("file")

        
        if request and hasattr(request, "user"):
            if hasattr(file_obj, "owner") and file_obj.owner != request.user:
                raise serializers.ValidationError("You do not have permission to modify that File’s conversation.")

        
        if not data.get("last_user_message"):
            raise serializers.ValidationError("You must supply 'last_user_message'.")
        return data

    def create(self, validated_data):
        return super().create(validated_data)
