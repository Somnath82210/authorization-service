FROM node:lts

WORKDIR /auth

COPY package.json .

COPY . .

RUN npm install ts-node nodemon -g
RUN npm install

EXPOSE 8080

CMD ["npm", "run", "start"]