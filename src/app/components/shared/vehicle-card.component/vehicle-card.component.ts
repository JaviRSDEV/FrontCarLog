import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.css',
})
export class VehicleCardComponent {
  vehiculo = input.required<Vehicle>();
  modoFlota = input<boolean>(false);
  verDetalles = output<Vehicle>();
  salida = output<string>();
  aprobar = output<string>();
  rechazar = output<string>();
  historial = output<string>();
  imagenPortada = computed(() => {
    const v = this.vehiculo();
    if (v.images && v.images.length > 0) {
      return v.images[0];
    }
    return this.modoFlota()
      ? 'https://placehold.co/600x400?text=Flota'
      : 'https://placehold.co/600x400?text=Coche';
  });

  onDetalles() {
    this.verDetalles.emit(this.vehiculo());
  }

  onSalida() {
    this.salida.emit(this.vehiculo().plate);
  }

  onAprobar() {
    this.aprobar.emit(this.vehiculo().plate);
  }

  onRechazar() {
    this.rechazar.emit(this.vehiculo().plate);
  }

  onHistorial() {
    this.historial.emit(this.vehiculo().plate);
  }
}
