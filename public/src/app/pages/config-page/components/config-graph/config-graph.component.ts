import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GetGraphResponseEdge } from 'src/generated/models/GetGraphResponseEdge';
import { GetGraphResponseNode } from 'src/generated/models/GetGraphResponseNode';
import { roundRect, truncateString } from 'src/utils/canvas-utils';

const backgroundColor = 'rgb(0,0,0)';
const foregroundColor = 'rgb(255,255,255)';
const nodeBackgroundColor = 'rgb(50,50,50)';
const nodeWidth = 150;
const nodeMargin = 5;
const nodeRectRadius = 5;
const titleHeight = 14;
const ioHeight = 12;
const ioLineLength = 10;
const ioMargin = 5;

@Component({
  selector: 'app-config-graph',
  templateUrl: './config-graph.component.html',
  styleUrls: ['./config-graph.component.scss'],
})
export class ConfigGraphComponent implements OnChanges {
  @Input() nodes!: GetGraphResponseNode[];
  @Input() edges!: GetGraphResponseEdge[];
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  width = 100;
  height = 100;

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
        this.changeDetector.detectChanges();
        this.refresh();
      }).observe(elemRef.nativeElement);
    }
  }

  @ViewChild('graph') set graph(
    elemRef: ElementRef<HTMLCanvasElement> | undefined
  ) {
    if (elemRef?.nativeElement) {
      this.canvas = elemRef.nativeElement;
      this.ctx = this.canvas.getContext('2d') ?? undefined;
      this.refresh();
    } else {
      this.canvas = undefined;
      this.ctx = undefined;
    }
    this.refresh();
  }

  refresh() {
    if (!this.ctx || !this.canvas) {
      return;
    }

    const canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = this.width;
    canvasBuffer.height = this.height;
    const ctx = canvasBuffer.getContext('2d');
    if (!ctx) {
      return;
    }

    // clear
    ctx.fillStyle = backgroundColor;
    ctx.rect(0, 0, canvasBuffer.width, canvasBuffer.height);
    ctx.fill();

    const nodeData = ConfigGraphComponent.drawNodes(ctx, this.nodes);
    ConfigGraphComponent.drawEdges(ctx, this.edges, nodeData);

    this.ctx.drawImage(canvasBuffer, 0, 0);
  }

  static drawNodes(
    ctx: CanvasRenderingContext2D,
    nodes: GetGraphResponseNode[]
  ): NodeDrawData[] {
    let y = 5;
    let x = 20;
    return nodes.map((node) => {
      const ioCount = Math.max(node.inputs.length, node.outputs.length);
      const nodeHeight =
        nodeMargin + titleHeight + ioCount * (ioHeight + ioMargin) + nodeMargin;
      const title = truncateString(ctx, node.name, nodeWidth - 2 * nodeMargin);

      const nodeData: NodeDrawData = {
        id: node.id,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        inputs: {},
        outputs: {},
      };

      ctx.lineWidth = 1;
      ctx.strokeStyle = foregroundColor;
      ctx.fillStyle = nodeBackgroundColor;
      roundRect(ctx, x, y, nodeWidth, nodeHeight, nodeRectRadius, true, true);

      // title
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.font = `bold ${titleHeight}px Arial`;
      ctx.strokeStyle = foregroundColor;
      ctx.fillStyle = foregroundColor;
      ctx.fillText(title, x + nodeMargin, y + nodeMargin);

      // inputs
      {
        let inputY = y + nodeMargin + titleHeight + ioMargin;
        for (const input of node.inputs) {
          ctx.moveTo(x, inputY + ioHeight / 2);
          ctx.lineTo(x - ioLineLength, inputY + ioHeight / 2);
          ctx.stroke();

          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.font = `${ioHeight}px Arial`;
          ctx.fillText(input.name, x + nodeMargin, inputY);

          nodeData.inputs[input.name] = {
            x: x - ioLineLength,
            y: inputY + ioHeight / 2,
          };

          inputY += ioHeight;
        }
      }

      // outputs
      {
        let outputY = y + nodeMargin + titleHeight + ioMargin;
        for (const output of node.outputs) {
          ctx.moveTo(x + nodeWidth, outputY + ioHeight / 2);
          ctx.lineTo(x + nodeWidth + ioLineLength, outputY + ioHeight / 2);
          ctx.stroke();

          ctx.textBaseline = 'top';
          ctx.textAlign = 'right';
          ctx.font = `${ioHeight}px Arial`;
          ctx.fillText(output.name, x + nodeWidth - nodeMargin, outputY);

          nodeData.outputs[output.name] = {
            x: x + nodeWidth + ioLineLength,
            y: outputY + ioHeight / 2,
          };

          outputY += ioHeight;
        }
      }

      y += nodeHeight + 5;
      x += 200;

      return nodeData;
    });
  }

  static drawEdges(
    ctx: CanvasRenderingContext2D,
    edges: GetGraphResponseEdge[],
    nodeData: NodeDrawData[]
  ) {
    for (const edge of edges) {
      const fromNode = nodeData.find((n) => n.id === edge.config.fromNodeId);
      if (!fromNode) {
        throw new Error(
          `could not find from node ${edge.config.fromNodeId} for edge id ${edge.config.id}`
        );
      }
      const outputData = fromNode.outputs[edge.config.fromNodeOutput];
      if (!outputData) {
        throw new Error(
          `could not find output ${edge.config.fromNodeOutput} for edge id ${edge.config.id}`
        );
      }

      const toNode = nodeData.find((n) => n.id === edge.config.toNodeId);
      if (!toNode) {
        throw new Error(
          `could not find to node ${edge.config.toNodeId} for edge id ${edge.config.id}`
        );
      }
      const inputData = toNode.inputs[edge.config.toNodeInput];
      if (!inputData) {
        throw new Error(
          `could not find input ${edge.config.toNodeInput} for edge id ${edge.config.id}`
        );
      }

      ctx.strokeStyle = foregroundColor;
      ctx.fillStyle = 'none';
      ctx.moveTo(outputData.x, outputData.y);
      ctx.bezierCurveTo(
        outputData.x + 50,
        outputData.y,
        inputData.x - 50,
        inputData.y,
        inputData.x,
        inputData.y
      );
      ctx.stroke();
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
