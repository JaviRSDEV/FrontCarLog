import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { MiPerfilCardComponent } from '../../mi-perfil-card-component/mi-perfil-card.component/mi-perfil-card.component';
import { EmployeeListComponent } from '../../employee-list-component/employee-list.component/employee-list.component';
import { HireWorkerComponent } from '../../hire-worker-component/hire-worker.component/hire-worker.component';
import { UserService } from '../../../../services/userService/user.service';
import { Auth } from '../../../../services/authService/auth.service';
import { User } from '../../../../models/user';

type TabType = 'perfil' | 'plantilla';

@Component({
  selector: 'app-gestion-taller.component',
  standalone: true,
  imports: [CommonModule, MiPerfilCardComponent, EmployeeListComponent, HireWorkerComponent],
  templateUrl: './gestion-taller.component.html',
  styleUrl: './gestion-taller.component.css',
})
export class GestionTallerComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(Auth);
  private readonly destroy$ = inject(DestroyRef);

  user = signal<User | undefined>(undefined);
  tabActiva = signal<TabType>('perfil');
  role = computed(() => {
    const r = this.user()?.role || '';
    return r.toString().replaceAll('"', '').toUpperCase();
  });

  isManager = computed(() => {
    const r = this.role();
    return r === 'MANAGER' || r === 'CO_MANAGER';
  });

  ngOnInit(): void {
    const userJson = this.authService.getUserFromStorage();

    if (userJson) {
      try {
        const localUser: User = JSON.parse(userJson);
        this.user.set(localUser);
        this.userService
          .getUserByDni()
          .pipe(takeUntilDestroyed(this.destroy$))
          .subscribe({
            next: (fullUser: User) => {
              const updatedUser = {
                ...fullUser,
                workshop: fullUser.workshop || localUser.workshop,
              };

              this.user.set(updatedUser);
              this.actualizarStorage(updatedUser);
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
    this.tabActiva.set(tab);
  }
}
