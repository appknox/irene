FROM node:0.12.14

MAINTAINER dhilipsiva@gmail.com

RUN npm install
RUN bower install

# EXPOSE 4200

# CMD ["ember", "serve"]
