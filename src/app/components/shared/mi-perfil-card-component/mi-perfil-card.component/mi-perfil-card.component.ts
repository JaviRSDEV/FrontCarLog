import { Component, OnInit, inject, input, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { User } from '../../../../models/user';
import { Workshop } from '../../../../models/workshop';
import { UserService } from './../../../../services/userService/user.service';
import { TallerService } from './../../../../services/tallerService/taller.service';
import { Auth } from '../../../../services/authService/auth.service';

@Component({
  selector: 'app-mi-perfil-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil-card.component.html',
  styleUrl: './mi-perfil-card.component.css',
})
export class MiPerfilCardComponent implements OnInit {
  userInitial = input.required<User>({ alias: 'user' });

  private tallerService = inject(TallerService);
  private userService = inject(UserService);
  private authService = inject(Auth);
  private destroy$ = inject(DestroyRef);

  user = signal<User | null>(null);
  workShop = signal<Workshop | undefined>(undefined);
  isEditing = signal(false);
  editedUser = signal<User | null>(null);

  ngOnInit() {
    const initial = this.userInitial();
    this.user.set(initial);

    if (initial?.workShopId) {
      this.obtenerTaller(initial.workShopId);
    }
  }

  obtenerTaller(tallerId: number) {
    this.tallerService
      .getTallerPorId(tallerId)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (datosTaller: Workshop) => this.workShop.set(datosTaller),
        error: (err: HttpErrorResponse) => console.error('Error al cargar el taller:', err),
      });
  }

  activarEdicion() {
    const currentUser = this.user();
    if (currentUser) {
      this.editedUser.set({ ...currentUser });
      this.isEditing.set(true);
    }
  }

  cancelarEdicion() {
    this.isEditing.set(false);
    this.editedUser.set(null);
  }

  guardarCambios() {
    const userToEdit = this.editedUser();
    const currentUser = this.user();

    if (!userToEdit || !currentUser?.dni) return;

    this.userService
      .edit(userToEdit, currentUser.dni)
      .pipe(takeUntilDestroyed(this.destroy$))
      .subscribe({
        next: (updatedUser: User) => {
          const finalUser = {
            ...updatedUser,
            workshop: currentUser.workshop,
          };

          this.user.set(finalUser);
          this.isEditing.set(false);
          this.actualizarStorage(finalUser);

          Swal.fire({
            title: 'Cambios guardados',
            text: 'Tu perfil se ha actualizado correctamente.',
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
          console.error('Error al guardar cambios:', err);
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Hubo un error al guardar los cambios.',
            icon: 'error',
            background: '#212529',
            color: '#fff',
            confirmButtonColor: '#0d6efd',
          });
        },
      });
  }

  private actualizarStorage(usuario: User) {
    const isLocal = localStorage.getItem('user') !== null;
    const storage = isLocal ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(usuario));
  }
}
