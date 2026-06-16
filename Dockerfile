FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src
COPY .env.example ./.env.example

RUN mkdir -p /app/data \
    && chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_FILE=/app/data/secure_notes.sqlite
ENV JWT_EXPIRES_IN=1h

EXPOSE 3000

CMD ["node", "src/server.js"]