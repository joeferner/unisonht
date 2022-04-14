import express, { Express } from "express";
import Debug from "debug";
import swaggerUi from "swagger-ui-express";
import { router } from "./routes";

const debug = Debug("unisonht:server");

export class Server {
  private readonly app: Express;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.static("public/dist/unisonht-public"));
    this.app.use(
      "/api/docs",
      swaggerUi.serve,
      swaggerUi.setup(undefined, {
        swaggerOptions: {
          url: "/swagger.json",
        },
      })
    );
    this.app.use(router);
  }

  start(options?: { port?: number }) {
    const port = options?.port || 4201;
    this.app.listen(port, () => {
      debug(`listening http://localhost:${port}`);
    });
  }
}

const port = parseInt(process.env.SERVER_PORT ?? "4201");
new Server().start({ port });
