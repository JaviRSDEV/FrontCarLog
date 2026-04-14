import { Component, input, output, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrderLine } from '../../../models/workorderline';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-work-order-lines',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, CommonModule],
  templateUrl: './work-order-lines.component.html',
  styleUrl: './work-order-lines.component.css', // Opcional
})
export class WorkOrderLinesComponent {
  lineas = input.required<WorkOrderLine[]>();
  isReadOnly = input<boolean>(false);
  totalAmount = input<number>(0);

  onAdd = output<any>();
  onDelete = output<number>();
  onUpdate = output<{ lineId: number; data: any }>();

  nuevaLinea = { concept: '', quantity: 1, pricePerUnit: 0, IVA: 21, discount: 0 };

  editandoId = signal<number | null>(null);
  lineaEnEdicion: any = null;

  agregarLinea() {
    if (!this.nuevaLinea.concept) return;
    this.onAdd.emit(this.nuevaLinea);

    this.nuevaLinea = { concept: '', quantity: 1, pricePerUnit: 0, IVA: 21, discount: 0 };
  }

  eliminarLinea(id: number) {
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
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.onDelete.emit(id);
      }
    });
  }

  iniciarEdicion(linea: WorkOrderLine) {
    this.editandoId.set(linea.id);
    this.lineaEnEdicion = { ...linea };
  }

  cancelarEdicion() {
    this.editandoId.set(null);
    this.lineaEnEdicion = null;
  }

  guardarEdicion() {
    if (!this.lineaEnEdicion) return;
    this.onUpdate.emit({
      lineId: this.lineaEnEdicion.id,
      data: this.lineaEnEdicion,
    });
    this.cancelarEdicion();
  }
}
