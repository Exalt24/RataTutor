from rest_framework import serializers
from .models import File, Note, Flashcard, AIConversation

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'file', 'content']

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'file', 'question', 'answer']

class FileSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    flashcards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = File
        fields = ['id', 'title','status','notes', 'flashcards', 'created_at', 'updated_at']

class AIConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIConversation
        fields = ['id', 'file', 'messages', 'last_user_message', 'created_at', 'updated_at']