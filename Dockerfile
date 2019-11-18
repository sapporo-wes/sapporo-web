FROM python:slim

WORKDIR /opt/SAPPORO/SAPPORO-web

RUN apt update && \
    apt install -y \
    build-essential \
    curl \
    iproute2 \
    jq \
    netcat \
    tree

COPY etc/requirements.txt /tmp

RUN pip install -U pip wheel setuptools && \
    pip install -r /tmp/requirements.txt && \
    rm -rf /tmp/requirements.txt

COPY etc/entrypoint.sh /usr/local/bin
COPY etc/entrypoint.uwsgi.sh /usr/local/bin
ADD https://raw.githubusercontent.com/eficode/wait-for/master/wait-for /usr/local/bin

RUN chmod 777 /usr/local/bin/entrypoint.sh && \
    chmod 777 /usr/local/bin/entrypoint.uwsgi.sh && \
    chmod 777 /usr/local/bin/wait-for

COPY src /opt/SAPPORO/SAPPORO-web/src

CMD ["entrypoint.sh"]
