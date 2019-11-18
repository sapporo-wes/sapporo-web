#!/bin/bash
set -eux
wait-for sapporo-web-database:5432
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py makemigrations app
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py migrate
python3 /opt/SAPPORO/SAPPORO-web/src/manage.py collectstatic --noinput
uwsgi /opt/SAPPORO/SAPPORO-web/etc/uwsgi/uwsgi.ini
