import { Component, OnInit } from '@angular/core';
import { GetGraphResponseEdge } from 'src/generated/models/GetGraphResponseEdge';
import { GetGraphResponseNode } from 'src/generated/models/GetGraphResponseNode';
import { GraphService } from 'src/services/graph.service';
import {
  EdgeClickEvent,
  NodeClickEvent,
} from './components/config-graph/config-graph.component';

@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit {
  nodes?: GetGraphResponseNode[];
  edges?: GetGraphResponseEdge[];
  selectedIds: string[] = [];

  constructor(private graphService: GraphService) {}

  ngOnInit(): void {
    this.refresh();
  }

  private async refresh(): Promise<void> {
    const resp = await this.graphService.getGraph();
    this.nodes = resp.nodes;
    this.edges = resp.edges;
  }

  handleNodeClick(event: NodeClickEvent): void {
    this.selectedIds = [event.nodeId];
  }

  handleEdgeClick(event: EdgeClickEvent): void {
    this.selectedIds = [event.edgeId];
  }

  handleWhitespaceClick(): void {
    this.selectedIds = [];
  }
}
