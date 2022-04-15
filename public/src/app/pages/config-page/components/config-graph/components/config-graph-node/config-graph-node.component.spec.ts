import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGraphNodeComponent } from './config-graph-node.component';

describe('ConfigGraphNodeComponent', () => {
  let component: ConfigGraphNodeComponent;
  let fixture: ComponentFixture<ConfigGraphNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigGraphNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigGraphNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
