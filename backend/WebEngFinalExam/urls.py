from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import RedirectView
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
]

urlpatterns += [
    path('', RedirectView.as_view(url='/static/index.html', permanent=False)),
    re_path(r'^(?!api/).*$', RedirectView.as_view(url='/static/index.html', permanent=False)),
]
