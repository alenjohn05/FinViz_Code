import { createServer } from "./server";
import { config } from "./config";
import { initialize } from "./services/dataProcessor";

const server = createServer();

server.listen(config.server.port, () => {
  console.log(
    `Server running at http://localhost:${config.server.port}/`
  );
  initialize().catch((err) => console.error("Initialization error:", err));
});
