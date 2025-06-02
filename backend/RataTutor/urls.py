from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',  include('api.urls')),
    path('auth/', include('accounts.urls')),
]

# Only catch non-Django routes
urlpatterns += [
    re_path(
        r'^(?!admin|api|auth|static|media).*/$',  # Note the trailing slash
        TemplateView.as_view(template_name='index.html'),
        name='spa-fallback'
    ),
]