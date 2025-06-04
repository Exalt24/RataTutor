
from django.contrib import admin
from .models import Streak, UserProfile

@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'count', 'longest_streak', 'total_days', 'last_updated')
    search_fields = ('profile__user__username',)

    def get_username(self, obj):
        return obj.profile.user.username
    get_username.short_description = 'Username'
