FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app/gateway

COPY gateway/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node gateway/src ./src
COPY --chown=node:node frontend /app/frontend

USER node
EXPOSE 3000
CMD ["node", "src/app.js"]
