FROM node:16.2.0-alpine 

WORKDIR /usr/scr/app


COPY package*.json ./

RUN npm install

COPY . . 


RUN npm run build

EXPOSE 3000


CMD ["node", "dist/main"]