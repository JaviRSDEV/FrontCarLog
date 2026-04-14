import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-work-order-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './work-order-form.component.html',
  styleUrl: './work-order-form.component.css',
})
export class WorkOrderFormComponent implements OnInit {
  @Input() userDni: string = '';
  @Input() workshopId: number = 0;
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  workOrderForm!: FormGroup;
  mensajeError: string = '';

  vehiculosFlota: Vehicle[] = [];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService,
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.workOrderForm = this.fb.group({
      vehiclePlate: ['', [Validators.required, Validators.pattern(/^[0-9]{4}[A-Z]{3}$/i)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    if (!this.workshopId) return;
    this.vehicleService.getVehiclesByWorkshop(this.workshopId).subscribe({
      next: (data: Vehicle[]) => {
        this.vehiculosFlota = data;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.mensajeError = 'No se pudieron cargar los vehículos del taller';
      },
    });
  }

  onSubmit(): void {
    this.mensajeError = '';

    if (this.workOrderForm.valid) {
      const formValue = this.workOrderForm.value;

      const nuevaOrden = {
        vehiclePlate: (formValue.vehiclePlate as string).toUpperCase(),
        description: formValue.description as string,
      };

      this.workOrderService.createWorkOrder(nuevaOrden).subscribe({
        next: () => {
          this.guardado.emit();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.mensajeError =
            err.error?.message ||
            'Error al crear la orden de trabajo. Comprueba los datos introducidos';
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
