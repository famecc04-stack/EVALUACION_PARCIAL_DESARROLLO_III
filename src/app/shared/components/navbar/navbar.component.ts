import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, INotificacion } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { DESCRIPCION_ROL, ISesionUsuario } from '../../../models/auth.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false
})
export class NavbarComponent {
  public usuario$: Observable<ISesionUsuario | null>;
  public notificaciones$: Observable<INotificacion[]>;
  public menuColapsado: boolean = true;
  public readonly descripcionRol = DESCRIPCION_ROL;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.usuario$ = this.authService.sesion$;
    this.notificaciones$ = this.notificationService.notificaciones$;
  }

  public alternarMenu(): void {
    this.menuColapsado = !this.menuColapsado;
  }

  public cerrarMenu(): void {
    this.menuColapsado = true;
  }

  public cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }

  public descartarNotificacion(id: string): void {
    this.notificationService.remover(id);
  }
}
