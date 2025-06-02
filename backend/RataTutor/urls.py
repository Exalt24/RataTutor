from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.http import HttpResponseRedirect, HttpResponse
import os
import mimetypes

def custom_static_serve(request, path):
    
    file_path = os.path.join(settings.STATIC_ROOT, path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            content_type, _ = mimetypes.guess_type(file_path)
            response = HttpResponse(content, content_type=content_type or 'application/octet-stream')
            return response
        except:
            return HttpResponseRedirect(settings.FRONTEND_URL)
    else:
        return HttpResponseRedirect(settings.FRONTEND_URL)

from .utils.redirects import smart_redirect, redirect_to_frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('auth/', include('accounts.urls')),
    
    path('', smart_redirect, name='root-redirect'),
    
    re_path(r'^.*$', redirect_to_frontend, name='catch-all-redirect'),
]

if settings.DEBUG:
    urlpatterns.insert(-1, re_path(r'^static/(?P<path>.*)$', custom_static_serve, name='custom-static'))