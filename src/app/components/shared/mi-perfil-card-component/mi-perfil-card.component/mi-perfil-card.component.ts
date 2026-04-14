import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { TallerService } from '../../../../services/tallerService/taller.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/userService/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-perfil-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil-card.component.html',
  styleUrl: './mi-perfil-card.component.css',
})
export class MiPerfilCardComponent implements OnInit {
  @Input() user: any;
  workShop: any;

  isEditing: boolean = false;
  editedUser: any = {};

  constructor(
    private tallerService: TallerService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {}

  ngOnInit() {
    if (this.user.workShopId) {
      this.obtenerTaller(this.user.workShopId);
    }
  }

  obtenerTaller(tallerId: number) {
    this.tallerService.getTallerPorId(tallerId).subscribe({
      next: (datosTaller) => {
        this.workShop = datosTaller;
        this.cdr.detectChanges();
      },
      error: (err) => {
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
    this.userService.edit(this.editedUser, this.user.dni).subscribe({
      next: (updatedUser: any) => {
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
      error: (err) => {
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
