FROM node:13-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 2344

CMD [ "node", "./bin/www" ]