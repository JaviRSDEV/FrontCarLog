import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TallerService } from '../../../../services/tallerService/taller.service';

@Component({
  selector: 'app-mi-perfil-card',
  imports: [CommonModule],
  templateUrl: './mi-perfil-card.component.html',
  styleUrl: './mi-perfil-card.component.css',
})
export class MiPerfilCardComponent implements OnInit {
  @Input() user: any;
  workShop: any;

  constructor(
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    console.log(this.user);
    this.obtenerTaller(this.user.workShopId);
  }

  obtenerTaller(tallerId: number) {
    this.tallerService.getTallerPorId(tallerId).subscribe({
      next: (datosTaller) => {
        this.workShop = datosTaller;
        console.log('Taller cargado con éxito:', this.workShop);
        console.log('Nombre taller: ', this.workShop.workshopName);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el taller:', err);
      },
    });
  }
}
