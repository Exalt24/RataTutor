# backend/accounts/admin.py

from django.contrib import admin
from .models import File, Note, Flashcard, AIConversation

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'status', 'created_at', 'updated_at')
    
    search_fields = ('title', 'description')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'status')
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'content')
    search_fields = ('content',)


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'question', 'answer')
    search_fields = ('question', 'answer')


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'file', 'last_user_message', 'created_at', 'updated_at')
    search_fields = ('file__title', 'last_user_message')
    list_filter = ('created_at', 'updated_at')
