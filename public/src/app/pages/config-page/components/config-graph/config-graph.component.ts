import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { UnisonHTNodeConfig } from 'src/generated';
import { roundRect } from 'src/utils/canvas-utils';

@Component({
  selector: 'app-config-graph',
  templateUrl: './config-graph.component.html',
  styleUrls: ['./config-graph.component.scss'],
})
export class ConfigGraphComponent implements OnChanges {
  @Input() nodes!: UnisonHTNodeConfig[];
  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  width = 100;
  height = 100;

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.refresh();
  }

  @ViewChild("graphWrapper") set graphWrapper(elemRef: ElementRef<HTMLDivElement> | undefined) {
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

  @ViewChild("graph") set graph(elemRef: ElementRef<HTMLCanvasElement> | undefined) {
    if (elemRef?.nativeElement) {
      this.canvas = elemRef.nativeElement;
      this.ctx = this.canvas.getContext("2d") ?? undefined;
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

    const canvasBuffer = document.createElement("canvas");
    canvasBuffer.width = this.width;
    canvasBuffer.height = this.height;
    const ctx = canvasBuffer.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const node of this.nodes) {
      ctx.lineWidth = 1;
      roundRect(ctx, 1.5, 1.5, 100, 100, 5);
    }

    this.ctx.drawImage(canvasBuffer, 0, 0);
  }
}
