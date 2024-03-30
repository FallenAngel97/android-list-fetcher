FROM node:18-alpine
ADD . .
RUN apk add git openssh && yarn 
CMD ["node", "index.js"]
