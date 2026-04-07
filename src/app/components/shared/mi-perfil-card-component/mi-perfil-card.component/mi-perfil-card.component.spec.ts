import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiPerfilCardComponent } from './mi-perfil-card.component';

describe('MiPerfilCardComponent', () => {
  let component: MiPerfilCardComponent;
  let fixture: ComponentFixture<MiPerfilCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiPerfilCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfilCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
