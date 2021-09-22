# FROM node:15.11.0-buster
FROM node@sha256:bbb082a223035cee9f7a6a60154ad4d98e15d417ba89f16f81e2ae15fb70ad4d as builder

WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --flozen-lock

# FROM node:15.11.0-buster-slim
FROM node@sha256:9eec4779831fa9b577b30aa55ae231d09ea3fecc01ac5f97510f7c785ea0e58f

LABEL org.opencontainers.image.authors="DDBJ(DNA Data Bank of Japan) <t.ohta@nig.ac.jp>"
LABEL org.opencontainers.image.url="https://github.com/ddbj/sapporo-web"
LABEL org.opencontainers.image.source="https://github.com/ddbj/sapporo-web/blob/main/Dockerfile"
LABEL org.opencontainers.image.version="1.0.9"
LABEL org.opencontainers.image.description="A web application for managing and executing WES services."
LABEL org.opencontainers.image.licenses="Apache2.0"

RUN apt update && \
  apt install -y --no-install-recommends \
  curl \
  tini && \
  apt clean && \
  rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules /app/node_modules

WORKDIR /app
COPY . .

RUN yarn generate

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 1121

EXPOSE 1121

ENTRYPOINT ["tini", "--"]
CMD ["yarn", "start"]
