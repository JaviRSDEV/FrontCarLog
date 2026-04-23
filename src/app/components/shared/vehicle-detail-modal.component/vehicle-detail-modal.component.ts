import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../models/vehicle';
import { Auth } from '../../../services/authService/auth.service';

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-detail-modal.component.html',
  styleUrl: './vehicle-detail-modal.component.css',
})
export class VehicleDetailModalComponent implements OnInit {
  vehiculo = input.required<Vehicle>();
  cerrarModal = output<void>();
  editar = output<Vehicle>();
  eliminar = output<string>();

  private readonly authService = inject(Auth);
  currentUserDni = signal<string>('');

  ngOnInit(): void {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserDni.set(user.dni || '');
      } catch (e) {
        console.error('Error al parsear el usuario en el modal de vehículo:', e);
      }
    }
  }

  onCerrar() {
    this.cerrarModal.emit();
  }

  onEditar() {
    this.editar.emit(this.vehiculo());
  }

  onEliminar() {
    this.eliminar.emit(this.vehiculo().plate);
  }
}
