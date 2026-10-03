from datetime import date, datetime

from django.conf import settings
from django.db.models import Count, Sum
from django.http import Http404, HttpResponse, HttpResponseNotModified
from django.views.decorators.http import require_GET
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Annotation, Memory, MemoryImage
from .serializers import (
    AnnotationSerializer,
    MemorySerializer,
    MemoryUpdateSerializer,
)

# Os blobs são pesados: nunca traga eles junto da listagem.
LIST_DEFER = ("image_data", "thumb_data")


class MemoryViewSet(viewsets.ModelViewSet):
    """CRUD da linha do tempo. Aceita multipart (upload) e JSON."""

    serializer_class = MemorySerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = (
            Memory.objects.defer(*LIST_DEFER)
            .prefetch_related("annotations")
            .all()
        )
        params = self.request.query_params

        if params.get("favorites") in {"1", "true", "True"}:
            qs = qs.filter(is_favorite=True)

        author = params.get("author")
        if author:
            qs = qs.filter(author=author)

        search = params.get("search")
        if search:
            qs = qs.filter(title__icontains=search)

        if params.get("order") == "desc":
            qs = qs.order_by("-happened_on", "-created_at")

        return qs

    def get_serializer_class(self):
        if self.action in {"update", "partial_update"}:
            return MemoryUpdateSerializer
        return MemorySerializer

    @action(detail=True, methods=["post"], url_path="annotations")
    def add_annotation(self, request, pk=None):
        memory = self.get_object()
        serializer = AnnotationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(memory=memory)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="favorite")
    def toggle_favorite(self, request, pk=None):
        memory = self.get_object()
        memory.is_favorite = not memory.is_favorite
        memory.save(update_fields=["is_favorite", "updated_at"])
        return Response(self.get_serializer(memory).data)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        qs = Memory.objects.all()
        first = qs.order_by("happened_on").first()
        last = qs.order_by("-happened_on").first()
        stored = qs.aggregate(total=Sum("image_bytes"))["total"] or 0
        by_author = {
            row["author"]: row["total"]
            for row in qs.values("author").annotate(total=Count("id"))
        }
        return Response(
            {
                "total_memories": qs.count(),
                "total_annotations": Annotation.objects.count(),
                "first_memory_on": first.happened_on if first else None,
                "last_memory_on": last.happened_on if last else None,
                "favorites": qs.filter(is_favorite=True).count(),
                "by_author": by_author,
                "stored_image_mb": round(stored / (1024 * 1024), 2),
            }
        )

    def perform_create(self, serializer):
        memory = serializer.save()
        gallery_files = self.request.FILES.getlist('gallery')

        from .imaging import process_upload
        for file in gallery_files:
            try:
                processed = process_upload(file)
                MemoryImage.objects.create(
                    memory=memory,
                    image_data=processed["image_data"],
                    thumb_data=processed["thumb_data"],
                    image_mime=processed["image_mime"],
                    image_hash=processed["image_hash"]
                )
            except ValueError:
                continue  # Ignora arquivos inválidos

class AnnotationViewSet(viewsets.ModelViewSet):
    queryset = Annotation.objects.select_related("memory").all()
    serializer_class = AnnotationSerializer


# ---------------------------------------------------------------------------
# Servindo as fotos que estão dentro do banco
# ---------------------------------------------------------------------------
def _serve_blob(request, pk, field):
    row = (
        Memory.objects.filter(pk=pk)
        .values(field, "image_mime", "image_hash")
        .first()
    )
    if row is None:
        raise Http404("Essa memória não existe.")

    data = bytes(row[field] or b"")
    if not data:
        raise Http404("Essa memória está sem imagem.")

    etag = f'"{row["image_hash"]}-{field}"'
    if request.headers.get("If-None-Match") == etag:
        return HttpResponseNotModified()

    response = HttpResponse(data, content_type=row["image_mime"] or "image/webp")
    response["ETag"] = etag
    response["Content-Length"] = str(len(data))
    # a URL carrega ?v=<hash>, então o conteúdo daquele endereço nunca muda
    response["Cache-Control"] = (
        "public, max-age=31536000, immutable"
        if request.GET.get("v")
        else "public, max-age=300"
    )
    return response


@require_GET
def memory_image(request, pk):
    return _serve_blob(request, pk, "image_data")


@require_GET
def memory_thumb(request, pk):
    return _serve_blob(request, pk, "thumb_data")


# ---------------------------------------------------------------------------
@api_view(["GET"])
def site_config(request):
    """Nomes, datas e playlist — o front lê tudo daqui, sem hardcode."""
    config = dict(settings.LOVE_CONFIG)

    since = (config.get("couple_since") or "").strip()
    start = _parse_moment(since)
    if start is None:
        since = ""
    config["couple_since"] = since
    # negativo = a data ainda não chegou (o front esconde o contador até lá)
    config["days_together"] = (date.today() - start.date()).days if start else None

    playlist_url = config.get("spotify_playlist_url", "")
    config["spotify_embed_url"] = _to_spotify_embed(playlist_url)
    return Response(config)


def _parse_moment(value: str):
    """Aceita '2026-08-04' ou '2026-08-04T20:30' (a hora exata do pedido)."""
    if not value:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def _to_spotify_embed(url: str) -> str:
    """https://open.spotify.com/playlist/ID -> https://open.spotify.com/embed/playlist/ID"""
    if not url:
        return ""
    clean = url.split("?")[0].rstrip("/")
    if "/embed/" in clean:
        return clean
    for kind in ("playlist", "album", "track", "artist", "episode", "show"):
        marker = f"/{kind}/"
        if marker in clean:
            item_id = clean.split(marker)[-1]
            return f"https://open.spotify.com/embed/{kind}/{item_id}"
    return clean


def _serve_gallery_blob(request, pk, field):
    row = (
        MemoryImage.objects.filter(pk=pk)
        .values(field, "image_mime", "image_hash")
        .first()
    )
    if row is None:
        raise Http404("Essa foto da galeria não existe.")

    data = bytes(row[field] or b"")
    if not data:
        raise Http404("Essa foto da galeria está vazia.")

    etag = f'"{row["image_hash"]}-{field}"'
    if request.headers.get("If-None-Match") == etag:
        return HttpResponseNotModified()

    response = HttpResponse(data, content_type=row["image_mime"] or "image/webp")
    response["ETag"] = etag
    response["Content-Length"] = str(len(data))
    response["Cache-Control"] = (
        "public, max-age=31536000, immutable"
        if request.GET.get("v")
        else "public, max-age=300"
    )
    return response


@require_GET
def gallery_image(request, pk):
    return _serve_gallery_blob(request, pk, "image_data")


@require_GET
def gallery_thumb(request, pk):
    return _serve_gallery_blob(request, pk, "thumb_data")