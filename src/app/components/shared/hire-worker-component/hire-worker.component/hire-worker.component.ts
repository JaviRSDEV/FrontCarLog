import { UserService } from './../../../../services/userService/user.service';
import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hire-worker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './hire-worker.component.html',
  styleUrl: './hire-worker.component.css',
})
export class HireWorkerComponent {
  dniBusqueda: string = '';
  rolElegido: string = 'MECHANIC';
  mensaje: string = '';
  error: boolean = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
  ) {}

  enviarInvitacion() {
    console.log(this.rolElegido);
    console.log(this.dniBusqueda);
    console.log('Enviando invitacion');
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    const manager = JSON.parse(userJson);

    const managerDni = manager.userId;

    this.userService.invite(this.dniBusqueda, managerDni, this.rolElegido).subscribe({
      next: () => {
        this.mensaje = `Invitación enviada correctamente a ${this.dniBusqueda}`;
        this.error = false;
        this.dniBusqueda = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensaje = err.error?.message || 'Error al enviar invitación. ¿Existe el DNI?';
        this.error = true;
        this.cdr.detectChanges();
      },
    });
  }
}
