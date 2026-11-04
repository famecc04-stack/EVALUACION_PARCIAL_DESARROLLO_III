import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface INotificacion {
  id: string;
  tipo: 'success' | 'danger' | 'warning' | 'info';
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificacionesSubject: BehaviorSubject<INotificacion[]> = new BehaviorSubject<INotificacion[]>([]);
  public readonly notificaciones$: Observable<INotificacion[]> = this.notificacionesSubject.asObservable();

  public mostrarExito(mensaje: string): void {
    this.agregar('success', mensaje);
  }

  public mostrarError(mensaje: string): void {
    this.agregar('danger', mensaje);
  }

  public mostrarAdvertencia(mensaje: string): void {
    this.agregar('warning', mensaje);
  }

  public mostrarInfo(mensaje: string): void {
    this.agregar('info', mensaje);
  }

  public remover(id: string): void {
    const actuales = this.notificacionesSubject.value.filter(n => n.id !== id);
    this.notificacionesSubject.next(actuales);
  }

  private agregar(tipo: 'success' | 'danger' | 'warning' | 'info', mensaje: string): void {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const nueva: INotificacion = { id, tipo, mensaje };
    const lista = [...this.notificacionesSubject.value, nueva];
    this.notificacionesSubject.next(lista);

    setTimeout(() => {
      this.remover(id);
    }, 4500);
  }
}
