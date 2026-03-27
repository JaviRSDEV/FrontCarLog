import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderFormComponent } from './work-order-form.component';

describe('WorkOrderFormComponent', () => {
  let component: WorkOrderFormComponent;
  let fixture: ComponentFixture<WorkOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkOrderFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
