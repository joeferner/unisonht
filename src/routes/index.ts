import express from "express";
import { UnisonHTServer } from "../UnisonHTServer";
import ModeController from "./controllers/mode";

export function createRouter(server: UnisonHTServer) {
  const router = express.Router();

  router.get("/api/mode", async (_req, res) => {
    const controller = new ModeController(server);
    const response = await controller.getMode();
    return res.send(response);
  });

  return router;
}
