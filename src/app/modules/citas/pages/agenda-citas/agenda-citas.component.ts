import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CitasService } from '../../../../core/services/citas.service';
import { MascotasService } from '../../../../core/services/mascotas.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VeterinariosService } from '../../../../core/services/veterinarios.service';
import { Cita, EstadoCita, ICita, PrioridadCita } from '../../../../models/cita.model';
import { Mascota } from '../../../../models/mascota.model';
import { Dueno } from '../../../../models/dueno.model';
import { Veterinario } from '../../../../models/veterinario.model';
import { Permiso } from '../../../../models/auth.model';
import { ICriterioDisponibilidad } from '../../components/formulario-cita/formulario-cita.component';
import { FechaUtils } from '../../../../shared/utils/fecha.utils';

type FiltroEstado = EstadoCita | 'TODOS';
type FiltroPrioridad = PrioridadCita | 'TODOS';

export interface IAccionesCita {
  atender: boolean;
  cancelar: boolean;
  verHistorial: boolean;
}

@Component({
  selector: 'app-agenda-citas',
  templateUrl: './agenda-citas.component.html',
  styleUrls: ['./agenda-citas.component.scss'],
  standalone: false
})
export class AgendaCitasComponent implements OnInit {
  public todasLasCitas: Cita[] = [];
  public mascotas: Mascota[] = [];
  public duenos: Dueno[] = [];
  public veterinarios: Veterinario[] = [];
  public fechaSeleccionada: Date = new Date();
  public modalAgendarAbierto: boolean = false;
  public horariosDisponibles: string[] = [];
  public errorCita: string | null = null;

  /**
   * Filtros de la agenda. Se aplican a:
   *  1) el contador de citas de cada día del calendario semanal,
   *  2) la lista de citas del día seleccionado,
   *  3) el panel "Resultados del filtro", que lista TODAS las citas que cumplen
   *     el criterio (de cualquier fecha) para ubicarlas rápidamente.
   */
  public filtroEstado: FiltroEstado = 'TODOS';
  public filtroPrioridad: FiltroPrioridad = 'TODOS';
  public filtroVeterinario: string = 'TODOS';

