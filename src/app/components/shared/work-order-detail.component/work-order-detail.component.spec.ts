import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderDetailComponent } from './work-order-detail.component';

describe('WorkOrderDetailComponent', () => {
  let component: WorkOrderDetailComponent;
  let fixture: ComponentFixture<WorkOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
