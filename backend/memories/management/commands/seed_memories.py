"""
Popula a timeline com memorias de exemplo (com imagens geradas na hora),
so pra voce ver o site funcionando antes de subir as fotos de verdade.

    python manage.py seed_memories
    python manage.py seed_memories --clear
"""
import io
import math
import random
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from memories.imaging import process_upload
from memories.models import Annotation, Author, Memory

PALETTES = [
    ((255, 214, 224), (255, 158, 184)),
    ((255, 232, 214), (247, 176, 137)),
    ((233, 218, 255), (176, 152, 235)),
    ((214, 240, 255), (137, 195, 240)),
    ((255, 226, 236), (214, 122, 156)),
    ((252, 240, 216), (226, 186, 120)),
]

SAMPLES = [
    ("O dia em que a gente se conheceu", "Eu não sabia, mas minha vida mudou de rota aqui.", "ele"),
    ("Primeiro café juntos", "Você riu de uma piada ruim minha e eu decidi que ia insistir.", "ela"),
    ("Aquele fim de tarde", "O céu estava bonito, mas eu só conseguia olhar pra você.", "ele"),
    ("Nossa primeira viagem", "Perdemos o horário, erramos o caminho, e foi perfeito.", "nos"),
    ("A noite do filme ruim", "Ninguém prestou atenção no filme. Zero arrependimentos.", "ela"),
    ("Só nós dois", "Não tinha nada de especial no dia. Por isso foi especial.", "nos"),
]

EXTRA_NOTES = [
    "Eu lembro do cheiro desse dia.",
    "Te amo desde antes dessa foto.",
    "Quero repetir esse dia umas mil vezes.",
    "Guarda essa aqui pra sempre.",
]


def make_image(seed: int, label: str) -> io.BytesIO:
    """Gera um gradiente romântico com um coração, só pra ter algo na tela."""
    random.seed(seed)
    width, height = 900, 1100
    top, bottom = random.choice(PALETTES)
    img = Image.new("RGB", (width, height), top)
    draw = ImageDraw.Draw(img)

    for y in range(height):
        ratio = y / height
        color = tuple(int(top[i] + (bottom[i] - top[i]) * ratio) for i in range(3))
        draw.line([(0, y), (width, y)], fill=color)

    # coração
    cx, cy, scale = width / 2, height / 2, 15
    points = []
    for step in range(361):
        t = math.radians(step)
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        points.append((cx + x * scale, cy - y * scale))
    draw.polygon(points, fill=(255, 255, 255, 90), outline=(255, 255, 255))
    draw.text((40, height - 60), label[:48], fill=(90, 40, 60))

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=88)
    buffer.seek(0)
    return buffer


class Command(BaseCommand):
    help = "Cria memórias de exemplo na timeline."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear", action="store_true", help="Apaga tudo antes de criar."
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = Memory.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Removidos {deleted} registros."))

        start = date.today() - timedelta(days=len(SAMPLES) * 47)
        created = 0

        for index, (title, note, author) in enumerate(SAMPLES):
            happened_on = start + timedelta(days=index * 47)
            if Memory.objects.filter(title=title).exists():
                continue

            memory = Memory(
                title=title,
                note=note,
                happened_on=happened_on,
                author=author,
                location=random.choice(["", "Em algum lugar bom", "Aqui pertinho"]),
                is_favorite=index in (0, 3),
            )
            memory.apply_image(process_upload(make_image(index, title)))
            memory.save()
            created += 1

            if index % 2 == 0:
                Annotation.objects.create(
                    memory=memory,
                    author=Author.HER if author == "ele" else Author.HIM,
                    text=random.choice(EXTRA_NOTES),
                )

        self.stdout.write(
            self.style.SUCCESS(f"Pronto! {created} memórias de exemplo criadas. 💗")
        )
