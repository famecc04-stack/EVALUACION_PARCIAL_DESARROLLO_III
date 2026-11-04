import { Pipe, PipeTransform } from '@angular/core';
import { Especie } from '../../models/animal.model';

@Pipe({
  name: 'especieBadge',
  standalone: false
})
export class EspecieBadgePipe implements PipeTransform {
  public transform(especie: Especie, elemento: 'badge' | 'icono' | 'nombre' = 'nombre'): string {
    const mapa: Record<Especie, { nombre: string; badge: string; icono: string }> = {
      CANINO: {
        nombre: 'Canino (Perro)',
        badge: 'badge bg-primary-subtle text-primary border border-primary',
        icono: 'bi bi-shield-shaded'
      },
      FELINO: {
        nombre: 'Felino (Gato)',
        badge: 'badge bg-warning-subtle text-warning-emphasis border border-warning',
        icono: 'bi bi-moon-stars-fill'
      },
      AVE: {
        nombre: 'Ave',
        badge: 'badge bg-info-subtle text-info-emphasis border border-info',
        icono: 'bi bi-feather'
      },
      ROEDOR: {
        nombre: 'Roedor',
        badge: 'badge bg-secondary-subtle text-secondary-emphasis border border-secondary',
        icono: 'bi bi-bug'
      },
      EXOTICO: {
        nombre: 'Exótico',
        badge: 'badge bg-danger-subtle text-danger-emphasis border border-danger',
        icono: 'bi bi-stars'
      }
    };

    const item = mapa[especie] || {
      nombre: especie,
      badge: 'badge bg-light text-dark',
      icono: 'bi bi-circle'
    };

    if (elemento === 'badge') {
      return item.badge;
    }
    if (elemento === 'icono') {
      return item.icono;
    }
    return item.nombre;
  }
}
