from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnnotationViewSet,
    MemoryViewSet,
    memory_image,
    memory_thumb,
    gallery_image,
    gallery_thumb,
    send_reminders,
    site_config,
)

router = DefaultRouter()
router.register("memories", MemoryViewSet, basename="memory")
router.register("annotations", AnnotationViewSet, basename="annotation")

urlpatterns = [
    path("site-config/", site_config, name="site-config"),

    # Fotos principais
    path("memories/<int:pk>/image/", memory_image, name="memory-image"),
    path("memories/<int:pk>/thumb/", memory_thumb, name="memory-thumb"),

    # Fotos da galeria
    path("gallery/<int:pk>/image/", gallery_image, name="gallery-image"),
    path("gallery/<int:pk>/thumb/", gallery_thumb, name="gallery-thumb"),

    path("cron/send-reminders/", send_reminders, name="send-reminders"),
    path("", include(router.urls)),
]
