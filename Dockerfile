FROM node:21
WORKDIR /app
COPY ./app .
RUN npm ci && \
    cd frontend && \
    npm ci && \
    npm run build && \
    cd .. && \
    npm run build && \
    ls -l /app/dist && \
    chown -R node:node /app
EXPOSE 5000
USER node
CMD ["npm", "run", "serve"]