  /** Acciones permitidas sobre cada cita según el rol en sesión. */
  public acciones: IAccionesCita = { atender: false, cancelar: false, verHistorial: false };

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private citasService: CitasService,
    private mascotasService: MascotasService,
    private veterinariosService: VeterinariosService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.acciones = {
      atender: this.puede('CITAS_ATENDER'),
      cancelar: this.puede('CITAS_CANCELAR'),
      verHistorial: this.puede('HISTORIAL_VER')
    };
    this.cargarDatos();
  }

  public puede(permiso: Permiso): boolean {
    return this.authService.tienePermiso(permiso);
  }

  /** Un veterinario solo ve su propia agenda; recepción y administración ven la de todos. */
  public get esAgendaPersonal(): boolean {
    return !this.puede('CITAS_VER_TODAS');
  }

  public get nombreUsuario(): string {
    return this.authService.usuarioActual?.nombre ?? '';
  }

  /** Citas que el usuario puede ver según su rol (antes de aplicar filtros). */
  public get citasVisibles(): Cita[] {
    if (!this.esAgendaPersonal) {
      return this.todasLasCitas;
    }
    const vetId = this.authService.usuarioActual?.veterinarioId;
    return this.todasLasCitas.filter(c => c.veterinarioId === vetId);
  }

  public get citasFiltradas(): Cita[] {
    return this.citasVisibles.filter(cita => {
      const coincideEstado = this.filtroEstado === 'TODOS' || cita.estado === this.filtroEstado;
      const coincidePrioridad = this.filtroPrioridad === 'TODOS' || cita.prioridad === this.filtroPrioridad;
      const coincideVet = this.filtroVeterinario === 'TODOS' || cita.veterinarioId === this.filtroVeterinario;
      return coincideEstado && coincidePrioridad && coincideVet;
    });
  }

  public get hayFiltrosActivos(): boolean {
    return this.filtroEstado !== 'TODOS' || this.filtroPrioridad !== 'TODOS' || this.filtroVeterinario !== 'TODOS';
  }

  /** Todas las citas que cumplen el filtro, ordenadas por fecha (para el panel de resultados). */
  public get resultadosFiltro(): Cita[] {
    return [...this.citasFiltradas].sort(
      (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
    );
  }

  public get totalUrgencias(): number {
    return this.citasVisibles.filter(c => c.prioridad === 'URGENCIA' && c.estado === 'PROGRAMADA').length;
  }

  public get totalEnAtencion(): number {
    return this.citasVisibles.filter(c => c.estado === 'EN_ATENCION').length;
  }

  public get totalProgramadas(): number {
    return this.citasVisibles.filter(c => c.estado === 'PROGRAMADA').length;
  }

  /** Indicador solo para ADMIN (permiso REPORTES_VER). */
  public get ingresosEstimados(): number {
    return this.citasVisibles
      .filter(c => c.estado !== 'CANCELADA')
      .reduce((total, c) => total + c.costoEstimado, 0);
  }

  /** Las tarjetas de indicadores funcionan como accesos directos a un filtro. */
  public aplicarFiltroRapido(estado: FiltroEstado, prioridad: FiltroPrioridad = 'TODOS'): void {
    this.filtroEstado = estado;
    this.filtroPrioridad = prioridad;
  }

  public limpiarFiltros(): void {
    this.filtroEstado = 'TODOS';
    this.filtroPrioridad = 'TODOS';
    this.filtroVeterinario = 'TODOS';
  }

  public irAFecha(cita: Cita): void {
    this.fechaSeleccionada = new Date(cita.fechaHora);
  }

  public alSeleccionarFecha(fecha: Date): void {
    this.fechaSeleccionada = fecha;
  }

  public abrirModalAgendar(): void {
    if (this.mascotas.length === 0) {
      this.notificationService.mostrarAdvertencia(
        'Debe registrar al menos un paciente antes de poder agendar citas médicas.'
      );
      this.router.navigate(['/mascotas/registro']);
      return;
    }
    this.errorCita = null;
    // Se precalculan los turnos con los mismos valores iniciales que usará el formulario.
    this.horariosDisponibles = this.citasService.calcularHorariosDisponibles(
      FechaUtils.siguienteDiaHabil(this.fechaSeleccionada),
      this.veterinarios[0]?.id ?? '',
      30
    );
    this.modalAgendarAbierto = true;
  }

  public cerrarModalAgendar(): void {
    this.modalAgendarAbierto = false;
    this.errorCita = null;
  }

  /** Recalcula los turnos libres cuando el formulario cambia fecha, hora, médico o duración. */
  public alConsultarDisponibilidad(criterio: ICriterioDisponibilidad): void {
    this.errorCita = null;
    const libres = isNaN(criterio.fecha.getTime())
      ? []
      : this.citasService.calcularHorariosDisponibles(criterio.fecha, criterio.veterinarioId, criterio.duracionMinutos);
    // Solo se reemplaza el arreglo si cambió su contenido (evita renders innecesarios).
    if (libres.join() !== this.horariosDisponibles.join()) {
      this.horariosDisponibles = libres;
    }
  }

  public procesarGuardarCita(datosCita: Partial<ICita>): void {
    this.citasService.agendarCita(datosCita).subscribe({
      next: (citaCreada) => {
        this.notificationService.mostrarExito(
          `Cita agendada para ${citaCreada.mascotaNombre} con ${citaCreada.veterinarioNombre} el ` +
          `${new Date(citaCreada.fechaHora).toLocaleDateString('es-PE')} a las ${FechaUtils.aHora(citaCreada.fechaHora)}.`
        );
        this.modalAgendarAbierto = false;
        this.errorCita = null;
        this.fechaSeleccionada = new Date(citaCreada.fechaHora);
      },
      error: (err: Error) => {
        // El servicio rechaza cruces de horario, fechas pasadas, domingos, etc.
        this.errorCita = err.message || 'Error al programar la cita médica.';
      }
    });
  }

  public alCambiarEstado(evento: { id: string; nuevoEstado: EstadoCita }): void {
    this.citasService.cambiarEstadoCita(evento.id, evento.nuevoEstado).subscribe({
      next: (citaModificada) => {
        this.notificationService.mostrarInfo(
          `Estado de la cita para ${citaModificada.mascotaNombre} cambiado a: ${citaModificada.estado}.`
        );
      },
      error: (err) => {
        this.notificationService.mostrarError(err.message || 'Error al actualizar estado.');
      }
    });
  }

  public navegarAHistorial(mascotaId: string): void {
    this.router.navigate(['/mascotas/historial'], {
      queryParams: { mascotaId }
    });
  }

  private cargarDatos(): void {
    this.cargarCitas();
    this.mascotasService.obtenerMascotas().subscribe(m => this.mascotas = m);
    this.mascotasService.obtenerDuenos().subscribe(d => this.duenos = d);
    this.veterinariosService.obtenerVeterinarios().subscribe(v => this.veterinarios = v);
  }

  /** Suscripción única: el BehaviorSubject del servicio emite la lista actualizada tras cada cambio. */
  private cargarCitas(): void {
    this.citasService.obtenerCitas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(citas => {
      this.todasLasCitas = citas;
    });
  }
}
