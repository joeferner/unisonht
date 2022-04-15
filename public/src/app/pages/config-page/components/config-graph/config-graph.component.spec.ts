import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigGraphComponent } from './config-graph.component';

describe('ConfigGraphComponent', () => {
  let component: ConfigGraphComponent;
  let fixture: ComponentFixture<ConfigGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
