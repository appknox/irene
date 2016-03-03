FROM python:3.5.1

MAINTAINER dhilipsiva@gmail.com

COPY server.py ./server.py

EXPOSE 8083

CMD ["python", "./server.py"]
