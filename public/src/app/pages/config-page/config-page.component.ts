import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnisonHTNodeConfig } from 'src/generated';
import { GraphService } from 'src/services/graph.service';

@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss'],
})
export class ConfigPageComponent implements OnInit {
  nodes?: UnisonHTNodeConfig[];

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.refresh();
  }

  private async refresh(): Promise<void> {
    const resp = await this.graphService.getGraph();
    this.nodes = resp.nodes.map(n => n.config);
  }
}
