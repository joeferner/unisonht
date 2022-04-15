import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as cytoscape from 'cytoscape';

@Component({
  selector: 'app-config-graph',
  templateUrl: './config-graph.component.html',
  styleUrls: ['./config-graph.component.scss'],
})
export class ConfigGraphComponent {
  cy: any;

  @ViewChild('graph') set graph(c: ElementRef<HTMLDivElement>) {
    if (c?.nativeElement) {
      console.log('creating cytoscape graph');
      this.cy = cytoscape({
        container: c.nativeElement,
        elements: [
          {
            data: { id: 'a' },
          },
          {
            data: { id: 'b' },
          },
          {
            data: { id: 'ab', source: 'a', target: 'b' },
          },
        ],

        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              label: 'data(id)',
            },
          },

          {
            selector: 'edge',
            style: {
              width: 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'source-endpoint': '50% 10px',
              'target-endpoint': '270deg',
              'loop-direction': '100deg',
              'loop-sweep': '-20deg',
              'control-point-step-size': 72,
            },
          },
        ],

        layout: {
          name: 'grid',
          rows: 1,
        },
      });
    } else {
      this.cy = undefined;
    }
  }
}
