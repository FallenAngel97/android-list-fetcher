FROM node:18-alpine
ADD . .
RUN apk add git ssh && yarn 
CMD ["node", "index.js"]
