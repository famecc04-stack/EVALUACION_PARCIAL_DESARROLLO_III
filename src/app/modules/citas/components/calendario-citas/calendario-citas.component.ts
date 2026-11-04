import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Cita, EstadoCita } from '../../../../models/cita.model';

export interface IDiaCalendario {
  fecha: Date;
  numeroDia: number;
  nombreDia: string;
  esHoy: boolean;
  esSeleccionado: boolean;
  cantidadCitas: number;
  tieneUrgencias: boolean;
}

@Component({
  selector: 'app-calendario-citas',
  templateUrl: './calendario-citas.component.html',
  styleUrls: ['./calendario-citas.component.scss'],
  standalone: false
})
export class CalendarioCitasComponent implements OnInit, OnChanges {
  @Input() citas: Cita[] = [];
  @Input() fechaSeleccionada: Date = new Date();
  /** Acciones habilitadas para el rol en sesión; se reenvían a cada tarjeta. */
  @Input() acciones: { atender: boolean; cancelar: boolean; verHistorial: boolean } =
    { atender: false, cancelar: false, verHistorial: false };
  @Output() seleccionarFecha = new EventEmitter<Date>();
  @Output() cambiarEstado = new EventEmitter<{ id: string; nuevoEstado: EstadoCita }>();
  @Output() verHistorialMascota = new EventEmitter<string>();

  public diasVisualizados: IDiaCalendario[] = [];
  public mesOffset: number = 0;

  public ngOnInit(): void {
    this.generarDiasSemana();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['citas'] || changes['fechaSeleccionada']) {
      this.generarDiasSemana();
    }
  }

  public navegarSemana(delta: number): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + delta * 7);
    this.fechaSeleccionada = nuevaFecha;
    this.seleccionarFecha.emit(nuevaFecha);
    this.generarDiasSemana();
  }

  public seleccionarDia(dia: IDiaCalendario): void {
    this.fechaSeleccionada = dia.fecha;
    this.seleccionarFecha.emit(dia.fecha);
    this.generarDiasSemana();
  }

  public get citasDelDiaSeleccionado(): Cita[] {
    return this.citas.filter(c => {
      const fc = new Date(c.fechaHora);
      return fc.getFullYear() === this.fechaSeleccionada.getFullYear() &&
             fc.getMonth() === this.fechaSeleccionada.getMonth() &&
             fc.getDate() === this.fechaSeleccionada.getDate();
    }).sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
  }

  private generarDiasSemana(): void {
    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const hoy = new Date();
    const centro = new Date(this.fechaSeleccionada);
    const primerDiaSemana = new Date(centro);
    // Semana de lunes a domingo. (getDay() + 6) % 7 convierte domingo=0 en 6 para que
    // un domingo pertenezca a la semana que empezó el lunes anterior.
    primerDiaSemana.setDate(centro.getDate() - ((centro.getDay() + 6) % 7));

    const lista: IDiaCalendario[] = [];

    for (let i = 0; i < 7; i++) {
      const fechaActual = new Date(primerDiaSemana);
      fechaActual.setDate(primerDiaSemana.getDate() + i);

      const esHoy = fechaActual.getFullYear() === hoy.getFullYear() &&
                    fechaActual.getMonth() === hoy.getMonth() &&
                    fechaActual.getDate() === hoy.getDate();

      const esSeleccionado = fechaActual.getFullYear() === this.fechaSeleccionada.getFullYear() &&
                             fechaActual.getMonth() === this.fechaSeleccionada.getMonth() &&
                             fechaActual.getDate() === this.fechaSeleccionada.getDate();

      const citasDia = this.citas.filter(c => {
        const fc = new Date(c.fechaHora);
        return fc.getFullYear() === fechaActual.getFullYear() &&
               fc.getMonth() === fechaActual.getMonth() &&
               fc.getDate() === fechaActual.getDate();
      });

      const tieneUrgencias = citasDia.some(c => c.prioridad === 'URGENCIA' && c.estado !== 'CANCELADA');

      lista.push({
        fecha: fechaActual,
        numeroDia: fechaActual.getDate(),
        nombreDia: nombresDias[fechaActual.getDay()],
        esHoy,
        esSeleccionado,
        cantidadCitas: citasDia.length,
        tieneUrgencias
      });
    }

    this.diasVisualizados = lista;
  }
}
