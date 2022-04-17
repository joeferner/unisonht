import { Component, OnInit } from '@angular/core';
import { GetGraphResponseEdge } from 'src/generated/models/GetGraphResponseEdge';
import { GetGraphResponseNode } from 'src/generated/models/GetGraphResponseNode';
import { GraphService } from 'src/services/graph.service';

@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit {
  nodes?: GetGraphResponseNode[];
  edges?: GetGraphResponseEdge[];

  constructor(private graphService: GraphService) {}

  ngOnInit(): void {
    this.refresh();
  }

  private async refresh(): Promise<void> {
    const resp = await this.graphService.getGraph();
    this.nodes = resp.nodes;
    this.edges = resp.edges;
  }
}
