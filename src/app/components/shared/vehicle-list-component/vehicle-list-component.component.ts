import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';

import { VehicleFormComponent } from '../vehicle-form.component/vehicle-form.component';
import { VehicleCardComponent } from '../vehicle-card.component/vehicle-card.component';
import { VehicleDetailModalComponent } from '../vehicle-detail-modal.component/vehicle-detail-modal.component';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
  vehiculoParaEditar: Vehicle | null = null;
  vehiculoSeleccionado: Vehicle | null = null;
  matriculaBuscada: string = '';

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

  abrirDetalles(vehiculo: Vehicle) {
    this.vehiculoSeleccionado = vehiculo;
  }

  cerrarDetalles() {
    this.vehiculoSeleccionado = null;
  }

  editarVehiculo(vehiculo: Vehicle) {
    this.vehiculoParaEditar = vehiculo;
    this.isEditing = true;
    this.mostrarFormulario = true;
    this.vehiculoSeleccionado = null;
  }

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

  onVehiculoGuardado() {
    this.cargarDatos(this.activeTab);
    this.toggleFormulario();
  }

  /*registerEntry(plate: string){
    if(confirm(`¿Confirmas la ENTRADA del vehículo ${plate} al taller?`)){
      this.vehicleService.registerEntry(plate, this.workshopId).subscribe({
        next: () => {
          this.cargarDatos(this.activeTab);
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo registrar la entrada del vehículo');
        }
      });
    }
  }*/

  registerExit(plate: string){
    if(confirm(`¿Confirmas la SALIDA del vehículo ${plate} del taller?`)){
      this.vehicleService.registerExit(plate.toUpperCase(), this.workshopId).subscribe({
        next: () => {
          this.cargarDatos(this.activeTab);
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo registrar la salida del vehículo');
        }
      });
    }
  }

  solicitarIngreso(){
    if(!this.matriculaBuscada.trim()) return;

    this.vehicleService.requestEntry(this.matriculaBuscada.toUpperCase(), this.workshopId).subscribe({
      next: () => {
        alert(`Solicitud enviada al propiertario del vehículo ${this.matriculaBuscada.toUpperCase()}.`);
        this.matriculaBuscada = '';
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al solicitar el ingreso.';
        alert(msg);
      }
    });
  }

  aprobarSolicitud(plate: string){
    this.vehicleService.approveEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
      },
      error: (err) => alert('No se pudo aprobar la solicitud.')
    });
  }

  rechazarSolicitud(plate: string){
    this.vehicleService.rejectEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
      },
      error: (err) => alert('No se pudo rechazar la solicitud.')
    })
  }
}
