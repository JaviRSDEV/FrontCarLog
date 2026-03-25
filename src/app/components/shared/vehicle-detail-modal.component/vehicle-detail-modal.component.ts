import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-detail-modal.component.html',
  styleUrl: './vehicle-detail-modal.component.css'
})
export class VehicleDetailModalComponent {
  @Input() vehiculo!: Vehicle;

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Vehicle>();
  @Output() eliminar = new EventEmitter<string>();

  onCerrar() {
    this.cerrarModal.emit();
  }

  onEditar() {
    this.editar.emit(this.vehiculo);
  }

  onEliminar() {
    this.eliminar.emit(this.vehiculo.plate);
  }
}
