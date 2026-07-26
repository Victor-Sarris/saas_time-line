"""
Move as fotos do disco para dentro do banco.

Antes: ImageField apontando pra backend/media/.
Depois: os bytes (WEBP comprimido + miniatura) moram na própria tabela,
que é o que permite hospedar em servidor com disco efêmero.

As memórias que já existiam são convertidas automaticamente. Os arquivos
originais NÃO são apagados — dê uma conferida no site e só então apague
a pasta backend/media/ na mão.
"""
from pathlib import Path

from django.conf import settings
from django.db import migrations, models

from memories.imaging import process_upload


def _media_root() -> Path:
    # settings.MEDIA_ROOT foi removido; o padrão do Django é "" (vazio),
    # então caímos na pasta antiga: backend/media/
    return Path(settings.MEDIA_ROOT or Path(settings.BASE_DIR) / "media")


def fotos_para_o_banco(apps, schema_editor):
    Memory = apps.get_model("memories", "Memory")
    root = _media_root()
    convertidas, perdidas = 0, []

    for memory in Memory.objects.all().iterator():
        nome = getattr(memory, "image", "") or ""
        caminho = root / str(nome)
        if not nome or not caminho.exists():
            perdidas.append(f"#{memory.pk} {memory.title}")
            continue

        with caminho.open("rb") as arquivo:
            processed = process_upload(arquivo)

        for campo, valor in processed.items():
            setattr(memory, campo, valor)
        memory.save(update_fields=list(processed))
        convertidas += 1

    if convertidas:
        print(f"\n  → {convertidas} foto(s) movida(s) para dentro do banco.")
    if perdidas:
        print("  → sem arquivo no disco (ficaram sem imagem): " + ", ".join(perdidas))


def voltar(apps, schema_editor):
    """Não dá pra desfazer: os arquivos originais continuam no disco."""


class Migration(migrations.Migration):
    dependencies = [("memories", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="memory",
            name="image_data",
            field=models.BinaryField(
                default=b"", editable=False, verbose_name="foto (bytes)"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="memory",
            name="thumb_data",
            field=models.BinaryField(
                default=b"", editable=False, verbose_name="miniatura (bytes)"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="memory",
            name="image_mime",
            field=models.CharField(default="image/webp", max_length=40),
        ),
        migrations.AddField(
            model_name="memory",
            name="image_width",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="memory",
            name="image_height",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="memory",
            name="image_bytes",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="memory",
            name="image_hash",
            field=models.CharField(blank=True, db_index=True, max_length=64),
        ),
        migrations.RunPython(fotos_para_o_banco, voltar),
        migrations.RemoveField(model_name="memory", name="image"),
    ]
