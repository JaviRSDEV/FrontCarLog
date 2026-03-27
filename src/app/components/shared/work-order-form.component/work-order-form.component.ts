import { WorkOrderService } from './../../../services/workOrderService/work-order.service';
import { Component, input, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-work-order-form.component',
  imports: [ReactiveFormsModule],
  templateUrl: './work-order-form.component.html',
  styleUrl: './work-order-form.component.css',
})
export class WorkOrderFormComponent implements OnInit{

  @Input() userDni: string = '';
  @Output() guardado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  workOrderForm!: FormGroup;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkOrderService
  ) {}

  ngOnInit(): void {
    this.workOrderForm = this.fb.group({
      vehiclePlate: ['', [Validators.required, Validators.pattern(/^[0-9]{4}[A-Z]{3}$/i)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(){
    this.mensajeError = '';

    if(this.workOrderForm.valid){
      const formValue = this.workOrderForm.value;

      const nuevaOrden = {
        vehiclePlate: formValue.vehiclePlate.toUpperCase(),
        description: formValue.description
      };

      this.workOrderService.createWorkOrder(nuevaOrden).subscribe({
        next: () => {
          this.guardado.emit();
        },
        error: (err: any) => {
          console.error(err);
          this.mensajeError = err.error?.message || 'Error al crear la orden de trabajo. Comprueba los datos introducidos';
        }
      });
    }else{
      this.workOrderForm.markAllAsTouched();
    }
  }

  onCancelar(){
    this.cancelado.emit();
  }
}
