from django.contrib import admin
from .models import (
    Material,
    Attachment,
    Note,
    FlashcardSet,
    Flashcard,
    AIConversation,
    Quiz,
    QuizQuestion,
)

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'status',
        'pinned',
        'public',
        'created_at',
        'updated_at'
    )
    search_fields = ('title', 'description')
    list_filter = ('status', 'pinned', 'public', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                'title',
                'description',
                'status',
                'pinned',
                'public',
            )
        }),
        ('Timestamps', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'material', 'file', 'uploaded_at')
    search_fields = ('material__title',)
    list_filter = ('uploaded_at',)
    readonly_fields = ('uploaded_at',)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'material', 'title', 'content', 'created_at', 'updated_at')
    search_fields = ('title', 'content', 'material__title')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FlashcardSet)
class FlashcardSetAdmin(admin.ModelAdmin):
    list_display = ('id', 'material', 'title', 'description', 'created_at', 'updated_at')
    search_fields = ('title', 'description', 'material__title')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('id', 'flashcard_set', 'question', 'answer', 'created_at', 'updated_at')
    search_fields = ('question', 'answer', 'flashcard_set__title')
    list_filter = ('flashcard_set', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'material', 'last_user_message', 'created_at', 'updated_at')
    search_fields = ('user__username', 'material__title', 'last_user_message', 'context')
    list_filter = ('created_at', 'updated_at', 'user')
    readonly_fields = ('created_at', 'updated_at', 'messages', 'context')

    fieldsets = (
        (None, {
            'fields': ('user', 'material', 'last_user_message')
        }),
        ('System Info', {
            'fields': ('messages', 'context', 'created_at', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        return True

    def has_change_permission(self, request, obj=None):
        return True

    def has_delete_permission(self, request, obj=None):
        return True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'material', 'title', 'created_at', 'updated_at')
    search_fields = ('title', 'material__title')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'question_text')
    search_fields = ('question_text', 'quiz__title')
