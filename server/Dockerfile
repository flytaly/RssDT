FROM node:14

# Create app directory
WORKDIR /usr/src/app

VOLUME /usr/src/app/log

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
COPY .env.production .env

ENV NODE_ENV production

RUN npm run build


EXPOSE 8080
CMD [ "node", "dist/index.js" ]
USER node
