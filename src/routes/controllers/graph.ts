import { Get, Route } from "tsoa";
import { UnisonHTNodeConfig } from "../../types/UnisonHTConfig";
import { UnisonHTServer } from "../../UnisonHTServer";

@Route("api/graph")
export class GraphController {
  constructor(private readonly server: UnisonHTServer) { }

  @Get("/")
  public async getGraph(): Promise<GetGraphResponse> {
    return {
      nodes: this.server.nodes.map(node => {
        return {
          config: node.config
        };
      })
    };
  }
}

interface GetGraphResponse {
  nodes: { config: UnisonHTNodeConfig }[];
}
