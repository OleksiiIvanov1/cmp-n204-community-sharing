FROM node:18

WORKDIR /src

COPY package*.json /src/

RUN npm install -g supervisor && npm install && npm install supervisor

COPY . /src

EXPOSE 3000