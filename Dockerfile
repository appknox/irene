FROM node:14.13.1-stretch AS builder

LABEL maintainer "Appknox <engineering@appknox.com>"

WORKDIR /code/

COPY package*.json ./

RUN npm ci

COPY . ./

RUN npm run deploy:server


FROM node:14.13.1-alpine

LABEL maintainer "Appknox <engineering@appknox.com>"

RUN mkdir /app && chown node -R /app
USER node
WORKDIR /app/
COPY --chown=node --from=builder /code/staticserver/package*.json ./
RUN npm ci
COPY --chown=node --from=builder /code/staticserver/. ./

CMD ["node", "/app/index.js"]
