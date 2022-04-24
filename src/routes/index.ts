import express from "express";
import { UnisonHTServer } from "../UnisonHTServer";
import { DeviceController } from "./DeviceController";
import { DevicesController } from "./DevicesController";
import { ModeController } from "./ModeController";

export function createRouter(server: UnisonHTServer) {
  const router = express.Router();
  ModeController.init(server, router);
  DeviceController.init(server, router);
  DevicesController.init(server, router);
  return router;
}
