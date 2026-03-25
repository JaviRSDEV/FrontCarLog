import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleDetailModalComponent } from './vehicle-detail-modal.component';

describe('VehicleDetailModalComponent', () => {
  let component: VehicleDetailModalComponent;
  let fixture: ComponentFixture<VehicleDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleDetailModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleDetailModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
