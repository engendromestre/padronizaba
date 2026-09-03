FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  git \
  curl \
  bash \
  ca-certificates \
  chromium \
  fonts-freefont-ttf \
  && rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium

WORKDIR /home/node/app

RUN npm install -g npm@latest