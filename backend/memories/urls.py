from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnnotationViewSet,
    MemoryViewSet,
    memory_image,
    memory_thumb,
    site_config,
)

router = DefaultRouter()
router.register("memories", MemoryViewSet, basename="memory")
router.register("annotations", AnnotationViewSet, basename="annotation")

urlpatterns = [
    path("site-config/", site_config, name="site-config"),
    # as fotos saem do banco por aqui (fora do DRF, é resposta binária pura)
    path("memories/<int:pk>/image/", memory_image, name="memory-image"),
    path("memories/<int:pk>/thumb/", memory_thumb, name="memory-thumb"),
    path("", include(router.urls)),
]
