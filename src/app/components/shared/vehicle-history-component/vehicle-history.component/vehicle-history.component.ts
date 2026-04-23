import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { VehicleService } from '../../../../services/vehicleService/vehicle.service';
import { Workorder } from '../../../../models/workorder';
import { Page } from '../../../../models/page.model';

@Component({
  selector: 'app-vehicle-history.component',
  standalone: true,
  imports: [UpperCasePipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './vehicle-history.component.html',
  styleUrl: './vehicle-history.component.css',
})
export class VehicleHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vehicleService = inject(VehicleService);
  private readonly destroy$ = inject(DestroyRef);

  matricula = signal<string>('');
  historial = signal<Workorder[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit(): void {
    const plate = this.route.snapshot.paramMap.get('plate') || '';
    this.matricula.set(plate);

    if (this.matricula()) {
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.cargando.set(true);

    this.vehicleService
      .getHistoryByPlate(this.matricula())
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (data: Page<Workorder>) => {
          this.historial.set(data.content);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error al cargar el historial:', err);
          this.cargando.set(false);
        },
      });
  }
}
