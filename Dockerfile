FROM node:0.12.14

MAINTAINER dhilipsiva@gmail.com

RUN npm install -g ember-cli

EXPOSE 4200

CMD ["ember", "serve"]
