FROM node:latest

ARG host=localhost
ENV HOST=$host

ARG port=4200
ENV PORT=$port

COPY . /var/app/scholars-angular

WORKDIR /var/app/scholars-angular

RUN yarn install

RUN yarn build:ssr:prod

RUN npm install pm2 -g

CMD ["pm2-docker", "/var/app/scholars-angular/dist/server.js", "--name='scholars-angular'"]