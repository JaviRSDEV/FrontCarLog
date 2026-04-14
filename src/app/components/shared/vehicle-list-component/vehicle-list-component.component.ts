import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import Swal from 'sweetalert2';

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
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el vehículo ${plate}. Esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-trash"></i>Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.deleteVehicle(plate).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab);
            this.vehiculoSeleccionado = null;
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: 'Error al eliminar el vehículo',
              icon: 'error',
              background: '#212529',
              color: '#fff',
            });
          },
        });
      }
    });
  }

  onVehiculoGuardado() {
    this.cargarDatos(this.activeTab);
    this.toggleFormulario();
  }

  registerExit(plate: string) {
    Swal.fire({
      title: 'Registrar Salida',
      text: `¿Confirmas la SALIDA del vehículo ${plate} del taller?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Confirmar Salida',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehicleService.registerExit(plate.toUpperCase(), this.workshopId).subscribe({
          next: () => {
            this.cargarDatos(this.activeTab);
            Swal.fire({
              title: 'Salida Registrada',
              text: 'El vehículo ya no está en el taller.',
              icon: 'success',
              background: '#212529',
              color: '#fff',
              timer: 2000,
              showConfirmButton: false,
            });
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo registrar la salida.',
              icon: 'error',
              background: '#212529',
              color: '#fff',
              confirmButtonColor: '#0d6efd',
            });
          },
        });
      }
    });
  }

  solicitarIngreso() {
    if (!this.matriculaBuscada.trim()) return;

    this.vehicleService
      .requestEntry(this.matriculaBuscada.toUpperCase(), this.workshopId)
      .subscribe({
        next: () => {
          Swal.fire({
            title: '¡Solicitud Enviada!',
            text: `Se ha notificado al propietario del vehículo ${this.matriculaBuscada.toUpperCase()}.`,
            icon: 'success',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
          this.matriculaBuscada = '';
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al solicitar el ingreso.';
          Swal.fire({
            title: 'Atención',
            text: msg,
            icon: 'warning',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
        },
      });
  }

  aprobarSolicitud(plate: string) {
    this.vehicleService.approveEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
        Swal.fire({
          title: 'Ingreso Aprobado',
          text: 'El taller ya tiene acceso a tu vehículo.',
          icon: 'success',
          background: '#212529',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo aprobar la solicitud.',
          icon: 'error',
          background: '#212529',
          color: '#fff',
        });
      },
    });
  }

  rechazarSolicitud(plate: string) {
    this.vehicleService.rejectEntry(plate).subscribe({
      next: () => {
        this.cargarDatos('mis-vehiculos');
        Swal.fire({
          title: 'Ingreso Rechazado',
          text: 'Has denegado el acceso al taller.',
          icon: 'info',
          background: '#212529',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo rechazar la solicitud.',
          icon: 'error',
          background: '#212529',
          color: '#fff',
        });
      },
    });
  }
}
