FROM node:18-alpine
ADD . .
RUN apk add git && yarn 
CMD ["node", "index.js"]
