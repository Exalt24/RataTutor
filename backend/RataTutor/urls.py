from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',  include('api.urls')),
    path('auth/', include('accounts.urls')),
    # … any other server‐side routes …
]

urlpatterns += [
    re_path(
        r'^(?!api/|auth/|static/).*$',
        TemplateView.as_view(template_name='index.html'),
        name='spa-fallback'
    ),
]
