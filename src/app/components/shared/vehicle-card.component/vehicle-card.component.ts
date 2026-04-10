import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() vehiculo!: Vehicle;
  @Input() modoFlota: boolean = false;

  @Output() verDetalles = new EventEmitter<Vehicle>();
  @Output() salida = new EventEmitter<string>();

  @Output() aprobar = new EventEmitter<string>();
  @Output() rechazar = new EventEmitter<string>();

  @Output() historial = new EventEmitter<string>();

  onDetalles() {
    this.verDetalles.emit(this.vehiculo);
  }

  onSalida() {
    this.salida.emit(this.vehiculo.plate);
  }

  onAprobar() {
    this.aprobar.emit(this.vehiculo.plate);
  }

  onRechazar() {
    this.rechazar.emit(this.vehiculo.plate);
  }

  onHistorial() {
    this.historial.emit(this.vehiculo.plate);
  }
}
