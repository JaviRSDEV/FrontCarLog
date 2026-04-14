import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MiPerfilCardComponent } from '../../mi-perfil-card-component/mi-perfil-card.component/mi-perfil-card.component';
import { EmployeeListComponent } from '../../employee-list-component/employee-list.component/employee-list.component';
import { HireWorkerComponent } from '../../hire-worker-component/hire-worker.component/hire-worker.component';
import { UserService } from '../../../../services/userService/user.service';

@Component({
  selector: 'app-gestion-taller.component',
  standalone: true,
  imports: [CommonModule, MiPerfilCardComponent, EmployeeListComponent, HireWorkerComponent],
  templateUrl: './gestion-taller.component.html',
  styleUrl: './gestion-taller.component.css',
})
export class GestionTallerComponent implements OnInit {
  user: any;
  role: string = '';
  isManager: boolean = false;
  tabActiva: string = 'perfil';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const localUser = JSON.parse(userJson);

      this.user = localUser;
      this.role = this.user.role?.replace(/"/g, '').toUpperCase();
      this.isManager = this.role === 'MANAGER' || this.role === 'CO_MANAGER';

      const dniBuscado = localUser.dni || localUser.DNI || localUser.userId;

      if (dniBuscado) {
        this.userService.getUserByDni(dniBuscado).subscribe({
          next: (fullUser: any) => {
            this.user = {
              ...fullUser,
              workShop: localUser.workShop || localUser.workshop,
            };
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error al traer los datos completos del usuario', err);
          },
        });
      } else {
        console.error('Error: Puta madre marge');
      }
    } else {
      console.error('Error: Bomboclat con el puto localstorage');
    }
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }
}
