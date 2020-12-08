FROM node:14-alpine as node

# copy project to build excluding node_modules and dist via .dockerignore
COPY . /scholars-angular

# set working directory
WORKDIR /scholars-angular

# install dependencies
RUN yarn install

# build scholars-angular with server side rendering in production 
RUN yarn build:ssr

# final base image
FROM keymetrics/pm2:14-alpine

# set deployment directory
WORKDIR /

# copy over the built artifact from the maven image
COPY --from=node /scholars-angular/dist /dist

# deploy scholars-angular using pm2 when running container
CMD ["pm2-runtime", "/dist/scholars-angular/server/main.js", "--name='scholars-angular'"]
