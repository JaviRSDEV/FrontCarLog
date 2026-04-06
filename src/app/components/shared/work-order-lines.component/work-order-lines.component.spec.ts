import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderLinesComponent } from './work-order-lines.component';

describe('WorkOrderLinesComponent', () => {
  let component: WorkOrderLinesComponent;
  let fixture: ComponentFixture<WorkOrderLinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderLinesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderLinesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
