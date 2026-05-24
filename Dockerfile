# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
# OS packages (if needed) are installed separately from npm dependencies
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
# Project start script runs: node dist/index.js (no pm2 required)
CMD ["npm", "start"]
