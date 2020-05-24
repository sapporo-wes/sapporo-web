FROM node:14.0-buster-slim

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

RUN yarn build

ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["yarn", "start"]
