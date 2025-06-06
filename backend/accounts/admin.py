# accounts/admin.py

from django.contrib import admin
from .models import Streak, UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'full_name', 'get_email', 'created_at')
    search_fields = ('user__username', 'user__email', 'full_name')
    list_filter = ('user__date_joined',)
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'
    
    def created_at(self, obj):
        return obj.user.date_joined
    created_at.short_description = 'Created'

@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = (
        'get_username', 
        'count', 
        'longest_streak', 
        'total_days', 
        'last_activity_date',
        'get_status'
    )
    search_fields = ('profile__user__username',)
    list_filter = ('last_activity_date', 'count')
    readonly_fields = ('get_status', 'created_at', 'updated_at')
    
    def get_username(self, obj):
        return obj.profile.user.username
    get_username.short_description = 'Username'
    
    def get_status(self, obj):
        status = obj.get_streak_status()
        if status['is_active'] and not status['is_at_risk']:
            return "🔥 Active"
        elif status['is_at_risk']:
            return "⚠️ At Risk"
        else:
            return "💤 Inactive"
    get_status.short_description = 'Status'
    
    # Optional: Add actions to manually update streaks
    actions = ['update_all_streaks']
    
    def update_all_streaks(self, request, queryset):
        updated_count = 0
        for streak in queryset:
            old_count = streak.count
            streak.record_activity()  # This will update based on current logic
            if streak.count != old_count:
                updated_count += 1
        
        self.message_user(
            request, 
            f"Updated {updated_count} streaks out of {queryset.count()} selected."
        )
    update_all_streaks.short_description = "Update selected streaks"