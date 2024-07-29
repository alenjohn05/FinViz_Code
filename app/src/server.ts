import express from 'express';
import router from './routes';
import path from 'path';
import { config } from './config';
import cors from 'cors'


export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));

  // Routes
  app.use('/', router);
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });

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