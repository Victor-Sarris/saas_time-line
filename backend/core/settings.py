"""
Configuracoes do projeto - Nossa Timeline.
"""
from pathlib import Path
import os

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(key, default=""):
    return os.environ.get(key, default)


def env_bool(key, default=False):
    return env(key, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_list(key, default=""):
    raw = env(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = env("DJANGO_SECRET_KEY", "dev-nossa-timeline-troque-em-producao")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    # ".vercel.app" cobre o domínio que a Vercel gera e os previews
    "localhost,127.0.0.1,0.0.0.0,.vercel.app",
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "memories",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # em DEBUG o próprio Django serve os estáticos; em produção quem serve é o WhiteNoise
    *([] if DEBUG else ["whitenoise.middleware.WhiteNoiseMiddleware"]),
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# Sem DATABASE_URL (ou com ele vazio) -> SQLite aqui do lado.
# Com DATABASE_URL (Neon, Railway, Render, Supabase...) -> Postgres,
# sem mexer em nada no código.
DATABASE_URL = env("DATABASE_URL", "").strip()

# Em servidor comum, segurar a conexão aberta economiza tempo (600s).
# Em serverless (Vercel & cia), cada instância seguraria uma conexão e o
# banco esgota: lá isto tem que ser 0.
CONN_MAX_AGE = int(env("DJANGO_CONN_MAX_AGE", "600"))

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=CONN_MAX_AGE,
            conn_health_checks=CONN_MAX_AGE > 0,
            ssl_require=env_bool("DATABASE_SSL_REQUIRE", False),
        )
    }
    # O pooler do Neon (host com "-pooler") é um PgBouncer em modo transaction,
    # que não sabe lidar com cursores do lado do servidor. Detecta sozinho.
    usa_pooler = "-pooler" in DATABASE_URL or "pgbouncer" in DATABASE_URL
    DATABASES["default"]["DISABLE_SERVER_SIDE_CURSORS"] = env_bool(
        "DISABLE_SERVER_SIDE_CURSORS", usa_pooler
    )
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-br"
TIME_ZONE = env("DJANGO_TIME_ZONE", "America/Sao_Paulo")
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

# Não existe MEDIA_ROOT: as fotos moram dentro do banco (memories/imaging.py).

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Upload de imagens (limite do arquivo que chega; depois ele é comprimido)
MAX_UPLOAD_SIZE_MB = int(env("MAX_UPLOAD_SIZE_MB", "25"))
DATA_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PAGINATION_CLASS": None,
    "DATETIME_FORMAT": "%Y-%m-%dT%H:%M:%S%z",
}

# CORS - libera o dev server do Vite
CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
)
CORS_ALLOW_CREDENTIALS = True

# Sem isso o login do /admin falha em produção com "CSRF verification failed".
CSRF_TRUSTED_ORIGINS = list(
    dict.fromkeys(
        [origin for origin in CORS_ALLOWED_ORIGINS if origin.startswith("http")]
        + env_list("CSRF_TRUSTED_ORIGINS", "")
        + ["https://*.vercel.app"]
    )
)

# ---------------------------------------------------------------------------
# Producao: so liga quando DJANGO_DEBUG=False
# ---------------------------------------------------------------------------
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# ---------------------------------------------------------------------------
# Conteudo da historia de voces dois (tudo configuravel pelo .env)
# ---------------------------------------------------------------------------
LOVE_CONFIG = {
    "her_name": env("HER_NAME", "Meu Amor"),
    "his_name": env("HIS_NAME", "Victor"),
    "couple_since": env("COUPLE_SINCE", ""),  # formato YYYY-MM-DD
    "hero_title": env("HERO_TITLE", "A nossa história"),
    "hero_subtitle": env(
        "HERO_SUBTITLE",
        "Cada foto aqui é um pedacinho de tempo que eu escolheria viver de novo.",
    ),
    "letter_title": env("LETTER_TITLE", "Uma última coisa..."),
    "letter_body": env(
        "LETTER_BODY",
        "Essa linha do tempo não tem fim — ela só está esperando as próximas fotos. "
        "Obrigado por cada dia. Quer continuar escrevendo essa história comigo?",
    ),
    "spotify_playlist_url": env(
        "SPOTIFY_PLAYLIST_URL",
        "https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn",
    ),
}

# serviço de email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(env("EMAIL_PORT", "587"))
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Token secreto para proteger nossa rota do Cron Job
CRON_SECRET = env("CRON_SECRET", "super-secreto-mude-em-prod")

EMAILS_DO_CASAL = env_list("EMAILS_DESTINO", default="")