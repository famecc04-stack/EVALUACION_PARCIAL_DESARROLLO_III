import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Permiso } from '../../models/auth.model';
import { AuthService } from '../../core/services/auth.service';

/**
 * Directiva estructural que muestra un elemento solo si el usuario tiene el permiso indicado.
 * Uso: <button *appTienePermiso="'CITAS_AGENDAR'">Agendar</button>
 * Se re-evalúa automáticamente cuando cambia la sesión (login / logout).
 */
@Directive({
  selector: '[appTienePermiso]',
  standalone: false
})
export class TienePermisoDirective implements OnInit, OnDestroy {
  private permiso?: Permiso;
  private visible = false;
  private suscripcion?: Subscription;

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input()
  set appTienePermiso(permiso: Permiso) {
    this.permiso = permiso;
    this.actualizarVista();
  }

  public ngOnInit(): void {
    this.suscripcion = this.authService.sesion$.subscribe(() => this.actualizarVista());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  private actualizarVista(): void {
    const debeMostrarse = !!this.permiso && this.authService.tienePermiso(this.permiso);
    if (debeMostrarse && !this.visible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.visible = true;
    } else if (!debeMostrarse && this.visible) {
      this.viewContainer.clear();
      this.visible = false;
    }
  }
}
