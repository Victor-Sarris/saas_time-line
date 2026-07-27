# 💗 Nossa Timeline

Uma linha do tempo **vertical** e interativa com as fotos de vocês dois. Cada foto
tem uma anotação de quem a guardou, e dá pra deixar recadinhos em cada momento depois.
Tem player do Spotify flutuante com a playlist dela, chuva de corações no fundo,
contador ao vivo de quanto tempo vocês estão juntos e uma carta selada no final.

As fotos ficam **dentro do banco de dados**, não no disco — é o que permite hospedar
em Railway, Render ou Fly sem perder nada quando o servidor reinicia.

**Stack:** Django 5 + Django REST Framework · React 19 + Vite + Tailwind CSS 4 + Framer Motion

---

## 1. Rodando o backend

```bash
cd C:\script\saas_time-line\backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env      # depois edite o .env (passo 3)

python manage.py migrate
python manage.py seed_memories       # opcional: 6 memórias de exemplo pra ver o site cheio
python manage.py createsuperuser     # opcional: pra usar o /admin

python manage.py runserver
```

API em <http://127.0.0.1:8000/api/> · admin em <http://127.0.0.1:8000/admin/>

> **Se você já tinha rodado a versão anterior:** é só rodar `python manage.py migrate`.
> A migração `0002` move sozinha as fotos que estavam em `backend/media/` para dentro
> do banco. Confira o site e, quando tiver certeza de que está tudo lá, você pode
> apagar a pasta `backend/media/` na mão.

## 2. Rodando o frontend

Em **outro terminal**:

```bash
cd C:\script\saas_time-line\frontend

npm install
copy .env.example .env

npm run dev
```

Site em <http://localhost:5173>

## 3. Deixando o site com a cara de vocês

Tudo que é texto vive no `backend/.env` — não precisa mexer em código:

| Variável               | O que é                                                 |
| ---------------------- | ------------------------------------------------------- |
| `HER_NAME`             | O nome dela (aparece na abertura e no rodapé)            |
| `HIS_NAME`             | O seu nome (assina a carta final)                        |
| `COUPLE_SINCE`         | `AAAA-MM-DD` do dia do pedido — liga o contador ao vivo  |
| `HERO_TITLE`           | Título grandão da capa                                   |
| `HERO_SUBTITLE`        | Frase logo abaixo do título                              |
| `LETTER_TITLE`         | Título da carta selada no fim da página                  |
| `LETTER_BODY`          | O texto da carta                                         |
| `SPOTIFY_PLAYLIST_URL` | Link normal da playlist (o backend converte pro embed)   |

> Deixe `COUPLE_SINCE` vazio até o grande dia. Depois que ela disser sim, você
> preenche a data, reinicia o `runserver` e o contador começa a rodar. 😌

**Playlist do Spotify:** no app, clique na playlist → `...` → Compartilhar → Copiar
link, e cole em `SPOTIFY_PLAYLIST_URL`. Funciona com playlist, álbum ou música.
O player abre no botão 🎧 no canto inferior esquerdo. Dependendo do navegador ela
vai precisar dar um play — o Spotify bloqueia som automático em algumas situações.

Fechar o player **não para a música**: o painel só encolhe, o tocador continua
vivo por trás. O botão vira um disquinho girando pra lembrar que a trilha sonora
segue rolando enquanto ela percorre as fotos.

## 4. Como a timeline funciona

Ela rola de cima pra baixo, na ordem em que as coisas aconteceram. No desktop os
cards se alternam à esquerda e à direita do trilho; no celular ficam todos em uma
coluna só. A linha central vai se preenchendo em degradê conforme ela desce, cada
momento tem um coração marcando o ponto, e os anos aparecem como separadores.

Clicar em qualquer foto abre ela grande, com os recadinhos e o campo pra escrever
um novo.

## 5. Como usar no dia

1. Antes: suba as fotos pelo botão `+`, escreva as anotações e marque as favoritas com 💖.
2. Faça o pedido pessoalmente.
3. Abra o site. A tela de abertura mostra o nome dela e o botão _"abrir a nossa história"_.
4. Deixe ela percorrer a fita no ritmo dela e abrir a carta no final.
5. Depois, ela também pode guardar fotos e deixar recadinhos — o site é dos dois.

