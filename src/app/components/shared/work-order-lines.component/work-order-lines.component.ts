import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'; // <-- Adiós FormsModule
import { WorkOrderLine } from '../../../models/workorderline';
import Swal, { SweetAlertResult } from 'sweetalert2';

interface NewWorkOrderLine {
  concept: string;
  quantity: number;
  pricePerUnit: number;
  IVA: number;
  discount: number;
}

@Component({
  selector: 'app-work-order-lines',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, CommonModule],
  templateUrl: './work-order-lines.component.html',
  styleUrl: './work-order-lines.component.css',
})
export class WorkOrderLinesComponent {
  lineas = input.required<WorkOrderLine[]>();
  isReadOnly = input<boolean>(false);
  totalAmount = input<number>(0);

  Add = output<NewWorkOrderLine>();
  Delete = output<number>();
  Update = output<{ lineId: number; data: Partial<WorkOrderLine> }>();

  private readonly fb = inject(FormBuilder);

  formNuevaLinea = this.fb.nonNullable.group({
    concept: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0)]],
    IVA: [21, [Validators.required, Validators.min(0)]],
    discount: [0, [Validators.min(0)]],
  });

  formEdicion = this.fb.nonNullable.group({
    concept: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    pricePerUnit: [0, [Validators.required, Validators.min(0)]],
    IVA: [21, [Validators.required, Validators.min(0)]],
    discount: [0, [Validators.min(0)]],
  });

  editandoId = signal<number | null>(null);

  agregarLinea(): void {
    if (this.formNuevaLinea.invalid) return;
    this.Add.emit(this.formNuevaLinea.getRawValue());
    this.formNuevaLinea.reset();
  }

  eliminarLinea(id: number): void {
    Swal.fire({
      title: '¿Borrar línea?',
      text: 'Vas a eliminar esta línea de la orden. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-trash"></i> Sí, borrar',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.Delete.emit(id);
      }
    });
  }

  iniciarEdicion(linea: WorkOrderLine) {
    this.editandoId.set(linea.id);

    this.formEdicion.patchValue({
      concept: linea.concept,
      quantity: linea.quantity,
      pricePerUnit: linea.pricePerUnit,
      IVA: linea.IVA,
      discount: linea.discount,
    });
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.formEdicion.reset();
  }

  guardarEdicion() {
    const idActual = this.editandoId();

    if (!idActual || this.formEdicion.invalid) return;

    this.Update.emit({
      lineId: idActual,
      data: this.formEdicion.getRawValue(),
    });

    this.cancelarEdicion();
  }
}
