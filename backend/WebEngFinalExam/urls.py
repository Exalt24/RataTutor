from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
]

urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(
        template_name='static/index.html'
    ), name='spa'),
]
