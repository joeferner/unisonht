import { Component, Input } from '@angular/core';
import { UnisonHTNodeConfig } from 'src/generated';

@Component({
  selector: '[app-config-graph-node]',
  templateUrl: './config-graph-node.component.svg',
  styleUrls: ['./config-graph-node.component.scss']
})
export class ConfigGraphNodeComponent {
  @Input() node!: UnisonHTNodeConfig;
}
