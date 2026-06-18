FROM node:20-alpine

RUN apk add --no-cache \
  git \
  curl \
  bash \
  chromium \
  nss \
  freetype \
  harfbuzz \
  ca-certificates \
  ttf-freefont

ENV PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium-browser

WORKDIR /home/node/app

RUN npm install -g npm@latest