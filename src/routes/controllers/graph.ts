import { Get, Route } from "tsoa";
import {
  UnisonHTEdgeConfig,
  UnisonHTNodeConfig,
} from "../../types/UnisonHTConfig";
import { UnisonHTServer } from "../../UnisonHTServer";

@Route("api/graph")
export class GraphController {
  constructor(private readonly server: UnisonHTServer) {}

  @Get("/")
  public async getGraph(): Promise<GetGraphResponse> {
    return {
      nodes: this.server.nodes.map((node) => {
        return {
          id: node.id,
          name: node.name,
          config: node.config,
          inputs: (node?.inputs ?? []).map((input) => ({ name: input.name })),
          outputs: (node?.outputs ?? []).map((output) => ({
            name: output.name,
          })),
        };
      }),
      edges: this.server.edges.map((edge) => {
        return {
          config: edge.config,
        };
      }),
    };
  }
}

interface GetGraphResponse {
  nodes: GetGraphResponseNode[];
  edges: GetGraphResponseEdge[];
}

interface GetGraphResponseNode {
  id: string;
  name: string;
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

interface GetGraphResponseEdge {
  config: UnisonHTEdgeConfig;
}
