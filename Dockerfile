FROM python:3.5.1

MAINTAINER dhilipsiva@gmail.com

RUN echo"=================="; pwd; echo "============="

COPY server.py  /usr/local/server.py

EXPOSE 8083

CMD /bin/bash -c "python /usr/local/server.py"
