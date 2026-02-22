FROM node:20-alpine 

WORKDIR /app

ENV NODE_ENV=production \ 
    PORT=3001


RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY ./package*.json  ./

RUN npm install --production 

COPY --chown=nodejs:nodejs ./server.js  ./

EXPOSE  3001

USER nodejs

CMD [ "npm" , "start" ]