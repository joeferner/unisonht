import express from "express";
import { UnisonHTServer } from "../UnisonHTServer";
import ModeController from "./controllers/mode";
import asyncHandler from "express-async-handler";

export function createRouter(server: UnisonHTServer) {
  const router = express.Router();

  router.get(
    "/api/mode",
    asyncHandler(async (_req, res) => {
      const controller = new ModeController(server);
      const response = await controller.getMode();
      res.send(response);
    })
  );

  router.post(
    "/api/mode",
    asyncHandler(async (req, res) => {
      const controller = new ModeController(server);
      const response = await controller.setMode(req.body);
      res.send(response);
    })
  );

  return router;
}
