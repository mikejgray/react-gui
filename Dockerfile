FROM node:20-bookworm-slim

EXPOSE 3000

ADD . /app
WORKDIR /app

RUN rm -rf node_modules; \
    npm install


ENV NODE_OPTIONS="--openssl-legacy-provider"
ENTRYPOINT ["npm", "start"]