---

## As fotos e o banco

Quando você sobe uma foto, o backend:

1. corrige a rotação gravada pela câmera do celular (EXIF);
2. reduz pra no máximo **1600px** e converte pra **WEBP** (qualidade 82);
3. gera uma **miniatura de 640px** pros cards da timeline;
4. guarda os dois como bytes na própria tabela, junto de dimensões e um hash.

Na prática uma foto de celular de 4MB vira ~150KB no banco. Os cards carregam a
miniatura, e a foto grande só é baixada quando ela abre o momento.

As imagens são servidas por `/api/memories/{id}/image/` com `ETag` e cache de um ano
(a URL carrega `?v=<hash>`), então o navegador dela baixa cada foto **uma única vez**.

## API

| Método | Rota                              | O que faz                                     |
| ------ | --------------------------------- | --------------------------------------------- |
| GET    | `/api/site-config/`               | Nomes, textos, data e URL de embed do Spotify  |
| GET    | `/api/memories/`                  | Timeline em ordem cronológica (sem os blobs)   |
| GET    | `/api/memories/?favorites=1`      | Só os favoritos                                |
| GET    | `/api/memories/?author=ela`       | Filtra por quem guardou (`ele`/`ela`/`nos`)    |
| GET    | `/api/memories/?order=desc`       | Do mais recente pro mais antigo                |
| POST   | `/api/memories/`                  | Cria memória (multipart, com a imagem)         |
| DELETE | `/api/memories/{id}/`             | Apaga uma memória                              |
| POST   | `/api/memories/{id}/favorite/`    | Alterna o 💖                                   |
| POST   | `/api/memories/{id}/annotations/` | Adiciona um recadinho                          |
| GET    | `/api/memories/{id}/image/`       | A foto (WEBP, direto do banco)                 |
| GET    | `/api/memories/{id}/thumb/`       | A miniatura                                    |
| GET    | `/api/memories/summary/`          | Totais da timeline + quanto ocupa em MB        |

## Estrutura

```
saas_time-line/
├─ backend/
│  ├─ core/                 # settings, urls, wsgi
│  ├─ memories/
│  │  ├─ imaging.py         # compressão WEBP + miniatura
│  │  ├─ models.py          # os bytes da foto ficam aqui
│  │  ├─ views.py           # API + endpoints que servem as imagens
│  │  └─ migrations/0002_fotos_no_banco.py
│  └─ requirements.txt
└─ frontend/
   └─ src/
      ├─ api/client.js
      ├─ hooks/useTimeline.js  # estado das memórias
      └─ components/           # Intro, Hero, Timeline, MemoryCard, MemoryModal,
                               # AddMemoryModal, SpotifyPlayer, FinalLetter
```

## Testes

```bash
cd backend && python manage.py test      # 23 testes: compressão, upload, cache, API
cd frontend && npm run build             # checa o build de produção
```

---

## Hospedando

O passo a passo completo está no **[DEPLOY.md](DEPLOY.md)** — Vercel (frontend e
backend) + Neon (banco), tudo no plano grátis e sem cartão.

Resumo: sem `DATABASE_URL` o projeto usa SQLite local; com ela, vira Postgres
sozinho. Em serverless, lembre de `DJANGO_CONN_MAX_AGE=0` e de usar a connection
string **pooled** do Neon — o resto o `settings.py` detecta sozinho, inclusive
desligar os cursores de servidor que o PgBouncer não suporta.

Com `DJANGO_DEBUG=False` o projeto já liga HTTPS, HSTS, cookies seguros e o
WhiteNoise pros arquivos do admin. `python manage.py check --deploy` passa limpo.

Como as fotos ficam no banco, o upload precisa caber no limite de ~4,5 MB por
requisição das funções serverless — por isso o frontend **comprime a imagem no
navegador** (1600px, WEBP, ~200 KB) antes de enviar.

**Não esqueça:** faça backup do banco. As memórias de vocês estão todas lá dentro —
fotos inclusive. Um `pg_dump` de vez em quando resolve. 💗

---

Boa sorte no pedido. Vai dar certo.
