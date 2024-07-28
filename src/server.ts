import express from 'express';
import router from './routes';
import { config } from './config';


export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/', router);

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  return app;
}

if (require.main === module) {
  const app = createServer();
  app.listen(config.server.port, () => {
    console.log(`Server is running on port ${config.server.port}`);
  });
}