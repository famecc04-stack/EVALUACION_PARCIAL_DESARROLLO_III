import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Veterinario } from '../../models/veterinario.model';

/** Plantel médico de la clínica (datos de demostración). */
@Injectable({
  providedIn: 'root'
})
export class VeterinariosService {
  private readonly veterinarios: Veterinario[] = [
    new Veterinario('VET-001', 'Alejandro', 'Morales', '40112233', '987654321',
      'amorales@veterinaria.com', 'Av. Arequipa 1200, Lima', 'CMVP-04512', 'Medicina General',
      true, new Date(), new Date(), 'Dr.'),
    new Veterinario('VET-002', 'Mariana', 'Castillo', '41223344', '976543210',
      'mcastillo@veterinaria.com', 'Jr. Huancavelica 340, Lima', 'CMVP-05873', 'Felinos y Dermatología',
      true, new Date(), new Date(), 'Dra.'),
    new Veterinario('VET-003', 'Jorge', 'Salazar', '42334455', '965432109',
      'jsalazar@veterinaria.com', 'Av. Brasil 2100, Magdalena', 'CMVP-06120', 'Cirugía y Odontología',
      true, new Date(), new Date(), 'Dr.')
  ];

  public obtenerVeterinarios(): Observable<Veterinario[]> {
    return of(this.veterinarios.filter(v => v.activo));
  }

  public obtenerPorId(id: string): Veterinario | undefined {
    return this.veterinarios.find(v => v.id === id);
  }
}
