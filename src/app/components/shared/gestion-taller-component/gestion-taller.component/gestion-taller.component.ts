import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MiPerfilCardComponent } from '../../mi-perfil-card-component/mi-perfil-card.component/mi-perfil-card.component';
import { EmployeeListComponent } from '../../employee-list-component/employee-list.component/employee-list.component';
import { HireWorkerComponent } from '../../hire-worker-component/hire-worker.component/hire-worker.component';
import { UserService } from '../../../../services/userService/user.service';
import { User } from '../../../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

type TabType = 'perfil' | 'plantilla';

@Component({
  selector: 'app-gestion-taller.component',
  standalone: true,
  imports: [CommonModule, MiPerfilCardComponent, EmployeeListComponent, HireWorkerComponent],
  templateUrl: './gestion-taller.component.html',
  styleUrl: './gestion-taller.component.css',
})
export class GestionTallerComponent implements OnInit {
  user?: User;
  role: string = '';
  isManager: boolean = false;
  tabActiva: TabType = 'perfil';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (userJson) {
      try {
        const localUser: User = JSON.parse(userJson);
        this.user = localUser;

        this.role = (localUser.role || '').replace(/"/g, '').toUpperCase();
        this.isManager = this.role === 'MANAGER' || this.role === 'CO_MANAGER';

        this.userService.getUserByDni().subscribe({
          next: (fullUser: User) => {
            this.user = {
              ...fullUser,
              workshop: fullUser.workshop || localUser.workshop,
            };

            this.actualizarStorage(this.user);

            this.cdr.detectChanges();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error al traer los datos completos del usuario', err);
          },
        });
      } catch (e) {
        console.error('Error al parsear el usuario del storage', e);
      }
    }
  }

  private actualizarStorage(user: User): void {
    const isLocal = localStorage.getItem('user') !== null;
    const storage = isLocal ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  }

  cambiarTab(tab: TabType): void {
    this.tabActiva = tab;
  }
}
