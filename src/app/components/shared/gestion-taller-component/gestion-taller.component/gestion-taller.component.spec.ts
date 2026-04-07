import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTallerComponent } from './gestion-taller.component';

describe('GestionTallerComponent', () => {
  let component: GestionTallerComponent;
  let fixture: ComponentFixture<GestionTallerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTallerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionTallerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
