import { Route } from "tsoa";
import { UnisonHTServer } from "../UnisonHTServer";
import { Router } from "express-serve-static-core";

@Route("api/v1/device")
export class DeviceController {
  constructor(private readonly server: UnisonHTServer) {}

  static init(server: UnisonHTServer, router: Router) {
    const deviceController = new DeviceController(server);
  }
}
