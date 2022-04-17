import { Get, Route } from "tsoa";
import { UnisonHTNodeConfig } from "../../types/UnisonHTConfig";
import { UnisonHTServer } from "../../UnisonHTServer";

@Route("api/graph")
export class GraphController {
  constructor(private readonly server: UnisonHTServer) {}

  @Get("/")
  public async getGraph(): Promise<GetGraphResponse> {
    return {
      nodes: this.server.nodes.map((node) => {
        return {
          config: node.config,
          inputs: (node?.inputs ?? []).map((input) => ({ name: input.name })),
          outputs: (node?.outputs ?? []).map((output) => ({
            name: output.name,
          })),
        };
      }),
    };
  }
}

interface GetGraphResponse {
  nodes: GetGraphResponseNode[];
}

interface GetGraphResponseNode {
  config: UnisonHTNodeConfig;
  inputs: GetGraphResponseNodeInput[];
  outputs: GetGraphResponseNodeOutput[];
}

interface GetGraphResponseNodeInput {
  name: string;
}

interface GetGraphResponseNodeOutput {
  name: string;
}
