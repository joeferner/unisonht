import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { GetGraphResponseEdge } from 'src/generated/models/GetGraphResponseEdge';
import { GetGraphResponseNode } from 'src/generated/models/GetGraphResponseNode';
import { roundRect, truncateString } from 'src/utils/canvas-utils';
import dagre from 'dagre';

declare var Blockly: any;

const backgroundColor = 'rgb(0,0,0)';
const foregroundColor = 'rgb(255,255,255)';
const nodeBackgroundColor = 'rgb(50,50,50)';
const nodeWidth = 150;
const nodeMargin = 5;
const nodeRectRadius = 3;
const titleHeight = 14;
const ioHeight = 12;
const ioLineLength = 10;
const ioMargin = 5;
const edgeBezierCurveStrength = 50;
const selectedLineWidth = 3;
const selectedNodeBackgroundColor = 'rgb(100,100,100)';

@Component({
  selector: 'app-config-graph',
  templateUrl: './config-graph.component.html',
  styleUrls: ['./config-graph.component.scss'],
})
export class ConfigGraphComponent implements OnChanges {
  @Input() nodes!: GetGraphResponseNode[];
  @Input() edges!: GetGraphResponseEdge[];
  @Input() selectedIds: string[] = [];

  @Output() nodeClick = new EventEmitter<NodeClickEvent>();
  @Output() edgeClick = new EventEmitter<EdgeClickEvent>();
  @Output() whitespaceClick = new EventEmitter<void>();

  blocklyDiv?: HTMLDivElement;
  width = 100;
  height = 100;
  workspace: any;

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(): void {
    this.refresh();
  }

  @ViewChild('graphWrapper') set graphWrapper(
    elemRef: ElementRef<HTMLDivElement> | undefined
  ) {
    if (elemRef?.nativeElement) {
      const elem = elemRef.nativeElement;
      new ResizeObserver(() => {
        this.width = elem.offsetWidth;
        this.height = elem.offsetHeight;
        if (this.workspace) {
          setTimeout(() => {
            Blockly.svgResize(this.workspace);
          });
        }
        this.changeDetector.detectChanges();
        this.refresh();
      }).observe(elemRef.nativeElement);
    }
  }

  @ViewChild('blockly') set graph(
    elemRef: ElementRef<HTMLDivElement> | undefined
  ) {
    if (!this.blocklyDiv && elemRef?.nativeElement) {
      Blockly.Blocks['unisonht_setmode'] = {
        init: function () {
          this.jsonInit({
            type: 'unisonht_setmode',
            message0: 'Set Mode %1 %2',
            args0: [
              {
                type: 'input_dummy',
              },
              {
                type: 'input_value',
                name: 'NAME',
              },
            ],
            inputsInline: true,
            previousStatement: null,
            nextStatement: null,
            colour: 230,
            tooltip: '',
            helpUrl: '',
          });
        },
      };
      Blockly.JavaScript['unisonht_setmode'] = (block: any) => {
        const value_name = Blockly.JavaScript.valueToCode(
          block,
          'NAME',
          Blockly.JavaScript.ORDER_ATOMIC
        );
        return `await doIt(${value_name});`;
      };

      const toolbox = {
        kind: 'flyoutToolbox',
        contents: [
          {
            kind: 'block',
            type: 'unisonht_setmode',
          },
          {
            kind: 'block',
            type: 'text',
          },
        ],
      };
      this.workspace = Blockly.inject(elemRef.nativeElement, {
        toolbox: toolbox,
      });
    }
    this.blocklyDiv = elemRef?.nativeElement;
    this.refresh();
  }

  generate(): void {
    const b = this.workspace.getAllBlocks()[0];

    Blockly.JavaScript.init(this.workspace);
    console.log(Blockly.JavaScript.blockToCode(b));
    const code = Blockly.JavaScript.workspaceToCode(this.workspace);
    console.log(code);
  }

  get blocklyStyle(): string {
    return `width: ${this.width}px; height: ${this.height}px;`;
  }

  private refresh() {
    if (!this.blocklyDiv) {
      return;
    }
  }
}

interface NodeDrawData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: { [name: string]: NodeDrawIoData };
  outputs: { [name: string]: NodeDrawIoData };
}

interface NodeDrawIoData {
  x: number;
  y: number;
}

export interface NodeClickEvent {
  nodeId: string;
}

export interface EdgeClickEvent {
  edgeId: string;
}
