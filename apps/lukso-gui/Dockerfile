FROM node:16.13.0-alpine3.14 AS compile-image
RUN apk add --no-cache git
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY decorate-angular-cli.js ./
RUN yarn install
ENV PATH="./node_modules/.bin:$PATH" 
COPY . ./
RUN nx run lukso-gui:build:e2e

FROM nginx
COPY apps/lukso-gui/nginx.conf /etc/nginx/nginx.conf
COPY --from=compile-image /app/dist/apps/lukso-gui /usr/share/nginx/html