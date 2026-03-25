import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.css'
})
export class VehicleCardComponent {
  @Input() vehiculo!: Vehicle;
  @Input() modoFlota: boolean = false;

  @Output() verDetalles = new EventEmitter<Vehicle>();
  @Output() salida = new EventEmitter<string>();

  onDetalles() {
    this.verDetalles.emit(this.vehiculo);
  }

  onSalida() {
    this.salida.emit(this.vehiculo.plate);
  }
}
