FROM node:18-alpine
ADD . .
RUN yarn 
CMD ["node", "index.js"]
