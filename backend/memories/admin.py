from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .imaging import process_upload
from .models import Annotation, Memory


class MemoryAdminForm(forms.ModelForm):
    """A foto não é um campo do model — entra por aqui e vira bytes."""

    nova_foto = forms.ImageField(
        required=False,
        label="foto",
        help_text="Deixe vazio para manter a foto atual.",
    )

    class Meta:
        model = Memory
        fields = [
            "title",
            "note",
            "happened_on",
            "location",
            "author",
            "is_favorite",
        ]

    def clean_nova_foto(self):
        upload = self.cleaned_data.get("nova_foto")
        if not upload and not self.instance.pk:
            raise forms.ValidationError("Escolha uma foto para essa memória.")
        return upload

    def save(self, commit=True):
        memory = super().save(commit=False)
        upload = self.cleaned_data.get("nova_foto")
        if upload:
            memory.apply_image(process_upload(upload))
        if commit:
            memory.save()
        return memory


class AnnotationInline(admin.TabularInline):
    model = Annotation
    extra = 1


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    form = MemoryAdminForm
    inlines = [AnnotationInline]

    list_display = ("thumb", "title", "happened_on", "author", "is_favorite", "peso")
    list_display_links = ("thumb", "title")
    list_filter = ("author", "is_favorite", "happened_on")
    search_fields = ("title", "note", "location")
    date_hierarchy = "happened_on"

    readonly_fields = ("preview", "dimensoes", "peso")
    fields = (
        "preview",
        "nova_foto",
        "title",
        "note",
        "happened_on",
        "location",
        "author",
        "is_favorite",
        "dimensoes",
        "peso",
    )

    def get_queryset(self, request):
        # os blobs são pesados: fora da listagem
        return super().get_queryset(request).defer("image_data", "thumb_data")

    @admin.display(description="foto")
    def thumb(self, obj):
        if not obj.pk or not obj.image_hash:
            return "—"
        return format_html(
            '<img src="{}?v={}" style="height:52px;width:52px;object-fit:cover;'
            'border-radius:8px;" />',
            reverse("memory-thumb", args=[obj.pk]),
            obj.image_hash[:12],
        )

    @admin.display(description="pré-visualização")
    def preview(self, obj):
        if not obj.pk or not obj.image_hash:
            return "Sem imagem ainda."
        return format_html(
            '<img src="{}?v={}" style="max-height:320px;border-radius:12px;" />',
            reverse("memory-image", args=[obj.pk]),
            obj.image_hash[:12],
        )

    @admin.display(description="dimensões")
    def dimensoes(self, obj):
        if not obj.image_width:
            return "—"
        return f"{obj.image_width} × {obj.image_height} px"

    @admin.display(description="peso")
    def peso(self, obj):
        if not obj.image_bytes:
            return "—"
        return f"{obj.image_bytes / 1024:.0f} KB"


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ("memory", "author", "text", "created_at")
    list_filter = ("author",)
    search_fields = ("text",)
