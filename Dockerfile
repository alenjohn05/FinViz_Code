FROM node:21

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN chown -R node:node /app
RUN npm run build
EXPOSE 5000
USER node
CMD ["node", "dist/index.js"]
