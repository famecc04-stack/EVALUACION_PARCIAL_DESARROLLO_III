import { Pipe, PipeTransform } from '@angular/core';
import { EstadoCita } from '../../models/cita.model';

@Pipe({
  name: 'estadoCita',
  standalone: false
})
export class EstadoCitaPipe implements PipeTransform {
  public transform(estado: EstadoCita, formato: 'texto' | 'badge' | 'icono' = 'texto'): string {
    const configuraciones: Record<EstadoCita, { texto: string; badge: string; icono: string }> = {
      PROGRAMADA: {
        texto: 'Programada',
        badge: 'badge bg-primary',
        icono: 'bi bi-calendar-event'
      },
      EN_ATENCION: {
        texto: 'En Atención',
        badge: 'badge bg-warning text-dark',
        icono: 'bi bi-heart-pulse-fill'
      },
      COMPLETADA: {
        texto: 'Completada',
        badge: 'badge bg-success',
        icono: 'bi bi-check-circle-fill'
      },
      CANCELADA: {
        texto: 'Cancelada',
        badge: 'badge bg-danger',
        icono: 'bi bi-x-circle-fill'
      }
    };

    const config = configuraciones[estado] || {
      texto: estado,
      badge: 'badge bg-secondary',
      icono: 'bi bi-question-circle'
    };

    if (formato === 'badge') {
      return config.badge;
    }
    if (formato === 'icono') {
      return config.icono;
    }
    return config.texto;
  }
}
