from django.db import models
from django.utils import timezone


class Author(models.TextChoices):
    HIM = "ele", "Ele"
    HER = "ela", "Ela"
    US = "nos", "Nós dois"


class Memory(models.Model):
    """
    Um momento da linha do tempo: a foto + a anotação de quem viveu.

    A foto mora dentro do banco (bytes em WEBP), não no disco. É o que
    permite hospedar em Railway/Render/Fly sem perder as imagens quando
    o container reinicia — nesses lugares o sistema de arquivos é efêmero.
    """


    title = models.CharField("título", max_length=140)
    note = models.TextField("anotação", blank=True)
    happened_on = models.DateField("aconteceu em")
    location = models.CharField("lugar", max_length=140, blank=True)
    author = models.CharField(
        "quem guardou", max_length=8, choices=Author.choices, default=Author.US
    )
    is_favorite = models.BooleanField("momento favorito", default=False)

    # --- a foto, guardada no banco ---
    image_data = models.BinaryField("foto (bytes)", editable=False)
    thumb_data = models.BinaryField("miniatura (bytes)", editable=False)
    image_mime = models.CharField(max_length=40, default="image/webp")
    image_width = models.PositiveIntegerField(default=0)
    image_height = models.PositiveIntegerField(default=0)
    image_bytes = models.PositiveIntegerField(default=0)
    image_hash = models.CharField(max_length=64, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    unlock_date = models.DateTimeField(null=True, blank=True, help_text="Se definido, a memória só poderá ser vista após esta data.")

    class Meta:
        ordering = ["happened_on", "created_at"]
        verbose_name = "memória"
        verbose_name_plural = "memórias"
        indexes = [models.Index(fields=["happened_on"])]

    def __str__(self):
        return f"{self.happened_on:%d/%m/%Y} — {self.title}"

    @property
    def aspect_ratio(self):
        if not self.image_height:
            return 1.0
        return round(self.image_width / self.image_height, 4)

    def apply_image(self, processed: dict):
        """Copia o resultado de imaging.process_upload() para o objeto."""
        for field, value in processed.items():
            setattr(self, field, value)

    @property
    def is_locked(self):
        if self.unlock_date:
            return timezone.now() < self.unlock_date
        return False


class Annotation(models.Model):
    """Recadinho extra deixado em uma foto depois que ela já está na timeline."""

    memory = models.ForeignKey(
        Memory, related_name="annotations", on_delete=models.CASCADE
    )
    author = models.CharField(
        "quem escreveu", max_length=8, choices=Author.choices, default=Author.US
    )
    text = models.TextField("recado")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        verbose_name = "anotação"
        verbose_name_plural = "anotações"

    def __str__(self):
        return f"{self.get_author_display()}: {self.text[:40]}"

class MemoryImage(models.Model):
    memory = models.ForeignKey('Memory', on_delete=models.CASCADE, related_name='gallery')
    image = models.ImageField(upload_to='memories/gallery/%Y/%m/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Foto adicional para {self.memory.title}"