import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { UserService } from './../../../../services/userService/user.service';
import { TallerService } from './../../../../services/tallerService/taller.service';
import { Auth } from '../../../../services/authService/auth.service';
import {
  AppEventType,
  NotificationBusService,
} from '../../../../services/notification-bus/notification-bus.service';
import { User } from '../../../../models/user';
import { Workshop } from '../../../../models/workshop';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, UpperCasePipe, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  private userService = inject(UserService);
  private tallerService = inject(TallerService);
  private authService = inject(Auth);
  private notificationBus = inject(NotificationBusService);
  private destroy$ = inject(DestroyRef);

  empleados = signal<User[]>([]);
  managerDni = signal<string>('');
  editingRoleDni = signal<string | null>(null);
  selectedRole = signal<string>('');

  ngOnInit(): void {
    this.cargarListaEmpleados();
    this.notificationBus
      .on(AppEventType.RELOAD_EMPLOYEES)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(() => this.cargarListaEmpleados());
  }

  cargarListaEmpleados() {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this.managerDni.set(user.dni);

        const workshopId = user.workShopId || (user.workshop as Workshop)?.workshopId;

        if (workshopId) {
          this.tallerService
            .getMecanicosPorTaller(workshopId)
            .pipe(takeUntilDestroyed(this.destroy$))
            .subscribe({
              next: (data: User[]) => {
                this.empleados.set(data.filter((emp) => emp.dni !== this.managerDni()));
              },
              error: (err: HttpErrorResponse) => console.error('Error cargando empleados:', err),
            });
        }
      } catch (e) {
        console.error('Error al procesar sesión en EmployeeList:', e);
      }
    }
  }

  iniciarEdicionRol(emp: User) {
    this.editingRoleDni.set(emp.dni);
    this.selectedRole.set(emp.role);
  }

  cancelarEdicionRol() {
    this.editingRoleDni.set(null);
    this.selectedRole.set('');
  }

  guardarRol(emp: User) {
    const updateUser: User = { ...emp, role: this.selectedRole() };

    this.userService
      .edit(updateUser, emp.dni)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (res: User) => {
          this.empleados.update((list) => list.map((e) => (e.dni === emp.dni ? res : e)));

          this.cancelarEdicionRol();

          Swal.fire({
            title: 'Rol actualizado',
            text: 'Los permisos del empleado han sido modificados.',
            icon: 'success',
            background: '#212529',
            color: '#fff',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          Swal.fire({
            title: 'Error',
            text: 'Hubo un error al actualizar el rol del empleado.',
            icon: 'error',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
        },
      });
  }

  despedir(dniEmpleado: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a despedir al empleado con DNI ${dniEmpleado}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-person-x-fill"></i> Sí, despedir',
      cancelButtonText: 'Cancelar',
      background: '#212529',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService
          .fireEmployee(dniEmpleado)
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: () => {
              this.empleados.update((list) => list.filter((emp) => emp.dni !== dniEmpleado));

              Swal.fire({
                title: '¡Despedido!',
                text: 'El empleado ha sido dado de baja del taller.',
                icon: 'success',
                background: '#212529',
                color: '#fff',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            error: (err: HttpErrorResponse) => {
              console.error('Error al despedir', err);
              Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al intentar despedir al empleado.',
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
}
