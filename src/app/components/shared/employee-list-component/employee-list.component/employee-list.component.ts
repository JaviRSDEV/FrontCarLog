import { UserService } from './../../../../services/userService/user.service';
import { TallerService } from './../../../../services/tallerService/taller.service';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { User } from '../../../../models/user';

@Component({
  selector: 'app-employee-list',
  imports: [CommonModule, UpperCasePipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css',
})
export class EmployeeListComponent implements OnInit {
  empleados: User[] = [];
  managerDni: string = '';

  constructor(
    private userService: UserService,
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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

  despedir(dniEmpleado: string) {
    if (confirm(`¿Estás seguro de que quieres despedir al empleado con DNI ${dniEmpleado}?`)) {
      this.userService.fireEmployee(dniEmpleado).subscribe({
        next: () => {
          setTimeout(() => {
            this.empleados = this.empleados.filter((emp) => emp.dni !== dniEmpleado);
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => console.error('Error al despedir', err),
      });
    }
  }
}
