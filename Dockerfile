FROM nginx:1.9.11

MAINTAINER dhilipsiva@gmail.com

COPY index.html /usr/share/nginx/html

VOLUME ./nginx.conf /etc/nginx/conf.d/irene.template

ENV NGINX_HOST=irene.dev.suttawala.co
ENV NGINX_PORT=80

EXPOSE 80

CMD /bin/bash -c "envsubst < /etc/nginx/conf.d/irene.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
