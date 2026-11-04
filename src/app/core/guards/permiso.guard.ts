import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Permiso } from '../../models/auth.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Protege rutas según el permiso declarado en `data.permiso`.
 * Ejemplo: { path: 'historial', canActivate: [PermisoGuard], data: { permiso: 'HISTORIAL_VER' } }
 */
@Injectable({
  providedIn: 'root'
})
export class PermisoGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const permiso = route.data['permiso'] as Permiso | undefined;
    if (!permiso || this.authService.tienePermiso(permiso)) {
      return true;
    }
    this.notificationService.mostrarAdvertencia('Su rol no tiene acceso a esta sección.');
    return this.router.createUrlTree(['/citas']);
  }
}
