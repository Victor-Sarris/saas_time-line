from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("memories.urls")),
]

# As fotos não são arquivos estáticos: saem do banco por /api/memories/<id>/image/.
