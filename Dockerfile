FROM danlynnd/ember-cli:1.13.15

MAINTAINER dhilipsiva@gmail.com

RUN npm install
RUN bower install

EXPOSE 4200

CMD ["ember", "serve"]
