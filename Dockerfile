#Build the app, Step 1#
FROM node:12.7.0-alpine

ARG port=4200
ENV PORT=$port

COPY . /var/app/scholars-angular

WORKDIR /var/app/scholars-angular

#install needed packages
RUN yarn install && npm install pm2 -g

#builds the app
RUN yarn build:ssr:prod

#CMD ran when the container is deployed.
CMD ["pm2-docker", "/var/app/scholars-angular/dist/server.js", "--name='scholars-angular'"]