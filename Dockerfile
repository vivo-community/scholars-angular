FROM node:current-alpine

# host build argument used to template angular.json
ARG host=localhost
ENV HOST=$host

# port build argument used to template angular.json and server.ts
ARG port=4200
ENV PORT=$port

# copy project to build excluding node_modules and dist
COPY . /var/app/scholars-angular

# set working directory
WORKDIR /var/app/scholars-angular

# install dependencies
RUN yarn install

# build app with server side rendering in production 
RUN yarn build:ssr:prod

# install pm2 globally
RUN npm install pm2 -g

# deploy app using pm2 when running container
CMD ["pm2-docker", "/var/app/scholars-angular/dist/server.js", "--name='scholars-angular'"]