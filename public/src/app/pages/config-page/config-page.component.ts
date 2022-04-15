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
  viewBox = "0 0 100 100";

  constructor(private graphService: GraphService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.refresh();
  }

  private async refresh(): Promise<void> {
    const resp = await this.graphService.getGraph();
    this.nodes = resp.nodes.map(n => n.config);
  }

  @ViewChild("graphWrapper") set graphWrapper(elemRef: ElementRef<HTMLDivElement> | undefined) {
    if (elemRef?.nativeElement) {
      const elem = elemRef.nativeElement;
      new ResizeObserver(() => {
        this.viewBox = `0 0 ${elem.offsetWidth} ${elem.offsetHeight}`;
        this.changeDetector.detectChanges();
      }).observe(elemRef.nativeElement);
    }
  }
}
