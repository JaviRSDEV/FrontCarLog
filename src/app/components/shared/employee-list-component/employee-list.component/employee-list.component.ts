import { UserService } from './../../../../services/userService/user.service';
import { TallerService } from './../../../../services/tallerService/taller.service';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { User } from '../../../../models/user';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, UpperCasePipe, FormsModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  empleados: User[] = [];
  managerDni: string = '';

  editingRoleDni: string | null = null;
  selectedRole: string = '';

  private empleadosListener = () => {
    this.ngZone.run(() => {
      setTimeout(() => {
        this.cargarListaEmpleados();
      }, 500);
    });
  };

  constructor(
    private userService: UserService,
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.cargarListaEmpleados();

    window.addEventListener('recargar-empleados', this.empleadosListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('recargar-empleados', this.empleadosListener);
  }

  cargarListaEmpleados() {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.managerDni = user.dni;

      if (user.workShopId) {
        this.tallerService.getMecanicosPorTaller(user.workShopId).subscribe({
          next: (data) => {
            this.empleados = data;
            this.cdr.detectChanges();
          },
          error: (err) => console.error(err),
        });
      }
    }
  }

  iniciarEdicionRol(emp: User) {
    this.editingRoleDni = emp.dni;
    this.selectedRole = emp.role;
  }

  cancelarEdicionRol() {
    this.editingRoleDni = null;
    this.selectedRole = '';
  }

  guardarRol(emp: User) {
    const updateUser = { ...emp, role: this.selectedRole };

    this.userService.edit(updateUser, emp.dni).subscribe({
      next: (res: any) => {
        const index = this.empleados.findIndex((e) => e.dni === emp.dni);
        if (index !== -1) {
          this.empleados[index] = res;
        }
        this.cancelarEdicionRol();
        this.cdr.detectChanges();

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
      error: (err) => {
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
        this.userService.fireEmployee(dniEmpleado).subscribe({
          next: () => {
            setTimeout(() => {
              this.empleados = this.empleados.filter((emp) => emp.dni !== dniEmpleado);
              this.cdr.detectChanges();
            }, 0);

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
          error: (err) => {
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
