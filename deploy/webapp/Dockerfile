FROM ubuntu:16.04
FROM node:8

WORKDIR /app
COPY package.json /app

RUN apt-get -y update
RUN apt-get -y install ruby
RUN apt-get -y install wget
RUN npm install
RUN npm install bcrypt@1.0.3
RUN npm install express
RUN npm install kafka-node 


COPY . /app
ENTRYPOINT ["node", "app.js"]

