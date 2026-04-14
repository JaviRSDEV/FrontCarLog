import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-detail-modal.component.html',
  styleUrl: './vehicle-detail-modal.component.css',
})
export class VehicleDetailModalComponent implements OnInit {
  @Input() vehiculo!: Vehicle;

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Vehicle>();
  @Output() eliminar = new EventEmitter<string>();

  currentUserDni: string = '';

  ngOnInit(): void {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserDni = user.dni;
      } catch (e) {
        console.error('Error al parsear el usuario en el modal de vehículo:', e);
      }
    }
  }

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
