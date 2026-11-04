import { IEntidadBase } from './base.model';

export type EstadoCita = 'PROGRAMADA' | 'EN_ATENCION' | 'COMPLETADA' | 'CANCELADA';
export type PrioridadCita = 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENCIA';
export type MotivoConsulta =
  | 'CONTROL_RUTINA'
  | 'VACUNACION'
  | 'DESPARASITACION'
  | 'CIRUGIA'
  | 'URGENCIA_MEDICA'
  | 'DERMATOLOGIA'
  | 'ODONTOLOGIA';

export interface ICita extends IEntidadBase {
  mascotaId: string;
  mascotaNombre?: string;
  duenoId: string;
  duenoNombre?: string;
  veterinarioId: string;
  veterinarioNombre?: string;
  fechaHora: Date;
  motivo: MotivoConsulta;
  descripcionSintomas: string;
  estado: EstadoCita;
  prioridad: PrioridadCita;
  costoEstimado: number;
  duracionMinutos: number;
  notasVeterinario?: string;
}

export class Cita implements ICita {
  private _id: string;
  private _mascotaId: string;
  private _mascotaNombre?: string;
  private _duenoId: string;
  private _duenoNombre?: string;
  private _veterinarioId: string;
  private _veterinarioNombre?: string;
  private _fechaHora: Date;
  private _motivo: MotivoConsulta;
  private _descripcionSintomas: string;
  private _estado: EstadoCita;
  private _prioridad: PrioridadCita;
  private _costoEstimado: number;
  private _duracionMinutos: number;
  private _notasVeterinario?: string;
  private _fechaCreacion: Date;
  private _fechaActualizacion: Date;

  constructor(
    id: string,
    mascotaId: string,
    duenoId: string,
    veterinarioId: string,
    fechaHora: Date,
    motivo: MotivoConsulta,
    descripcionSintomas: string,
    prioridad: PrioridadCita = 'MEDIA',
    costoEstimado: number = 0,
    duracionMinutos: number = 30,
    estado: EstadoCita = 'PROGRAMADA',
    mascotaNombre?: string,
    duenoNombre?: string,
    veterinarioNombre?: string,
    notasVeterinario?: string,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ) {
    this._id = id;
    this._mascotaId = mascotaId;
    this._duenoId = duenoId;
    this._veterinarioId = veterinarioId;
    this._fechaHora = new Date(fechaHora);
    this._motivo = motivo;
    this._descripcionSintomas = descripcionSintomas;
    this._prioridad = prioridad;
    this._costoEstimado = costoEstimado;
    this._duracionMinutos = duracionMinutos;
    this._estado = estado;
    this._mascotaNombre = mascotaNombre;
    this._duenoNombre = duenoNombre;
    this._veterinarioNombre = veterinarioNombre;
    this._notasVeterinario = notasVeterinario;
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = fechaActualizacion;
  }

  public get id(): string {
    return this._id;
  }

  public set id(valor: string) {
    this._id = valor;
  }

  public get mascotaId(): string {
    return this._mascotaId;
  }

  public set mascotaId(valor: string) {
    this._mascotaId = valor;
  }

  public get mascotaNombre(): string | undefined {
    return this._mascotaNombre;
  }

  public set mascotaNombre(valor: string | undefined) {
    this._mascotaNombre = valor;
  }

  public get duenoId(): string {
    return this._duenoId;
  }

  public set duenoId(valor: string) {
    this._duenoId = valor;
  }

  public get duenoNombre(): string | undefined {
    return this._duenoNombre;
  }

  public set duenoNombre(valor: string | undefined) {
    this._duenoNombre = valor;
  }

  public get veterinarioId(): string {
    return this._veterinarioId;
  }

  public set veterinarioId(valor: string) {
    this._veterinarioId = valor;
  }

  public get veterinarioNombre(): string | undefined {
    return this._veterinarioNombre;
  }

  public set veterinarioNombre(valor: string | undefined) {
    this._veterinarioNombre = valor;
  }

  public get fechaHora(): Date {
    return this._fechaHora;
  }

  public set fechaHora(valor: Date) {
    this._fechaHora = new Date(valor);
  }

  public get motivo(): MotivoConsulta {
    return this._motivo;
  }

  public set motivo(valor: MotivoConsulta) {
    this._motivo = valor;
  }

  public get descripcionSintomas(): string {
    return this._descripcionSintomas;
  }

  public set descripcionSintomas(valor: string) {
    this._descripcionSintomas = valor ? valor.trim() : '';
  }

  public get estado(): EstadoCita {
    return this._estado;
  }

  public set estado(valor: EstadoCita) {
    this._estado = valor;
  }

  public get prioridad(): PrioridadCita {
    return this._prioridad;
  }

  public set prioridad(valor: PrioridadCita) {
    this._prioridad = valor;
  }

  public get costoEstimado(): number {
    return this._costoEstimado;
  }

  public set costoEstimado(valor: number) {
    this._costoEstimado = valor >= 0 ? valor : 0;
  }

  public get duracionMinutos(): number {
    return this._duracionMinutos;
  }

  public set duracionMinutos(valor: number) {
    this._duracionMinutos = valor > 0 ? valor : 30;
  }

  public get notasVeterinario(): string | undefined {
    return this._notasVeterinario;
  }

  public set notasVeterinario(valor: string | undefined) {
    this._notasVeterinario = valor;
  }

  public get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  public set fechaCreacion(valor: Date) {
    this._fechaCreacion = valor;
  }

  public get fechaActualizacion(): Date {
    return this._fechaActualizacion;
  }

  public set fechaActualizacion(valor: Date) {
    this._fechaActualizacion = valor;
  }

  public estaProxima(enHoras: number = 24): boolean {
    const ahora = new Date().getTime();
    const fechaCita = new Date(this._fechaHora).getTime();
    const diferenciaMs = fechaCita - ahora;
    const limiteMs = enHoras * 60 * 60 * 1000;
    return diferenciaMs > 0 && diferenciaMs <= limiteMs;
  }

  public esUrgente(): boolean {
    return this._prioridad === 'URGENCIA';
  }

  public puedeSerCancelada(): boolean {
    return this._estado === 'PROGRAMADA';
  }

  public transicionarA(nuevoEstado: EstadoCita): void {
    if (this._estado === 'COMPLETADA' || this._estado === 'CANCELADA') {
      throw new Error(`No se puede modificar una cita con estado ${this._estado}`);
    }
    this._estado = nuevoEstado;
    this._fechaActualizacion = new Date();
  }

  public static desdeObjeto(obj: Partial<ICita>): Cita {
    return new Cita(
      obj.id || '',
      obj.mascotaId || '',
      obj.duenoId || '',
      obj.veterinarioId || '',
      obj.fechaHora ? new Date(obj.fechaHora) : new Date(),
      obj.motivo || 'CONTROL_RUTINA',
      obj.descripcionSintomas || '',
      obj.prioridad || 'MEDIA',
      Number(obj.costoEstimado) || 0,
      Number(obj.duracionMinutos) || 30,
      obj.estado || 'PROGRAMADA',
      obj.mascotaNombre,
      obj.duenoNombre,
      obj.veterinarioNombre,
      obj.notasVeterinario,
      obj.fechaCreacion ? new Date(obj.fechaCreacion) : new Date(),
      obj.fechaActualizacion ? new Date(obj.fechaActualizacion) : new Date()
    );
  }
}
