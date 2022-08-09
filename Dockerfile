FROM node:18.4.0-buster as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18.4.0-buster-slim

LABEL org.opencontainers.image.authors="DDBJ(DNA Data Bank of Japan) <t.ohta@nig.ac.jp>"
LABEL org.opencontainers.image.url="https://github.com/sapporo-wes/sapporo-web"
LABEL org.opencontainers.image.source="https://github.com/sapporo-wes/sapporo-web/blob/main/Dockerfile"
LABEL org.opencontainers.image.version="1.1.1"
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

RUN npm run generate

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 1121

EXPOSE 1121

ENTRYPOINT ["tini", "--"]
CMD ["npm", "run", "start"]
