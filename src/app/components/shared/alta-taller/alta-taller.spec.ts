import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaTaller } from './alta-taller.component';

describe('AltaTaller', () => {
  let component: AltaTaller;
  let fixture: ComponentFixture<AltaTaller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AltaTaller],
    }).compileComponents();

    fixture = TestBed.createComponent(AltaTaller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
