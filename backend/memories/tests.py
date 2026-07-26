import io
from datetime import date

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image

from .imaging import process_upload
from .models import Annotation, Memory


def fake_upload(name="foto.jpg", size=(1200, 900), fmt="JPEG", color=(255, 180, 200)):
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format=fmt)
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type=f"image/{fmt.lower()}")


def make_memory(**kwargs):
    """Cria uma memória já com a foto processada dentro do banco."""
    data = {"title": "Momento", "happened_on": date(2025, 1, 1), **kwargs}
    memory = Memory(**data)
    memory.apply_image(process_upload(fake_upload()))
    memory.save()
    return memory


class ImagingTests(TestCase):
    def test_foto_grande_e_reduzida_e_vira_webp(self):
        processed = process_upload(fake_upload(size=(4000, 3000)))
        self.assertEqual(processed["image_mime"], "image/webp")
        self.assertLessEqual(max(processed["image_width"], processed["image_height"]), 1600)
        self.assertTrue(processed["image_data"].startswith(b"RIFF"))

    def test_miniatura_e_bem_menor_que_a_foto(self):
        processed = process_upload(fake_upload(size=(2400, 1800)))
        self.assertLess(len(processed["thumb_data"]), len(processed["image_data"]))

    def test_foto_pequena_nao_e_esticada(self):
        processed = process_upload(fake_upload(size=(300, 200)))
        self.assertEqual((processed["image_width"], processed["image_height"]), (300, 200))

    def test_png_com_transparencia_e_aceito(self):
        buffer = io.BytesIO()
        Image.new("RGBA", (400, 400), (255, 0, 120, 128)).save(buffer, format="PNG")
        buffer.seek(0)
        processed = process_upload(
            SimpleUploadedFile("t.png", buffer.read(), content_type="image/png")
        )
        self.assertEqual(processed["image_mime"], "image/webp")

    def test_arquivo_que_nao_e_imagem_levanta_erro(self):
        arquivo = SimpleUploadedFile("x.jpg", b"isso nao e uma imagem", "image/jpeg")
        with self.assertRaises(ValueError):
            process_upload(arquivo)


