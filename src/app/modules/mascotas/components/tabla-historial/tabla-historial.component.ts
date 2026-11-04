import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IHistorialMedico } from '../../../../models/historial.model';
import { Mascota } from '../../../../models/mascota.model';

@Component({
  selector: 'app-tabla-historial',
  templateUrl: './tabla-historial.component.html',
  styleUrls: ['./tabla-historial.component.scss'],
  standalone: false
})
export class TablaHistorialComponent {
  @Input() registros: IHistorialMedico[] = [];
  @Input() mascota?: Mascota;
  /** Si es false (rol sin permiso HISTORIAL_REGISTRAR) no se muestra el botón de registro. */
  @Input() permitirRegistro: boolean = false;
  @Output() registrarNuevaAtencion = new EventEmitter<void>();

  public filtroTipo: string = 'TODOS';
  public registroSeleccionadoDetalle?: IHistorialMedico;

  public get registrosFiltrados(): IHistorialMedico[] {
    if (this.filtroTipo === 'TODOS') {
      return this.registros;
    }
    return this.registros.filter(r => r.tipoRegistro === this.filtroTipo);
  }

  public seleccionarDetalle(registro: IHistorialMedico): void {
    this.registroSeleccionadoDetalle = registro;
  }

  public cerrarDetalle(): void {
    this.registroSeleccionadoDetalle = undefined;
  }

  public emitirNuevaAtencion(): void {
    this.registrarNuevaAtencion.emit();
  }
}
