import { Component, Input } from '@angular/core';
import { UnisonHTNodeConfig } from 'src/generated';

@Component({
  selector: 'app-config-graph',
  templateUrl: './config-graph.component.svg',
  styleUrls: ['./config-graph.component.scss'],
})
export class ConfigGraphComponent {
  @Input() nodes!: UnisonHTNodeConfig[];
  @Input() viewBox!: string;
}
