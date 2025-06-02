from django.http import HttpResponseRedirect
from django.conf import settings
from django.views.decorators.cache import never_cache

@never_cache
def redirect_to_frontend(request):
    return HttpResponseRedirect(settings.FRONTEND_URL)

@never_cache  
def smart_redirect(request):
    if (request.user.is_authenticated and 
        (request.user.is_staff or request.user.is_superuser)):
        return HttpResponseRedirect('/admin/')
    
    return HttpResponseRedirect(settings.FRONTEND_URL)