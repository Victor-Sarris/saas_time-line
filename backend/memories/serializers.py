from django.conf import settings
from django.urls import reverse
from rest_framework import serializers

from .imaging import process_upload
from .models import Annotation, Memory, MemoryImage


class AnnotationSerializer(serializers.ModelSerializer):
    author_display = serializers.CharField(source="get_author_display", read_only=True)

    class Meta:
        model = Annotation
        fields = ["id", "memory", "author", "author_display", "text", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"memory": {"required": False}}

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Escreve alguma coisa, vai. 💌")
        return value

class MemoryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    thumb_url = serializers.SerializerMethodField()

    class Meta:
        model = MemoryImage
        fields = ['id', 'image_url', 'thumb_url']

    def _absolute(self, view_name, obj):
        path = reverse(view_name, args=[obj.pk])
        request = self.context.get("request")
        url = f"{path}?v={obj.image_hash[:12]}" if obj.image_hash else path
        return request.build_absolute_uri(url) if request else url

    def get_image_url(self, obj):
        return self._absolute("gallery-image", obj)

    def get_thumb_url(self, obj):
        return self._absolute("gallery-thumb", obj)

class MemorySerializer(serializers.ModelSerializer):
    # entra o arquivo cru, sai a URL de quem serve os bytes do banco
    image = serializers.ImageField(write_only=True)
    image_url = serializers.SerializerMethodField()
    thumb_url = serializers.SerializerMethodField()
    aspect_ratio = serializers.FloatField(read_only=True)
    author_display = serializers.CharField(source="get_author_display", read_only=True)
    annotations = AnnotationSerializer(many=True, read_only=True)
    gallery = MemoryImageSerializer(many=True, read_only=True)

    class Meta:
        model = Memory
        fields = '__all__'
        read_only_fields = [
            "id",
            "created_at",
            "image_width",
            "image_height",
        ]

    def _absolute(self, view_name, obj):
        path = reverse(view_name, args=[obj.pk])
        request = self.context.get("request")
        url = f"{path}?v={obj.image_hash[:12]}" if obj.image_hash else path
        return request.build_absolute_uri(url) if request else url

    def get_image_url(self, obj):
        return self._absolute("memory-image", obj)

    def get_thumb_url(self, obj):
        return self._absolute("memory-thumb", obj)

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Dá um nome pra esse momento. ✨")
        return value

    def validate_image(self, image):
        limit = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if image.size > limit:
            raise serializers.ValidationError(
                f"Imagem muito pesada (máx. {settings.MAX_UPLOAD_SIZE_MB}MB)."
            )
        return image

    def _pop_processed_image(self, validated_data):
        upload = validated_data.pop("image", None)
        if upload is None:
            return None
        try:
            return process_upload(upload)
        except ValueError as exc:
            raise serializers.ValidationError({"image": str(exc)}) from exc

    def create(self, validated_data):
        processed = self._pop_processed_image(validated_data)
        memory = Memory(**validated_data)
        memory.apply_image(processed)
        memory.save()
        return memory

    def update(self, instance, validated_data):
        processed = self._pop_processed_image(validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        if processed:
            instance.apply_image(processed)
        instance.save()
        return instance

    is_locked = serializers.SerializerMethodField()

    def get_is_locked(self, obj):
        return obj.is_locked

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.is_locked:
            # Usa os nomes corretos devolvidos pela sua API
            data['note'] = "Esta é uma Cápsula do Tempo! O conteúdo está guardado a sete chaves."
            data['image_url'] = None
            data['thumb_url'] = None
            data['gallery'] = []
        return data


class MemoryUpdateSerializer(MemorySerializer):
    """Na edição a foto é opcional — dá pra só mexer no texto."""

    image = serializers.ImageField(write_only=True, required=False)
