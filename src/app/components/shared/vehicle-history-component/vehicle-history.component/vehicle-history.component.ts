import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { VehicleService } from '../../../../services/vehicleService/vehicle.service';

@Component({
  selector: 'app-vehicle-history.component',
  standalone: true,
  imports: [UpperCasePipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './vehicle-history.component.html',
  styleUrl: './vehicle-history.component.css',
})
export class VehicleHistoryComponent implements OnInit {
  matricula: string = '';
  historial: any[] = [];

  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.matricula = this.route.snapshot.paramMap.get('plate') || '';

    if (this.matricula) {
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.vehicleService.getHistoryByPlate(this.matricula).subscribe({
      next: (data: any) => {
        this.historial = data;
        this.cargando = false;

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error al cargar el historial:', err);
        this.cargando = false;

        this.cdr.detectChanges();
      },
    });
  }
}
