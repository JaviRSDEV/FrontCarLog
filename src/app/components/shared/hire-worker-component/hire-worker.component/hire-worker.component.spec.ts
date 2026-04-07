import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HireWorkerComponent } from './hire-worker.component';

describe('HireWorkerComponent', () => {
  let component: HireWorkerComponent;
  let fixture: ComponentFixture<HireWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HireWorkerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HireWorkerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
