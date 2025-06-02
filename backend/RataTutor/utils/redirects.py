from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.cache import never_cache

@never_cache
def redirect_to_frontend(request):
    """Catch-all for unknown routes"""
    if settings.DEBUG:
        return HttpResponseRedirect(settings.FRONTEND_URL)
    else:
        return render(request, 'index.html')

@never_cache  
def smart_redirect(request):
    if (request.user.is_authenticated and 
        (request.user.is_staff or request.user.is_superuser)):
        return HttpResponseRedirect('/admin/')
    
    if settings.DEBUG:
        return HttpResponseRedirect(settings.FRONTEND_URL)
    else:
        return render(request, 'index.html')