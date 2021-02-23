FROM alpine:3.11
RUN apk --no-cache add yarn
RUN mkdir -p /app
WORKDIR /app
COPY ./build /app/build
COPY ./node_modules /app/node_modules
COPY ./package.json /app/package.json
CMD ["yarn", "start"]