class MemoryApiTests(TestCase):
    def test_cria_memoria_e_a_foto_vai_pro_banco(self):
        response = self.client.post(
            "/api/memories/",
            {
                "title": "Nosso primeiro dia",
                "note": "Eu não parei de sorrir.",
                "happened_on": "2025-01-10",
                "author": "ele",
                "image": fake_upload(),
            },
        )
        self.assertEqual(response.status_code, 201, response.content)
        body = response.json()

        self.assertEqual(body["author_display"], "Ele")
        self.assertIn(f"/api/memories/{body['id']}/image/", body["image_url"])
        self.assertIn(f"/api/memories/{body['id']}/thumb/", body["thumb_url"])
        self.assertGreater(body["aspect_ratio"], 0)

        memory = Memory.objects.get(pk=body["id"])
        self.assertTrue(bytes(memory.image_data))
        self.assertTrue(bytes(memory.thumb_data))
        self.assertEqual(len(memory.image_hash), 64)

    def test_titulo_vazio_e_rejeitado(self):
        response = self.client.post(
            "/api/memories/",
            {"title": "   ", "happened_on": "2025-01-10", "image": fake_upload()},
        )
        self.assertEqual(response.status_code, 400)

    def test_memoria_sem_foto_e_rejeitada(self):
        response = self.client.post(
            "/api/memories/", {"title": "Sem foto", "happened_on": "2025-01-10"}
        )
        self.assertEqual(response.status_code, 400)

    def test_listagem_nao_carrega_os_blobs(self):
        make_memory()
        with self.assertNumQueries(2):  # memórias + prefetch dos recados
            payload = self.client.get("/api/memories/").json()
        self.assertNotIn("image_data", payload[0])

    def test_timeline_vem_em_ordem_cronologica(self):
        make_memory(title="depois", happened_on=date(2025, 3, 20))
        make_memory(title="antes", happened_on=date(2025, 3, 5))
        titles = [item["title"] for item in self.client.get("/api/memories/").json()]
        self.assertEqual(titles, ["antes", "depois"])

    def test_ordem_invertida(self):
        make_memory(title="depois", happened_on=date(2025, 3, 20))
        make_memory(title="antes", happened_on=date(2025, 3, 5))
        titles = [
            item["title"]
            for item in self.client.get("/api/memories/?order=desc").json()
        ]
        self.assertEqual(titles, ["depois", "antes"])

    def test_adiciona_recado_em_uma_memoria(self):
        memory = make_memory(title="Praia")
        response = self.client.post(
            f"/api/memories/{memory.id}/annotations/",
            {"author": "ela", "text": "Melhor dia do ano."},
        )
        self.assertEqual(response.status_code, 201, response.content)

        detail = self.client.get(f"/api/memories/{memory.id}/").json()
        self.assertEqual(detail["annotations"][0]["author_display"], "Ela")

    def test_recado_vazio_e_rejeitado(self):
        memory = make_memory()
        response = self.client.post(
            f"/api/memories/{memory.id}/annotations/", {"text": "   "}
        )
        self.assertEqual(response.status_code, 400)

    def test_favoritar_alterna_o_estado(self):
        memory = make_memory()
        self.assertTrue(
            self.client.post(f"/api/memories/{memory.id}/favorite/").json()["is_favorite"]
        )
        self.assertFalse(
            self.client.post(f"/api/memories/{memory.id}/favorite/").json()["is_favorite"]
        )

    def test_filtra_por_autor_e_por_favorito(self):
        make_memory(title="dela", author="ela", is_favorite=True)
        make_memory(title="dele", author="ele")

        so_dela = self.client.get("/api/memories/?author=ela").json()
        self.assertEqual([m["title"] for m in so_dela], ["dela"])

        favoritos = self.client.get("/api/memories/?favorites=1").json()
        self.assertEqual([m["title"] for m in favoritos], ["dela"])

    def test_summary_conta_tudo(self):
        memory = make_memory()
        Annotation.objects.create(memory=memory, text="te amo")
        body = self.client.get("/api/memories/summary/").json()
        self.assertEqual(body["total_memories"], 1)
        self.assertEqual(body["total_annotations"], 1)
        self.assertGreaterEqual(body["stored_image_mb"], 0)

    def test_site_config_converte_link_do_spotify(self):
        body = self.client.get("/api/site-config/").json()
        self.assertIn("/embed/playlist/", body["spotify_embed_url"])
        self.assertIn("her_name", body)

    def test_deletar_memoria(self):
        memory = make_memory()
        self.assertEqual(self.client.delete(f"/api/memories/{memory.id}/").status_code, 204)
        self.assertEqual(Memory.objects.count(), 0)


class ImageServingTests(TestCase):
    def setUp(self):
        self.memory = make_memory()

    def test_serve_a_foto_direto_do_banco(self):
        response = self.client.get(f"/api/memories/{self.memory.id}/image/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "image/webp")
        self.assertTrue(response.content.startswith(b"RIFF"))

    def test_serve_a_miniatura(self):
        full = self.client.get(f"/api/memories/{self.memory.id}/image/")
        thumb = self.client.get(f"/api/memories/{self.memory.id}/thumb/")
        self.assertEqual(thumb.status_code, 200)
        self.assertLess(len(thumb.content), len(full.content))

    def test_etag_evita_baixar_de_novo(self):
        first = self.client.get(f"/api/memories/{self.memory.id}/image/")
        etag = first["ETag"]
        second = self.client.get(
            f"/api/memories/{self.memory.id}/image/", headers={"if-none-match": etag}
        )
        self.assertEqual(second.status_code, 304)

    def test_cache_longo_quando_a_url_tem_versao(self):
        response = self.client.get(f"/api/memories/{self.memory.id}/image/?v=abc123")
        self.assertIn("immutable", response["Cache-Control"])

    def test_memoria_inexistente_da_404(self):
        self.assertEqual(self.client.get("/api/memories/99999/image/").status_code, 404)
