from django.core.validators import MinLengthValidator
from rest_framework import serializers

from api.models import (
    Material,
    Attachment,
    Note,
    FlashcardSet,
    Flashcard,
    AIConversation,
    Quiz,
    QuizQuestion,
)

def validate_file_extension(value):
    import os
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.docx', '.pptx', '.txt', '.pdf']
    if not ext.lower() in valid_extensions:
        raise serializers.ValidationError('Unsupported file extension.')


class AttachmentSerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        help_text="ID of the Material to which this file belongs.",
    )
    file = serializers.FileField(validators=[validate_file_extension])

    class Meta:
        model = Attachment
        fields = ["id", "material", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]

    def validate(self, data):
        request = self.context.get("request")
        material = data.get("material")
        if request and hasattr(request, "user") and material:
            if material.owner != request.user:
                raise serializers.ValidationError("You don't have permission to add attachments to this material.")
        return data


class NoteSerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        required=False,
        help_text="ID of an existing Material to which this note belongs.",
    )
    title = serializers.CharField(
        max_length=255,
        validators=[MinLengthValidator(1, message="Note title cannot be empty.")],
        help_text="A short title for this note. Must be at least 1 character.",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="(Optional) Longer explanation or details for this note."
    )
    content = serializers.CharField(
        validators=[MinLengthValidator(1, message="Note content cannot be empty.")],
        help_text="The main text content of the note. Must be at least 1 character.",
    )
    public = serializers.BooleanField(
        default=False,
        help_text="Whether this note is shared publicly."
    )

    class Meta:
        model = Note
        fields = ["id", "material", "title", "description", "content", "public", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def _generate_unique_title(self, base_title, material, exclude_instance=None):
        """Generate a unique title by adding a suffix if needed."""
        title = base_title
        counter = 1
        
        while True:
            qs = Note.objects.filter(material=material, title=title)
            if exclude_instance:
                qs = qs.exclude(pk=exclude_instance.pk)
            
            if not qs.exists():
                return title
            
            counter += 1
            title = f"{base_title} ({counter})"

    def validate_title(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Note title cannot be blank or whitespace.")
        return clean

    def validate_description(self, value):
        return value.strip()

    def validate_content(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Note content cannot be just whitespace.")
        return clean

    def validate(self, data):
        request = self.context.get("request")
        mat = data.get("material")
        if request and hasattr(request, "user"):
            if hasattr(mat, "owner") and mat.owner != request.user:
                raise serializers.ValidationError("You do not have permission to add notes to this Material.")
        return data

    def create(self, validated_data):
        material = validated_data['material']
        base_title = validated_data['title']
        
        # Generate unique title
        unique_title = self._generate_unique_title(base_title, material)
        validated_data['title'] = unique_title
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'title' in validated_data:
            material = validated_data.get('material', instance.material)
            base_title = validated_data['title']
            
            # Generate unique title (excluding current instance)
            unique_title = self._generate_unique_title(base_title, material, exclude_instance=instance)
            validated_data['title'] = unique_title
        
        return super().update(instance, validated_data)


class FlashcardSerializer(serializers.ModelSerializer):
    flashcard_set = serializers.PrimaryKeyRelatedField(
        queryset=FlashcardSet.objects.all(),
        required=False,
        help_text="ID of the flashcard set this card belongs to."
    )
    question = serializers.CharField(
        validators=[MinLengthValidator(1, message="Flashcard question cannot be empty.")],
        help_text="The question text for this flashcard."
    )
    answer = serializers.CharField(
        validators=[MinLengthValidator(1, message="Flashcard answer cannot be empty.")],
        help_text="The answer text for this flashcard."
    )

    class Meta:
        model = Flashcard
        fields = ["id", "flashcard_set", "question", "answer", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_question(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Flashcard question cannot be just whitespace.")
        return clean

    def validate_answer(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Flashcard answer cannot be just whitespace.")
        return clean

    def validate(self, data):
        q = data.get("question", "").strip()
        a = data.get("answer", "").strip()
        if q == a:
            raise serializers.ValidationError("Flashcard question and answer cannot be identical.")

        request = self.context.get("request")
        flashcard_set = data.get("flashcard_set")
        if request and hasattr(request, "user") and flashcard_set:
            mat = flashcard_set.material
            if hasattr(mat, "owner") and mat.owner != request.user:
                raise serializers.ValidationError("You do not have permission to add flashcards to this Flashcard Set.")
        return data


class FlashcardSetSerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        required=False,
        help_text="ID of the Material this flashcard set belongs to."
    )
    title = serializers.CharField(
        max_length=255,
        validators=[MinLengthValidator(1, message="Flashcard set title cannot be empty.")],
        help_text="Title of the flashcard set."
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="(Optional) Description or notes about this flashcard set."
    )
    public = serializers.BooleanField(
        default=False,
        help_text="Whether this flashcard set is shared publicly."
    )
    # Make flashcards writable and required, using 'cards' as the model field name
    flashcards = FlashcardSerializer(
        many=True, 
        required=True, 
        source='cards',
        help_text="List of flashcards for this set. At least one flashcard is required."
    )

    class Meta:
        model = FlashcardSet
        fields = ["id", "material", "title", "description", "public", "flashcards", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def _generate_unique_title(self, base_title, material, exclude_instance=None):
        """Generate a unique title by adding a suffix if needed."""
        title = base_title
        counter = 1
        
        while True:
            qs = FlashcardSet.objects.filter(material=material, title=title)
            if exclude_instance:
                qs = qs.exclude(pk=exclude_instance.pk)
            
            if not qs.exists():
                return title
            
            counter += 1
            title = f"{base_title} ({counter})"

    def validate_title(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Flashcard set title cannot be blank or whitespace.")
        return clean

    def validate_description(self, value):
        return value.strip()

    def validate_flashcards(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("A flashcard set must have at least one flashcard.")
        return value

    def validate(self, data):
        request = self.context.get("request")
        mat = data.get("material")
        if request and hasattr(request, "user"):
            if hasattr(mat, "owner") and mat.owner != request.user:
                raise serializers.ValidationError("You do not have permission to create flashcard sets for this Material.")
        return data

    def create(self, validated_data):
        flashcards_data = validated_data.pop('cards')
        material = validated_data['material']
        base_title = validated_data['title']
        
        # Generate unique title
        unique_title = self._generate_unique_title(base_title, material)
        validated_data['title'] = unique_title
        
        flashcard_set = FlashcardSet.objects.create(**validated_data)
        
        for flashcard_data in flashcards_data:
            # Remove flashcard_set from flashcard_data if it exists (it shouldn't, but just in case)
            flashcard_data.pop('flashcard_set', None)
            Flashcard.objects.create(flashcard_set=flashcard_set, **flashcard_data)
        
        return flashcard_set

    def update(self, instance, validated_data):
        # Handle flashcards if they're provided in the update
        flashcards_data = validated_data.pop('cards', None)
        
        if 'title' in validated_data:
            material = validated_data.get('material', instance.material)
            base_title = validated_data['title']
            
            # Generate unique title (excluding current instance)
            unique_title = self._generate_unique_title(base_title, material, exclude_instance=instance)
            validated_data['title'] = unique_title
        
        # Update the flashcard set fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If flashcards data is provided, replace all existing flashcards
        if flashcards_data is not None:
            # Delete existing flashcards
            instance.cards.all().delete()
            
            # Create new flashcards
            for flashcard_data in flashcards_data:
                flashcard_data.pop('flashcard_set', None)
                Flashcard.objects.create(flashcard_set=instance, **flashcard_data)
        
        return instance


class AIConversationSerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        required=False,
        help_text="ID of the Material to which this conversation belongs.",
    )

    messages = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        help_text="Auto‐populated list of past messages (role, content, timestamp).",
    )

    last_user_message = serializers.CharField(
        allow_blank=True,
        required=False,
        help_text="The latest user message; it will be appended to messages on save.",
    )

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = AIConversation
        fields = [
            "id",
            "material",
            "messages",
            "last_user_message",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "messages", "created_at", "updated_at"]

    def validate_last_user_message(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("last_user_message cannot be blank or whitespace.")
        return clean

    def validate(self, data):
        request = self.context.get("request")
        mat = data.get("material")
        if request and hasattr(request, "user"):
            if hasattr(mat, "owner") and mat.owner != request.user:
                raise serializers.ValidationError("You do not have permission to modify this Material's conversation.")
        if not data.get("last_user_message"):
            raise serializers.ValidationError("You must supply 'last_user_message'.")
        return data


class QuizQuestionSerializer(serializers.ModelSerializer):
    quiz = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all(),
        required=False,  # Make optional for nested creation
        help_text="ID of the Quiz to which this question belongs.",
    )
    question_text = serializers.CharField(
        validators=[MinLengthValidator(1, message="Question text cannot be empty.")],
        help_text="The text for the quiz question.",
    )
    choices = serializers.ListField(
        child=serializers.CharField(),
        help_text="A non‐empty list of multiple‐choice options (at least two).",
    )
    correct_answer = serializers.CharField(
        validators=[MinLengthValidator(1, message="Correct answer cannot be empty.")],
        help_text="The correct answer; must match one of the choices exactly.",
    )

    class Meta:
        model = QuizQuestion
        fields = ["id", "quiz", "question_text", "choices", "correct_answer"]
        read_only_fields = ["id"]

    def validate_question_text(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Question text cannot be blank or just whitespace.")
        return clean

    def validate_choices(self, value):
        if not isinstance(value, list) or len(value) < 2:
            raise serializers.ValidationError("You must provide at least two choices.")
        cleaned = []
        for idx, item in enumerate(value):
            if not isinstance(item, str):
                raise serializers.ValidationError(f"Choice at index {idx} must be a string.")
            text = item.strip()
            if not text:
                raise serializers.ValidationError(f"Choice at index {idx} cannot be blank or whitespace.")
            cleaned.append(text)
        return cleaned

    def validate_correct_answer(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Correct answer cannot be blank or just whitespace.")
        return clean

    def validate(self, data):
        choices = data.get("choices", [])
        correct = data.get("correct_answer", "").strip()

        if correct not in choices:
            raise serializers.ValidationError("Correct answer must match exactly one of the provided choices.")

        # Only validate permissions if quiz is provided (not in nested creation)
        quiz_obj = data.get("quiz")
        if quiz_obj:
            request = self.context.get("request")
            if request and hasattr(request, "user"):
                mat = quiz_obj.material
                if hasattr(mat, "owner") and mat.owner != request.user:
                    raise serializers.ValidationError("You do not have permission to add questions to this Quiz.")
        return data


class QuizSerializer(serializers.ModelSerializer):
    material = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(),
        required=False,
        help_text="ID of the Material to which this quiz belongs.",
    )
    title = serializers.CharField(
        max_length=255,
        validators=[MinLengthValidator(1, message="Quiz title cannot be empty.")],
        help_text="A title for this Quiz.",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="(Optional) Additional instructions or description for this quiz."
    )
    public = serializers.BooleanField(
        default=False,
        help_text="Whether this quiz is shared publicly."
    )
    # Make questions writable and required
    questions = QuizQuestionSerializer(
        many=True, 
        required=True,
        help_text="List of questions for this quiz. At least one question is required."
    )

    class Meta:
        model = Quiz
        fields = ["id", "material", "title", "description", "public", "questions", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def _generate_unique_title(self, base_title, material, exclude_instance=None):
        """Generate a unique title by adding a suffix if needed."""
        title = base_title
        counter = 1
        
        while True:
            qs = Quiz.objects.filter(material=material, title=title)
            if exclude_instance:
                qs = qs.exclude(pk=exclude_instance.pk)
            
            if not qs.exists():
                return title
            
            counter += 1
            title = f"{base_title} ({counter})"

    def validate_title(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Quiz title cannot be blank or just whitespace.")
        return clean

    def validate_description(self, value):
        return value.strip()

    def validate_questions(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("A quiz must have at least one question.")
        return value

    def validate(self, data):
        request = self.context.get("request")
        mat = data.get("material")
        if request and hasattr(request, "user"):
            if hasattr(mat, "owner") and mat.owner != request.user:
                raise serializers.ValidationError("You do not have permission to create a quiz for this Material.")
        return data

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        material = validated_data['material']
        base_title = validated_data['title']
        
        # Generate unique title
        unique_title = self._generate_unique_title(base_title, material)
        validated_data['title'] = unique_title
        
        quiz = Quiz.objects.create(**validated_data)
        
        for question_data in questions_data:
            # Remove quiz from question_data if it exists (it shouldn't, but just in case)
            question_data.pop('quiz', None)
            QuizQuestion.objects.create(quiz=quiz, **question_data)
        
        return quiz

    def update(self, instance, validated_data):
        # Handle questions if they're provided in the update
        questions_data = validated_data.pop('questions', None)
        
        if 'title' in validated_data:
            material = validated_data.get('material', instance.material)
            base_title = validated_data['title']
            
            # Generate unique title (excluding current instance)
            unique_title = self._generate_unique_title(base_title, material, exclude_instance=instance)
            validated_data['title'] = unique_title
        
        # Update the quiz fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # If questions data is provided, replace all existing questions
        if questions_data is not None:
            # Delete existing questions
            instance.questions.all().delete()
            
            # Create new questions
            for question_data in questions_data:
                question_data.pop('quiz', None)
                QuizQuestion.objects.create(quiz=instance, **question_data)
        
        return instance


class MaterialSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        max_length=255,
        validators=[MinLengthValidator(1, message="Title cannot be blank or whitespace.")],
        help_text="A title for this Material.",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=5000,
        help_text="(Optional) A short description of this material.",
    )
    status = serializers.ChoiceField(
        choices=Material.STATUS_CHOICES,
        default="active",
        help_text="Must be one of: 'active' or 'trash'.",
    )
    pinned = serializers.BooleanField(
        default=False,
        help_text="Whether this Material is pinned (e.g. shown at top)."
    )
    public = serializers.BooleanField(
        default=False,
        help_text="Whether this Material is shared publicly."
    )
    
    # Add owner as read-only field
    owner = serializers.StringRelatedField(read_only=True)
    
    # Related objects (read-only)
    attachments = AttachmentSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    flashcard_sets = FlashcardSetSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta:
        model = Material
        fields = [
            "id",
            "owner",  # Add owner field
            "title",
            "description",
            "status",
            "pinned",
            "public",
            "attachments",
            "notes",
            "flashcard_sets",
            "quizzes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]

    def validate_title(self, value):
        clean = value.strip()
        if not clean:
            raise serializers.ValidationError("Title cannot be blank or just whitespace.")

        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            user = request.user
            qs = Material.objects.filter(owner=user, title__iexact=clean)
            # Exclude the current instance to allow updates without false conflict
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("You already have a Material with this title.")
        return clean

    def validate_description(self, value):
        if value:
            return value.strip()
        return value

    def validate(self, data):
        request = self.context.get("request")

        # Check if marking as trash requires description
        if data.get("status") == "trash" and not data.get("description", "").strip():
            raise serializers.ValidationError({
                "description": "You must provide a description when marking a material as 'trash'."
            })

        return data