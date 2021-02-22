FROM node:15.8.0-buster-slim

RUN apt update && \
  apt install -y --no-install-recommends \
  build-essential \
  python-dev \
  curl \
  tini && \
  apt clean && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn generate

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 1121

EXPOSE 1121

ENTRYPOINT ["tini", "--"]
CMD ["yarn", "start"]
