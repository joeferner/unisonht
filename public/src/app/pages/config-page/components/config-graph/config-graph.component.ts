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

  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  nodeData?: NodeDrawData[];
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

  handleCanvasClick(event: MouseEvent): void {
    if (!this.nodeData || !this.canvas) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const nodeId = this.findNodeAt(x, y);
    if (nodeId) {
      this.nodeClick.emit({ nodeId: nodeId });
      return;
    }

    const edgeId = this.findEdgeAt(x, y);
    if (edgeId) {
      this.edgeClick.emit({ edgeId: edgeId });
      return;
    }

    this.whitespaceClick.emit();
  }

  findEdgeAt(x: number, y: number): string | undefined {
    if (!this.nodeData) {
      return undefined;
    }

    const canvasBuffer = document.createElement('canvas');
    canvasBuffer.width = this.width;
    canvasBuffer.height = this.height;
    const ctx = canvasBuffer.getContext('2d');
    if (!ctx) {
      return undefined;
    }

    ConfigGraphComponent.clear(
      ctx,
      canvasBuffer.width,
      canvasBuffer.height,
      '#000000'
    );
    for (const edge of this.edges) {
      ConfigGraphComponent.drawEdge(ctx, edge, this.nodeData, '#ffffff', 15);
      const data = ctx.getImageData(x, y, 1, 1).data;
      if (data[0] === 255 && data[1] === 255 && data[2] === 255) {
        return edge.config.id;
      }
    }

    return undefined;
  }

  findNodeAt(x: number, y: number): string | undefined {
    return this.nodeData?.find(
      (n) => x >= n.x && y >= n.y && x < n.x + n.width && y < n.y + n.height
    )?.id;
  }

  private refresh() {
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

    let nodeData = ConfigGraphComponent.drawNodes(ctx, this.nodes, this.edges);
    nodeData = ConfigGraphComponent.layoutGraph(nodeData, this.edges);

    ConfigGraphComponent.clear(ctx, canvasBuffer.width, canvasBuffer.height);
    nodeData = ConfigGraphComponent.drawNodes(
      ctx,
      this.nodes,
      this.edges,
      this.selectedIds,
      nodeData
    );
    ConfigGraphComponent.drawEdges(ctx, this.edges, nodeData, this.selectedIds);

    this.ctx.drawImage(canvasBuffer, 0, 0);

    this.nodeData = nodeData;
  }

  private static clear(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    color = backgroundColor
  ): void {
    ctx.fillStyle = color;
    ctx.rect(0, 0, width, height);
    ctx.fill();
  }

  private static drawNodes(
    ctx: CanvasRenderingContext2D,
    nodes: GetGraphResponseNode[],
    edges: GetGraphResponseEdge[],
    selectedIds?: string[],
    layoutData?: NodeDrawData[]
  ): NodeDrawData[] {
    let y = 5;
    let x = 20;
    return nodes.map((node) => {
      const nodeLayoutData = layoutData?.find((n) => n.id === node.id);
      if (nodeLayoutData) {
        x = nodeLayoutData.x;
        y = nodeLayoutData.y;
      }

      const ioCount = Math.max(node.inputs.length, node.outputs.length);
      const nodeHeight =
        nodeMargin + titleHeight + ioCount * (ioHeight + ioMargin) + nodeMargin;
      const title = truncateString(ctx, node.name, nodeWidth - 2 * nodeMargin);
      const selected = selectedIds?.includes(node.id);

      const nodeData: NodeDrawData = {
        id: node.id,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
        inputs: {},
        outputs: {},
      };

      ctx.lineWidth = selected ? selectedLineWidth : 1;
      ctx.strokeStyle = foregroundColor;
      ctx.fillStyle = selected
        ? selectedNodeBackgroundColor
        : nodeBackgroundColor;
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
          const edgeConnected = edges.some(
            (e) =>
              e.config.toNodeId === node.id &&
              e.config.toNodeInput === input.name
          );
          if (!edgeConnected) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(x, inputY + ioHeight / 2);
            ctx.lineTo(x - ioLineLength, inputY + ioHeight / 2);
            ctx.stroke();
          }

          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.font = `${ioHeight}px Arial`;
          ctx.fillText(input.name, x + nodeMargin, inputY);

          nodeData.inputs[input.name] = {
            x: x,
            y: inputY + ioHeight / 2,
          };

          inputY += ioHeight;
        }
      }

      // outputs
      {
        let outputY = y + nodeMargin + titleHeight + ioMargin;
        for (const output of node.outputs) {
          const edgeConnected = edges.some(
            (e) =>
              e.config.fromNodeId === node.id &&
              e.config.fromNodeOutput === output.name
          );
          if (!edgeConnected) {
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.moveTo(x + nodeWidth, outputY + ioHeight / 2);
            ctx.lineTo(x + nodeWidth + ioLineLength, outputY + ioHeight / 2);
            ctx.stroke();
          }

          ctx.textBaseline = 'top';
          ctx.textAlign = 'right';
          ctx.font = `${ioHeight}px Arial`;
          ctx.fillText(output.name, x + nodeWidth - nodeMargin, outputY);

          nodeData.outputs[output.name] = {
            x: x + nodeWidth,
            y: outputY + ioHeight / 2,
          };

          outputY += ioHeight;
        }
      }

      y += nodeHeight + 5;

      return nodeData;
    });
  }

  private static drawEdges(
    ctx: CanvasRenderingContext2D,
    edges: GetGraphResponseEdge[],
    nodeData: NodeDrawData[],
    selectedIds: string[]
  ) {
    for (const edge of edges) {
      const selected = selectedIds?.includes(edge.config.id);
      const lineWidth = selected ? selectedLineWidth : 1;
      ConfigGraphComponent.drawEdge(
        ctx,
        edge,
        nodeData,
        foregroundColor,
        lineWidth
      );
    }
  }

  private static drawEdge(
    ctx: CanvasRenderingContext2D,
    edge: GetGraphResponseEdge,
    nodeData: NodeDrawData[],
    color = foregroundColor,
    lineWidth = 1
  ) {
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

    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.fillStyle = 'none';
    ctx.moveTo(outputData.x, outputData.y);
    ctx.bezierCurveTo(
      outputData.x + edgeBezierCurveStrength,
      outputData.y,
      inputData.x - edgeBezierCurveStrength,
      inputData.y,
      inputData.x,
      inputData.y
    );
    ctx.stroke();
  }

  static layoutGraph(
    nodeData: NodeDrawData[],
    edges: GetGraphResponseEdge[]
  ): NodeDrawData[] {
    const g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'LR',
      ranksep: edgeBezierCurveStrength * 2,
    });
    g.setDefaultEdgeLabel(() => ({}));
    for (const node of nodeData) {
      g.setNode(node.id, { width: node.width, height: node.height });
    }
    for (const edge of edges) {
      g.setEdge(edge.config.fromNodeId, edge.config.toNodeId);
    }
    dagre.layout(g);
    for (const node of nodeData) {
      const gNode = g.node(node.id);
      node.x = gNode.x;
      node.y = gNode.y;
    }
    return nodeData;
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
