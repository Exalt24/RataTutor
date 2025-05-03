from django.contrib import admin
from django.urls import include, path
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls'))
]
