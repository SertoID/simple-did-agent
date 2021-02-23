FROM alpine:3.11
RUN apk --no-cache add yarn
RUN mkdir -p /app
WORKDIR /app
COPY . /app
CMD ["yarn", "start"]