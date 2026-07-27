# 🚀 Colocando no ar — Vercel + Neon (tudo no plano grátis)

São três coisas: o banco no Neon, o backend na Vercel e o frontend na Vercel.
Uns 30 minutos no total, e nenhuma delas pede cartão.

> **Ordem importa.** Banco → backend → frontend → voltar no backend pra liberar
> o endereço do frontend. Se pular a última etapa, o site abre mas não carrega
> as fotos (erro de CORS).

---

## 1. O banco (Neon)

1. Crie a conta em <https://neon.com> e um projeto novo. Escolha a região mais
   perto de você (`aws-sa-east-1`, São Paulo).
2. Em **Connection string**, marque a opção **Pooled connection** e copie.
   Ela tem `-pooler` no host — é essa que a gente quer, porque serverless abre e
   fecha conexão o tempo todo:

   ```
   postgresql://usuario:senha@ep-algo-123-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Rode as migrações da sua máquina mesmo** (a Vercel não te dá um terminal).
   No `backend/.env`, cole a URL e rode:

   ```bash
   cd backend
   venv\Scripts\activate
   python manage.py migrate
   python manage.py createsuperuser
   ```

### Dica boa: suba as fotos antes de publicar

Com o `DATABASE_URL` do Neon ainda no seu `.env`, rode o projeto local normalmente
(`python manage.py runserver` + `npm run dev`) e **suba todas as fotos por ali**.
Elas vão direto pro banco de produção. Quando o site for publicado, já nasce cheio.

Depois de subir tudo, tire um backup:

```bash
pg_dump "sua-connection-string" > backup-nossa-timeline.sql
```

---

## 2. O backend (Vercel)

Desde abril de 2026 a Vercel reconhece Django sozinha: ela acha o `manage.py`,
descobre o WSGI e cuida dos arquivos estáticos. Não precisa de `vercel.json`.

1. Suba o projeto pro GitHub.
2. Na Vercel: **Add New → Project**, escolha o repositório.
3. Em **Root Directory**, selecione **`backend`**. Isso é o pulo do gato.
4. Em **Environment Variables**, cole:

   | Variável                | Valor                                                        |
   | ----------------------- | ------------------------------------------------------------ |
   | `DJANGO_SECRET_KEY`     | uma chave longa e aleatória (veja abaixo)                     |
   | `DJANGO_DEBUG`          | `False`                                                       |
   | `DJANGO_ALLOWED_HOSTS`  | `.vercel.app`                                                 |
   | `DATABASE_URL`          | a connection string **pooled** do Neon                        |
   | `DATABASE_SSL_REQUIRE`  | `True`                                                        |
   | `DJANGO_CONN_MAX_AGE`   | `0`  ← **obrigatório em serverless**                          |
   | `SECURE_SSL_REDIRECT`   | `False` ← a Vercel já força HTTPS na borda                    |
   | `HER_NAME`              | o nome dela                                                   |
   | `HIS_NAME`              | Victor                                                        |
   | `COUPLE_SINCE`          | a data, quando chegar a hora                                  |
   | `HERO_TITLE`            | …                                                             |
   | `HERO_SUBTITLE`         | …                                                             |
   | `LETTER_TITLE`          | …                                                             |
   | `LETTER_BODY`           | o texto da carta                                              |
   | `SPOTIFY_PLAYLIST_URL`  | o link da playlist                                            |

   Pra gerar a chave secreta:

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(64))"
   ```

5. **Deploy.** Anote o endereço que sair (algo como
   `nossa-timeline-api.vercel.app`) e teste:
   <https://seu-backend.vercel.app/api/site-config/>

### Se a detecção automática não pegar

Crie `backend/vercel.json` com isto e faça o deploy de novo:

```json
{
  "builds": [{ "src": "core/wsgi.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "core/wsgi.py" }]
}
```

---

## 3. O frontend (Vercel)

1. **Add New → Project**, o mesmo repositório.
2. **Root Directory**: **`frontend`**. A Vercel detecta o Vite sozinha.
3. Uma variável só:

   | Variável       | Valor                                    |
   | -------------- | ---------------------------------------- |
   | `VITE_API_URL` | `https://seu-backend.vercel.app/api`     |

4. Deploy.

---

## 4. Fechando o círculo (não pule)

Volte no projeto **do backend** na Vercel e adicione:

| Variável               | Valor                            |
| ---------------------- | -------------------------------- |
| `CORS_ALLOWED_ORIGINS` | `https://seu-site.vercel.app`    |

Faça **Redeploy**. Sem isso o navegador dela bloqueia as chamadas à API.

---

## O limite de 4,5 MB (já resolvido)

Funções serverless recusam requisições com corpo acima de ~4,5 MB, e foto de
celular passa disso fácil. Por isso o frontend **comprime a imagem no navegador
antes de enviar**: redimensiona pra 1600px e converte pra WEBP, saindo em torno de
200 KB. O backend comprime de novo do lado dele, como rede de segurança.

Na prática você não vai esbarrar nesse limite. Se uma foto muito exótica ainda
passar, o formulário avisa antes de tentar enviar.

---

## Checklist do dia

- [ ] Abrir o site umas horas antes, pra tirar a função da hibernação
- [ ] Conferir que as fotos aparecem e que a música toca
- [ ] Preencher `COUPLE_SINCE` com a data e dar Redeploy no backend
- [ ] Ter o link salvo no celular, pronto pra abrir
- [ ] Backup do banco feito (`pg_dump`)

---

## Detalhes chatos que valem saber

**Cold start.** A função dorme quando ninguém acessa. A primeira visita depois de
um tempo parado leva 1 a 3 segundos. Abrir o site uma vez antes resolve.

**Plano Hobby.** É gratuito para uso pessoal — projeto comercial precisa do Pro.
O seu é pessoal.

**Neon suspende o compute** depois de alguns minutos parado, mas religa sozinho
em menos de um segundo. Você não precisa fazer nada.

**Sem backup automático** em nenhum dos planos grátis. O `pg_dump` é com você —
e ali dentro estão as fotos de vocês, não só texto. 💗
