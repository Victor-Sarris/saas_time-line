"""
Processamento das fotos antes de irem para o banco.

Tudo vira WEBP: uma versão grande (pra abrir a foto) e uma miniatura
(pros cards da timeline). Assim o banco não explode e o site abre rápido
no dia que importa.
"""
import hashlib
import io

from PIL import Image, ImageOps

FULL_MAX_SIDE = 1600
THUMB_MAX_SIDE = 640
FULL_QUALITY = 82
THUMB_QUALITY = 70
MIME = "image/webp"


def _fit(image: Image.Image, max_side: int) -> Image.Image:
    """Reduz mantendo a proporção. Nunca aumenta uma foto pequena."""
    copy = image.copy()
    copy.thumbnail((max_side, max_side), Image.LANCZOS)
    return copy


def _to_webp(image: Image.Image, quality: int) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="WEBP", quality=quality, method=5)
    return buffer.getvalue()


def process_upload(uploaded_file):
    """
    Recebe o arquivo do formulário e devolve tudo pronto pro model.

    Levanta ValueError se o arquivo não for uma imagem legível.
    """
    try:
        uploaded_file.seek(0)
        image = Image.open(uploaded_file)
        image.load()
    except Exception as exc:  # arquivo corrompido, formato exótico, etc.
        raise ValueError("Não consegui ler essa imagem.") from exc

    # respeita a rotação gravada pela câmera do celular
    image = ImageOps.exif_transpose(image)

    if image.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", image.size, (255, 255, 255))
        converted = image.convert("RGBA")
        background.paste(converted, mask=converted.split()[-1])
        image = background
    else:
        image = image.convert("RGB")

    full = _fit(image, FULL_MAX_SIDE)
    thumb = _fit(image, THUMB_MAX_SIDE)

    full_bytes = _to_webp(full, FULL_QUALITY)
    thumb_bytes = _to_webp(thumb, THUMB_QUALITY)

    return {
        "image_data": full_bytes,
        "thumb_data": thumb_bytes,
        "image_mime": MIME,
        "image_width": full.width,
        "image_height": full.height,
        "image_bytes": len(full_bytes),
        "image_hash": hashlib.sha256(full_bytes).hexdigest(),
    }
