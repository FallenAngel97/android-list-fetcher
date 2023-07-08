FROM node:18
ADD . .
RUN yarn 
CMD ["node", "index.js"]
