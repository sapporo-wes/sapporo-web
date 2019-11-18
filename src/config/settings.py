# coding: utf-8
import os
import secrets
from distutils.util import strtobool
from pathlib import Path


def str2bool(arg):
    if isinstance(arg, str):
        try:
            if strtobool(arg):
                return True
            else:
                return False
        except ValueError:
            raise Exception(
                "Please check your docker-compose.yml:environment, "
                "The bool value should be 'true value are y, yes, t, "
                "true, on and 1; false values are n, no, f, false, off and 0'")
    else:
        if arg:
            return True
        else:
            return False


def generate_secret_key():
    SECRET_KEY_FILE_NAME = "secret_key.txt"
    SECRET_KEY_FILE_PATH = Path(__file__).absolute().parent.joinpath(SECRET_KEY_FILE_NAME)  # NOQA
    if SECRET_KEY_FILE_PATH.exists():
        with SECRET_KEY_FILE_PATH.open(mode="r") as f:
            for line in f.readlines():
                if line != "":
                    secret_key = line
    else:
        with SECRET_KEY_FILE_PATH.open(mode="w") as f:
            secret_key = secrets.token_urlsafe(32)
            f.write(secret_key)

    return secret_key


BASE_DIR = Path(__file__).absolute().parent.parent
DEBUG = str2bool(os.environ.get("DEBUG", True))
LANGUAGE_CODE = os.environ.get("LANGUAGE_CODE", "en")
TIME_ZONE = os.environ.get("TIME_ZONE", "UTC")
USER_SIGNUP = str2bool(os.environ.get("USER_SIGNUP", True))
LOG_FILE_PATH = str(BASE_DIR.joinpath("../log/app/django.log").resolve())

if DEBUG:
    from .logging_config import local_info, local_debug
    if os.environ.get("LOG_LEVEL", "") == "INFO":
        LOGGING = local_info
    else:
        LOGGING = local_debug
else:
    from .logging_config import wsgi_info, wsgi_debug
    if os.environ.get("LOG_LEVEL", "") == "INFO":
        LOGGING = wsgi_info
    else:
        LOGGING = wsgi_debug

ALLOWED_HOSTS = ["*"]
SECRET_KEY = generate_secret_key()
USE_I18N = True
USE_L10N = True
USE_TIME_ZONE = True

STATIC_URL = "/static/"
STATICFILES_DIRS = [
    str(BASE_DIR.joinpath("app/static")),
]

STATIC_ROOT = str(BASE_DIR.joinpath("static"))

LOGIN_URL = "/signin"
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

SESSION_COOKIE_AGE = 3600  # 1hour
SESSION_IDLE_TIMEOUT = 3600  # 1hour
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = True

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "bootstrap4",
    "app",
]

BOOTSTRAP4 = {
    "include_jquery": True
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [str(BASE_DIR.joinpath("templates")), ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

if DEBUG:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": str(BASE_DIR.joinpath("db.sqlite3")),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": os.environ.get("POSTGRES_DB", "sapporo-web"),
            "USER": os.environ.get("POSTGRES_USER", "sapporo-web-user"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "sapporo-web-passwd"),  # NOQA
            "HOST": "sapporo-web-database",
            "PORT": int(os.environ.get("POSTGRES_PORT", 5432)),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",  # NOQA
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",  # NOQA
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",  # NOQA
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",  # NOQA
    },
]

if DEBUG:
    # docker inspect sapporo-network | jq '.[].IPAM.Config | .[].Gateway'
    INTERNAL_IPS = ["172.18.0.1"]
    MIDDLEWARE += [
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    ]

    INSTALLED_APPS += [
        "debug_toolbar",
    ]
