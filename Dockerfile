# Use an official image as a parent image
FROM node:12.2.0-slim

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

#git the code
COPY . ../scholars

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@7.3.9
RUN npm install pm2 -g

# add app
COPY . /app
COPY ecosystem.config.js /app/app.js

#Run PM2 when the contatiner launches
CMD ["pm2-runtime", "app.js"]

#Start NPM
RUN npm run start