import { UserService } from './../../../../services/userService/user.service';
import { TallerService } from './../../../../services/tallerService/taller.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../../models/user';
import { Workshop } from '../../../../models/workshop';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil-card.component.html',
  styleUrl: './mi-perfil-card.component.css',
})
export class MiPerfilCardComponent implements OnInit {
  @Input() user!: User;
  workShop?: Workshop;

  isEditing: boolean = false;
  editedUser!: User;

  constructor(
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {}

  ngOnInit() {
    if (this.user?.workShopId) {
      this.obtenerTaller(this.user.workShopId);
    }
  }

  obtenerTaller(tallerId: number) {
    this.tallerService.getTallerPorId(tallerId).subscribe({
      next: (datosTaller: Workshop) => {
        this.workShop = datosTaller;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar el taller:', err);
      },
    });
  }

  activarEdicion() {
    this.editedUser = { ...this.user };
    this.isEditing = true;
  }

  cancelarEdicion() {
    this.isEditing = false;
  }

  guardarCambios() {
    if (!this.editedUser || !this.user.dni) return;

    this.userService.edit(this.editedUser, this.user.dni).subscribe({
      next: (updatedUser: User) => {
        this.user = updatedUser;
        this.isEditing = false;

        localStorage.setItem('user', JSON.stringify(this.user));
        this.cdr.detectChanges();

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
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al guardar los cambios.',
          icon: 'error',
          background: '#212529',
          color: '#fff',
          confirmButtonColor: '#0d6efd',
        });
      },
    });
  }
}
