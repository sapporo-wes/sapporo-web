#!/bin/bash
set -eux
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py makemigrations app
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py migrate
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py runserver 0.0.0.0:8080
