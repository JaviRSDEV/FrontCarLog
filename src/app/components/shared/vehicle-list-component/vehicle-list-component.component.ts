import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../../../models/user';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';

// Importación de los hijos
import { VehicleFormComponent } from '../vehicle-form.component/vehicle-form.component';
import { VehicleCardComponent } from '../vehicle-card.component/vehicle-card.component';
import { VehicleDetailModalComponent } from '../vehicle-detail-modal.component/vehicle-detail-modal.component';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VehicleFormComponent,
    VehicleCardComponent,
    VehicleDetailModalComponent
  ],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit {
  activeTab: 'mis-vehiculos' | 'asignados' | 'flota' = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  misVehiculos: Vehicle[] = [];
  ordenesAsignadas: Workorder[] = [];
  flotaTaller: Vehicle[] = [];

  mostrarFormulario: boolean = false;
  isEditing: boolean = false;
  vehiculoParaEditar: Vehicle | null = null; // Coincide con tu [vehiculoEdicion]
  vehiculoSeleccionado: Vehicle | null = null;

  constructor(
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.role = user.role;
      this.userDni = user.userId ? String(user.userId) : '';
      this.workshopId = user.workshopId || 0;
    }
    this.cargarDatos(this.activeTab);
  }

  cargarDatos(tab: string) {
    if (tab === 'mis-vehiculos') {
      this.vehicleService.getVehiclesByOwner(this.userDni).subscribe(data => {
        this.misVehiculos = data;
        this.cdr.detectChanges();
      });
    } else if (tab === 'asignados') {
      this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe(data => {
        this.ordenesAsignadas = data;
        this.cdr.detectChanges();
      });
    } else if (tab === 'flota') {
      this.vehicleService.getVehiclesByWorkshop(this.workshopId).subscribe(data => {
        this.flotaTaller = data;
        this.cdr.detectChanges();
      });
    }
  }

  cambiarPestana(pestana: any) {
    this.activeTab = pestana;
    this.mostrarFormulario = false;
    this.cargarDatos(pestana);
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.isEditing = false;
      this.vehiculoParaEditar = null;
    }
  }

  // Se llama desde (verDetalles) en la card
  abrirDetalles(vehiculo: Vehicle) {
    this.vehiculoSeleccionado = vehiculo;
  }

  // Se llama desde (cerrarModal) en el detalle
  cerrarDetalles() {
    this.vehiculoSeleccionado = null;
  }

  // Se llama desde (editar) en el detalle. Coincide con tu HTML.
  editarVehiculo(vehiculo: Vehicle) {
    this.vehiculoParaEditar = vehiculo;
    this.isEditing = true;
    this.mostrarFormulario = true;
    this.vehiculoSeleccionado = null; // Cerramos el modal para ver el form
  }

  // Se llama desde (eliminar) en el detalle. Coincide con tu HTML.
  eliminarVehiculo(plate: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar el vehículo ${plate}?`)) {
      this.vehicleService.deleteVehicle(plate).subscribe({
        next: () => {
          this.cargarDatos(this.activeTab);
          this.vehiculoSeleccionado = null;
        },
        error: (err) => alert('Error al eliminar')
      });
    }
  }

  // Se llama desde (guardado) en el formulario. Coincide con tu HTML.
  onVehiculoGuardado() {
    this.cargarDatos(this.activeTab);
    this.toggleFormulario();
  }
}
