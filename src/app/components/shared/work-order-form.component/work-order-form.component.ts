import { Component, OnInit, inject, input, output, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkOrderService } from '../../../services/workOrderService/work-order.service';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { Page } from '../../../models/page.model';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './work-order-form.component.html',
  styleUrl: './work-order-form.component.css',
})
export class WorkOrderFormComponent implements OnInit {
  userDni = input<string>('');
  guardado = output<void>();
  cancelado = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly workOrderService = inject(WorkOrderService);
  private readonly vehicleService = inject(VehicleService);
  private readonly destroy$ = inject(DestroyRef);

  mensajeError = signal<string>('');
  vehiculosFlota = signal<Vehicle[]>([]);
  workOrderForm = this.fb.nonNullable.group({
    vehiclePlate: ['', [Validators.required, Validators.pattern(/^\d{4}[A-Z]{3}$/i)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.vehicleService
      .getAllVehicles()
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (data: Page<Vehicle>) => {
          this.vehiculosFlota.set(data.content);
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.mensajeError.set('No se pudieron cargar los vehículos del taller');
        },
      });
  }

  onSubmit(): void {
    this.mensajeError.set('');

    if (this.workOrderForm.valid) {
      const formValue = this.workOrderForm.getRawValue();

      const nuevaOrden = {
        vehiclePlate: formValue.vehiclePlate.toUpperCase(),
        description: formValue.description,
      };

      this.workOrderService
        .createWorkOrder(nuevaOrden)
        .pipe(takeUntilDestroyed(this.destroy$))
        .subscribe({
          next: () => {
            this.guardado.emit();
          },
          error: (err: HttpErrorResponse) => {
            console.error(err);
            this.mensajeError.set(
              err.error?.message ||
                'Error al crear la orden de trabajo. Comprueba los datos introducidos',
            );
          },
        });
    } else {
      this.workOrderForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    this.cancelado.emit();
  }
}
