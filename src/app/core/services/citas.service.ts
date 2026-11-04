import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cita, ICita, EstadoCita, PrioridadCita, MotivoConsulta } from '../../models/cita.model';
import { StorageService } from './storage.service';
import { FechaUtils } from '../../shared/utils/fecha.utils';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  /** Turnos de atención (lunes a sábado). */
  public static readonly HORARIOS_BASE: readonly string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  private readonly STORAGE_CITAS = 'clinica_citas_db_v2';
  private citasSubject: BehaviorSubject<Cita[]>;
  public citas$: Observable<Cita[]>;

  constructor(private storageService: StorageService) {
    const citasIniciales = this.cargarCitasIniciales();
    this.citasSubject = new BehaviorSubject<Cita[]>(citasIniciales);
    this.citas$ = this.citasSubject.asObservable();
  }

  public obtenerCitas(): Observable<Cita[]> {
    return this.citas$;
  }

  public obtenerCitasPorFecha(fecha: Date): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => {
        const fechaCita = new Date(c.fechaHora);
        return fechaCita.getFullYear() === fecha.getFullYear() &&
               fechaCita.getMonth() === fecha.getMonth() &&
               fechaCita.getDate() === fecha.getDate();
      }))
    );
  }

  public obtenerCitasPorMascota(mascotaId: string): Observable<Cita[]> {
    return this.citas$.pipe(
      map(citas => citas.filter(c => c.mascotaId === mascotaId))
    );
  }

  /**
   * Registra una cita aplicando las reglas de negocio:
   *  - no se permiten fechas/horas pasadas ni domingos,
   *  - el veterinario no puede tener otra cita que se cruce en ese horario,
   *  - la mascota no puede tener dos citas que se crucen.
   * Si alguna regla falla, el Observable emite un error con el motivo.
   */
  public agendarCita(datosCita: Partial<ICita>): Observable<Cita> {
    const conflicto = this.validarNuevaCita(datosCita);
    if (conflicto) {
      return throwError(() => new Error(conflicto));
    }

    const nuevaCita = new Cita(
      'CIT-' + Date.now(),
      datosCita.mascotaId || '',
      datosCita.duenoId || '',
      datosCita.veterinarioId!,
      new Date(datosCita.fechaHora!),
      datosCita.motivo || 'CONTROL_RUTINA',
      datosCita.descripcionSintomas || '',
      datosCita.prioridad || 'MEDIA',
      Number(datosCita.costoEstimado) || 50,
      Number(datosCita.duracionMinutos) || 30,
      'PROGRAMADA',
      datosCita.mascotaNombre,
      datosCita.duenoNombre,
      datosCita.veterinarioNombre
    );

    const citasActuales = [...this.citasSubject.value, nuevaCita];
    this.actualizarStorage(citasActuales);
    return of(nuevaCita);
  }

  /** Devuelve el motivo por el que la cita NO puede registrarse, o null si es válida. */
  public validarNuevaCita(datos: Partial<ICita>): string | null {
    if (!datos.mascotaId) {
      return 'Debe seleccionar un paciente.';
    }
    if (!datos.veterinarioId) {
      return 'Debe seleccionar un médico veterinario.';
    }
    if (!datos.fechaHora) {
      return 'Debe indicar la fecha y hora de la cita.';
    }

    const inicio = new Date(datos.fechaHora);
    const duracion = Number(datos.duracionMinutos) || 30;

    if (inicio.getTime() <= Date.now()) {
      return 'No se pueden agendar citas en fechas u horas pasadas.';
    }
    if (FechaUtils.esDomingo(inicio)) {
      return 'La clínica no atiende los domingos.';
    }
    if (!CitasService.HORARIOS_BASE.includes(FechaUtils.aHora(inicio))) {
      return 'El horario seleccionado no corresponde a un turno de atención.';
    }

    const choqueVeterinario = this.buscarCruce(inicio, duracion, c => c.veterinarioId === datos.veterinarioId);
    if (choqueVeterinario) {
      return `${choqueVeterinario.veterinarioNombre || 'El veterinario'} ya tiene una cita a las ` +
             `${FechaUtils.aHora(choqueVeterinario.fechaHora)} (${choqueVeterinario.mascotaNombre}). Elija otro horario u otro médico.`;
    }

    const choqueMascota = this.buscarCruce(inicio, duracion, c => c.mascotaId === datos.mascotaId);
    if (choqueMascota) {
      return `${choqueMascota.mascotaNombre || 'La mascota'} ya tiene una cita a las ` +
             `${FechaUtils.aHora(choqueMascota.fechaHora)} con ${choqueMascota.veterinarioNombre}.`;
    }

    return null;
  }

  public cambiarEstadoCita(id: string, nuevoEstado: EstadoCita): Observable<Cita> {
    const citas = this.citasSubject.value;
    const cita = citas.find(c => c.id === id);
    if (!cita) {
      return throwError(() => new Error('Cita no encontrada'));
    }

    cita.transicionarA(nuevoEstado);
    const listaActualizada = [...citas];
    this.actualizarStorage(listaActualizada);
    return of(cita);
  }

  /**
   * Turnos libres de un veterinario en una fecha, considerando la duración de las
   * citas existentes (una cita de 45 min a las 10:00 bloquea 10:00 y 10:30).
   * Si la fecha es hoy, se excluyen las horas que ya pasaron.
   */
  public calcularHorariosDisponibles(fecha: Date, veterinarioId: string, duracionMinutos: number = 30): string[] {
    if (!veterinarioId || FechaUtils.esDomingo(fecha) || fecha < FechaUtils.inicioDelDia()) {
      return [];
    }
    const fechaIso = FechaUtils.aFechaIso(fecha);
    const ahora = Date.now();

    return CitasService.HORARIOS_BASE.filter(hora => {
      const inicio = FechaUtils.combinarFechaHora(fechaIso, hora);
      if (inicio.getTime() <= ahora) {
        return false;
      }
      return !this.buscarCruce(inicio, duracionMinutos, c => c.veterinarioId === veterinarioId);
    });
  }

  public obtenerHorariosDisponibles(fecha: Date, veterinarioId: string, duracionMinutos: number = 30): Observable<string[]> {
    return this.citas$.pipe(
      map(() => this.calcularHorariosDisponibles(fecha, veterinarioId, duracionMinutos))
    );
  }

  /** Busca una cita activa (no cancelada) que se cruce con el intervalo [inicio, inicio + duración). */
  private buscarCruce(inicio: Date, duracionMinutos: number, criterio: (c: Cita) => boolean): Cita | undefined {
    const inicioMs = inicio.getTime();
    const finMs = inicioMs + duracionMinutos * 60_000;
    return this.citasSubject.value.find(c => {
      if (c.estado === 'CANCELADA' || !criterio(c)) {
        return false;
      }
      const cInicio = new Date(c.fechaHora).getTime();
      const cFin = cInicio + c.duracionMinutos * 60_000;
      return inicioMs < cFin && cInicio < finMs;
    });
  }

  private actualizarStorage(lista: Cita[]): void {
    this.citasSubject.next(lista);
    const dto = lista.map(c => ({
      id: c.id,
      mascotaId: c.mascotaId,
      mascotaNombre: c.mascotaNombre,
      duenoId: c.duenoId,
      duenoNombre: c.duenoNombre,
      veterinarioId: c.veterinarioId,
      veterinarioNombre: c.veterinarioNombre,
      fechaHora: c.fechaHora,
      motivo: c.motivo,
      descripcionSintomas: c.descripcionSintomas,
      estado: c.estado,
      prioridad: c.prioridad,
      costoEstimado: c.costoEstimado,
      duracionMinutos: c.duracionMinutos,
      notasVeterinario: c.notasVeterinario,
      fechaCreacion: c.fechaCreacion,
      fechaActualizacion: c.fechaActualizacion
    }));
    this.storageService.guardar(this.STORAGE_CITAS, dto);
  }

  private cargarCitasIniciales(): Cita[] {
    const guardadas = this.storageService.obtener<ICita[]>(this.STORAGE_CITAS);
    if (guardadas && guardadas.length > 0) {
      return guardadas.map(c => Cita.desdeObjeto(c));
    }

    const hoy = new Date();
    const hoyHora10 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 10, 0);
    const hoyHora14 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 14, 30);
    const mananaHora9 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 9, 0);
    const mananaHora16 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 16, 0);

    return [
      new Cita(
        'CIT-101',
        'MAS-003',
        'DUE-003',
        'VET-001',
        hoyHora10,
        'URGENCIA_MEDICA',
        'Dificultad respiratoria aguda tras paseo y jadeo excesivo.',
        'URGENCIA',
        120,
        45,
        'PROGRAMADA',
        'Bruno',
        'Mateo Vargas Llosa',
        'Dr. Alejandro Morales'
      ),
      new Cita(
        'CIT-102',
        'MAS-001',
        'DUE-001',
        'VET-001',
        hoyHora14,
        'CONTROL_RUTINA',
        'Revisión traumatológica y seguimiento de medicación para displasia.',
        'MEDIA',
        60,
        30,
        'PROGRAMADA',
        'Thor',
        'Carlos Ramírez Mendoza',
        'Dr. Alejandro Morales'
      ),
      new Cita(
        'CIT-103',
        'MAS-002',
        'DUE-002',
        'VET-002',
        mananaHora9,
        'VACUNACION',
        'Vacuna triple felina anual y chequeo general.',
        'BAJA',
        45,
        30,
        'PROGRAMADA',
        'Michi',
        'Lucía Fernández Soto',
        'Dra. Mariana Castillo'
      ),
      new Cita(
        'CIT-104',
        'MAS-001',
        'DUE-001',
        'VET-003',
        mananaHora16,
        'ODONTOLOGIA',
        'Evaluación de acumulación de sarro en molares superiores.',
        'ALTA',
        85,
        40,
        'PROGRAMADA',
        'Thor',
        'Carlos Ramírez Mendoza',
        'Dr. Jorge Salazar'
      )
    ];
  }
}
