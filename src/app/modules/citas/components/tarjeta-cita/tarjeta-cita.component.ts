import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Cita, EstadoCita } from '../../../../models/cita.model';

@Component({
  selector: 'app-tarjeta-cita',
  templateUrl: './tarjeta-cita.component.html',
  styleUrls: ['./tarjeta-cita.component.scss'],
  standalone: false
})
export class TarjetaCitaComponent {
  @Input() cita!: Cita;
  /** Permisos de la vista contenedora: la tarjeta no conoce roles, solo qué botones mostrar. */
  @Input() puedeAtender: boolean = true;
  @Input() puedeCancelar: boolean = true;
  @Input() puedeVerHistorial: boolean = true;
  @Output() cambiarEstado = new EventEmitter<{ id: string; nuevoEstado: EstadoCita }>();
  @Output() verHistorialMascota = new EventEmitter<string>();

  public onCambiarEstado(nuevoEstado: EstadoCita): void {
    this.cambiarEstado.emit({ id: this.cita.id, nuevoEstado });
  }

  public onVerHistorial(): void {
    this.verHistorialMascota.emit(this.cita.mascotaId);
  }
}
