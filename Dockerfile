FROM danlynn/ember-cli:1.13.15

MAINTAINER dhilipsiva@gmail.com

RUN npm install -g ember-cli

EXPOSE 4200

CMD ["ember", "serve"]
