FROM node:21
WORKDIR /app
COPY ./app .
RUN npm i
RUN npm run build
RUN ls -l /app/dist
EXPOSE 5000
RUN chown -R node:node /app
USER node
CMD ["npm", "run", "serve"]