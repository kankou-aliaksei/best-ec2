FROM node:14 as build

ARG API_URL

WORKDIR /app

COPY . /app

RUN npm install

RUN perl -pi -e 's#http://127.0.0.1:8001#'"$API_URL"'#g' src/constant.js

RUN npm run build

FROM httpd:latest

COPY --from=build /app/build/ /usr/local/apache2/htdocs/

# Expose port 80
EXPOSE 80
