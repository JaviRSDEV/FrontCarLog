import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user';
import { Vehicle } from '../../../models/vehicle';
import { Workorder } from '../../../models/workorder';
import { VehicleService } from '../../../services/vehicleService/vehicle.service';
import { WorkOrderService } from '../../../services/workOrderService/work-order.service';

import { VehicleFormComponent } from '../vehicle-form.component/vehicle-form.component';
import { VehicleCardComponent } from '../vehicle-card.component/vehicle-card.component';
import { VehicleDetailModalComponent } from '../vehicle-detail-modal.component/vehicle-detail-modal.component';
import { SearchComponent } from '../search-component/search.component/search.component';

@Component({
  selector: 'app-vehicle-list-component',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    VehicleFormComponent,
    VehicleCardComponent,
    VehicleDetailModalComponent,
    SearchComponent,
  ],
  templateUrl: './vehicle-list-component.html',
  styleUrl: './vehicle-list-component.css',
})
export class VehicleListComponent implements OnInit, OnDestroy {
  activeTab: 'mis-vehiculos' | 'asignados' | 'flota' = 'mis-vehiculos';
  role: string = '';
  userDni: string = '';
  workshopId: number = 0;

  misVehiculos: Vehicle[] = [];
  ordenesAsignadas: Workorder[] = [];
  vehiculosAsignados: Vehicle[] = [];
  flotaTaller: Vehicle[] = [];

  mostrarFormulario: boolean = false;
  isEditing: boolean = false;
  vehiculoParaEditar: Vehicle | null = null;
  vehiculoSeleccionado: Vehicle | null = null;
  matriculaBuscada: string = '';

  private recargarListener = () => {
    this.ngZone.run(() => {
      console.log('Aviso del Layout');
      setTimeout(() => {
        this.cargarDatos(this.activeTab);
      }, 500);
    });
  };

  constructor(
    private vehicleService: VehicleService,
    private workOrderService: WorkOrderService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      this.role = user.role;
      const dniSeguro = user.dni || user.userId;
      this.userDni = dniSeguro ? String(dniSeguro) : '';
      this.workshopId = user.workShopId || 0;
    }
    this.cargarDatos(this.activeTab);

    window.addEventListener('recargar-coches', this.recargarListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('recargar-coches', this.recargarListener);
  }

  buscarVehiculos(texto: string) {
    if (!texto.trim()) {
      this.cargarDatos(this.activeTab);
      return;
    }

    let searchType = 'OWNER';
    if (this.activeTab === 'flota') searchType = 'WORKSHOP';
    else if (this.activeTab === 'asignados') searchType = 'ASSIGNED';

    this.vehicleService.searchVehicles(texto, this.workshopId, searchType).subscribe({
      next: (data: any) => {
        if (this.activeTab === 'flota') {
          this.flotaTaller = data;
        } else if (this.activeTab === 'asignados') {
          this.vehiculosAsignados = data;
        } else {
          this.misVehiculos = data;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error en la búsqueda', err),
    });
  }

  cargarDatos(tab: string) {
    if (tab === 'mis-vehiculos') {
      this.vehicleService.getVehiclesByOwner(this.userDni).subscribe((data) => {
        this.misVehiculos = data;
        this.cdr.detectChanges();
      });
    } else if (tab === 'asignados') {
      this.workOrderService.getWorkOrdersByMechanic(this.userDni).subscribe((data) => {
        this.ordenesAsignadas = data;

        const cochesUnicos = new Map<string, Vehicle>();
        data.forEach((orden) => {
          if (
            orden.vehicle &&
            orden.status !== 'COMPLETED' &&
            !cochesUnicos.has(orden.vehicle.plate)
          ) {
            cochesUnicos.set(orden.vehicle.plate, orden.vehicle);
          }
        });

        this.vehiculosAsignados = Array.from(cochesUnicos.values());
        this.cdr.detectChanges();
      });
    } else if (tab === 'flota') {
      this.vehicleService.getVehiclesByWorkshop(this.workshopId).subscribe((data) => {
        this.flotaTaller = data;
        this.cdr.detectChanges();
      });
    }
  }

  irAlHistorial(plate: string) {
    console.log('/dashboard/historial');
    this.router.navigate(['/dashboard/historial', plate]);
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
        error: (err) => alert('Error al eliminar'),
      });
    }
  }

  onVehiculoGuardado() {
    this.cargarDatos(this.activeTab);
    this.toggleFormulario();
  }

  registerExit(plate: string) {
    if (confirm(`¿Confirmas la SALIDA del vehículo ${plate} del taller?`)) {
      this.vehicleService.registerExit(plate.toUpperCase(), this.workshopId).subscribe({
        next: () => {
          this.cargarDatos(this.activeTab);
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo registrar la salida del vehículo');
        },
      });
    }
  }

  solicitarIngreso() {
    if (!this.matriculaBuscada.trim()) return;

    this.vehicleService
      .requestEntry(this.matriculaBuscada.toUpperCase(), this.workshopId)
      .subscribe({
        next: () => {
          alert(
            `Solicitud enviada al propietario del vehículo ${this.matriculaBuscada.toUpperCase()}.`,
          );
          this.matriculaBuscada = '';
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al solicitar el ingreso.';
          alert(msg);
        },
      });
  }

  aprobarSolicitud(plate: string) {
    this.vehicleService.approveEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
      },
      error: (err) => alert('No se pudo aprobar la solicitud.'),
    });
  }

  rechazarSolicitud(plate: string) {
    this.vehicleService.rejectEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
      },
      error: (err) => alert('No se pudo rechazar la solicitud.'),
    });
  }
}
