import cluster from "cluster";
import os from "os";
import { createServer } from "./server";
import { config } from "./config";
import { initialize } from "./services/dataProcessor";

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const server = createServer();
  
  server.listen(config.server.port, () => {
    console.log(`Worker ${process.pid} running at http://localhost:${config.server.port}/`);
    if (cluster.worker?.id === 1) {
      initialize().catch(err => console.error("Initialization error:", err));
    }
  });
}
