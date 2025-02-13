FROM node:20.18.0-bullseye AS builder

LABEL maintainer "Appknox <engineering@appknox.com>"

WORKDIR /code/
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run deploy:server


FROM node:20.18.0-alpine

LABEL maintainer "Appknox <engineering@appknox.com>"

EXPOSE 4200

RUN mkdir /app && chown node -R /app
USER node
WORKDIR /app/
COPY --chown=node --from=builder /code/staticserver/package*.json ./
RUN npm ci
COPY --chown=node --from=builder /code/staticserver/. ./

CMD ["node", "/app/index.js"]
