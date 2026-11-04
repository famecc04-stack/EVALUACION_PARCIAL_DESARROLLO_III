import { Persona, IPersona } from './persona.model';

export interface IVeterinario extends IPersona {
  numeroColegiatura: string;
  especialidad: string;
  activo: boolean;
}

export class Veterinario extends Persona implements IVeterinario {
  private _numeroColegiatura: string;
  private _especialidad: string;
  private _activo: boolean;
  private _tratamiento: 'Dr.' | 'Dra.';

  constructor(
    id: string,
    nombre: string,
    apellido: string,
    documentoIdentidad: string,
    telefono: string,
    correoElectronico: string,
    direccion: string,
    numeroColegiatura: string,
    especialidad: string,
    activo: boolean = true,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date(),
    tratamiento: 'Dr.' | 'Dra.' = 'Dr.'
  ) {
    super(
      id,
      nombre,
      apellido,
      documentoIdentidad,
      telefono,
      correoElectronico,
      direccion,
      fechaCreacion,
      fechaActualizacion
    );
    this._numeroColegiatura = numeroColegiatura;
    this._especialidad = especialidad;
    this._activo = activo;
    this._tratamiento = tratamiento;
  }

  /** Nombre con tratamiento profesional, p. ej. "Dra. Mariana Castillo". */
  public get nombreProfesional(): string {
    return `${this._tratamiento} ${this.nombre} ${this.apellido}`;
  }

  public get numeroColegiatura(): string {
    return this._numeroColegiatura;
  }

  public set numeroColegiatura(valor: string) {
    this._numeroColegiatura = valor.trim();
  }

  public get especialidad(): string {
    return this._especialidad;
  }

  public set especialidad(valor: string) {
    this._especialidad = valor.trim();
  }

  public get activo(): boolean {
    return this._activo;
  }

  public set activo(valor: boolean) {
    this._activo = valor;
  }

  public override obtenerRol(): string {
    return 'MEDICO_VETERINARIO';
  }

  public override obtenerContactoPrincipal(): string {
    return `Colegiatura: ${this._numeroColegiatura} | Tel: ${this.telefono}`;
  }

  public static desdeObjeto(obj: Partial<IVeterinario>): Veterinario {
    return new Veterinario(
      obj.id || '',
      obj.nombre || '',
      obj.apellido || '',
      obj.documentoIdentidad || '',
      obj.telefono || '',
      obj.correoElectronico || '',
      obj.direccion || '',
      obj.numeroColegiatura || '',
      obj.especialidad || 'Medicina General',
      obj.activo ?? true,
      obj.fechaCreacion ? new Date(obj.fechaCreacion) : new Date(),
      obj.fechaActualizacion ? new Date(obj.fechaActualizacion) : new Date()
    );
  }
}
