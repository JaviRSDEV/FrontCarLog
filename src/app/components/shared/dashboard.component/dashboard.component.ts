import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../../services/userService/user.service';
import { Auth } from '../../../services/authService/auth.service';
import {
  AppEventType,
  NotificationBusService,
} from '../../../services/notification-bus/notification-bus.service';
import { User } from '../../../models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, TitleCasePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly authService = inject(Auth);
  private readonly notificationBus = inject(NotificationBusService);
  private readonly destroy$ = inject(DestroyRef);

  user = signal<User | undefined>(undefined);
  userName = computed(() => this.user()?.name || this.user()?.email.split('@')[0] || 'Usuario');
  role = computed(() => this.user()?.role || '');

  workshopName = computed(() => {
    const ws = this.user()?.workshop;
    if (!ws) return '';
    return typeof ws === 'string' ? ws : ws.workshopName;
  });

  aviso = signal<{ mensaje: string; tipo: 'success' | 'danger' | 'info'; visible: boolean }>({
    mensaje: '',
    tipo: 'info',
    visible: false,
  });

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.notificationBus
      .on(AppEventType.NEW_INVITE)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe(() => this.cargarDatosUsuario());
  }

  cargarDatosUsuario() {
    this.userService
      .getUserByDni()
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (fullUser: User) => {
          this.user.set(fullUser);
          this.authService.saveUserToStorage(fullUser);
        },
        error: (err: HttpErrorResponse) => console.error('Error al cargar datos del usuario:', err),
      });
  }

  gestionarInvitacion(aceptar: boolean) {
    const currentUser = this.user();
    if (!currentUser?.dni) return;

    const accion = aceptar
      ? this.userService.acceptInvitation(currentUser.dni)
      : this.userService.rejectInvitation(currentUser.dni);

    accion.pipe(takeUntilDestroyed(this.destroy$)).subscribe({
      next: (res: User) => {
        const updatedUser = { ...res };
        delete (updatedUser as User).pendingWorkshop;
        delete (updatedUser as User).pendingWorkshopName;
        delete (updatedUser as User).pendingRole;

        this.user.set(updatedUser);
        this.authService.saveUserToStorage(updatedUser);

        this.mostrarFeedback(
          aceptar ? '¡Te has unido al taller!' : 'Invitación rechazada.',
          aceptar ? 'success' : 'info',
        );
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.mostrarFeedback('Error al procesar la invitación.', 'danger');
      },
    });
  }

  private mostrarFeedback(mensaje: string, tipo: 'success' | 'danger' | 'info') {
    this.aviso.set({ mensaje, tipo, visible: true });

    setTimeout(() => {
      this.aviso.update((state) => ({ ...state, visible: false }));
    }, 5000);
  }
}
