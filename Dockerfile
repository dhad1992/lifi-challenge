FROM node:20-alpine
RUN apk update
RUN apk add git
WORKDIR /home/app/api
COPY package*.json ./
RUN npm install
COPY . ./
