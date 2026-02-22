FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=3001

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY --chown=nodejs:nodejs server.js .

USER nodejs

EXPOSE 3001

CMD ["npm", "start"]
