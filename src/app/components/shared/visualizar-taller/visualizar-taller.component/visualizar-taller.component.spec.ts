import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarTallerComponent } from './visualizar-taller.component';

describe('VisualizarTallerComponent', () => {
  let component: VisualizarTallerComponent;
  let fixture: ComponentFixture<VisualizarTallerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarTallerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizarTallerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
