import express from "express";
import cors from "cors";
import { Server } from "http";
import routes from "./routes";
import { prisma } from "./utils/prisma";
import * as bodyParser from 'body-parser';

export class App {
  public server;

  private httpServer: Server;

  private PORT = process.env.PORT || 8000;

  constructor() {
    this.server = express();

    this.middleware();

    const corsOptions = {
      origin: [
        /\.meroku\.store$/,
        "http://localhost:3000",
        "https://staging-dapp-registry.netlify.app",
        "https://dapp-store.netlify.app",
        "https://editor.swagger.io",
      ],
    };

    this.server.use(cors(corsOptions));
    this.routes();
  }

  middleware() {
    this.server.use(express.json());
    this.server.use(bodyParser.json());
    this.server.use(
      bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: true
      })
    );
  }

  routes() {
    this.server.use(routes);
  }

  async start() {
    try {
      await prisma.$connect();
      this.httpServer = this.server.listen(this.PORT, () => {
        console.log(`Server is running on port ${this.PORT}`);
      });
    } catch (error) {
      console.log(`Error initializing database: ${error}`);
      if (this.httpServer.listening) {
        this.httpServer.close();
        console.log("Server closed");
      }
    }
  }
}
