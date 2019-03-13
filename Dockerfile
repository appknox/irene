FROM quay.io/appknox/ak-ubuntu:2.0.2

LABEL maintainer "Appknox <engineering@appknox.com>"

RUN adduser --disabled-password --gecos '' irene

RUN DEBIAN_FRONTEND=noninteractive apt-get update -y && \
  apt-get install -y nodejs nginx

ENTRYPOINT ["./entrypoint.sh"]

WORKDIR /code
COPY . /code/
RUN chown -R irene:irene /code/
COPY nginx.conf /etc/nginx/nginx.conf

RUN gosu irene npm install
