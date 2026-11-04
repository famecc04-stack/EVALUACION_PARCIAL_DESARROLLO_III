import { Persona, IPersona } from './persona.model';

export interface IDueno extends IPersona {
  contactoEmergencia: string;
  idsMascotas: string[];
}

export class Dueno extends Persona implements IDueno {
  private _contactoEmergencia: string;
  private _idsMascotas: string[];

  constructor(
    id: string,
    nombre: string,
    apellido: string,
    documentoIdentidad: string,
    telefono: string,
    correoElectronico: string,
    direccion: string,
    contactoEmergencia: string = '',
    idsMascotas: string[] = [],
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
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
    this._contactoEmergencia = contactoEmergencia;
    this._idsMascotas = [...idsMascotas];
  }

  public get contactoEmergencia(): string {
    return this._contactoEmergencia;
  }

  public set contactoEmergencia(valor: string) {
    this._contactoEmergencia = valor ? valor.trim() : '';
  }

  public get idsMascotas(): string[] {
    return [...this._idsMascotas];
  }

  public asociarMascota(mascotaId: string): void {
    if (!mascotaId) {
      throw new Error('Identificador de mascota requerido');
    }
    if (!this._idsMascotas.includes(mascotaId)) {
      this._idsMascotas.push(mascotaId);
      this.fechaActualizacion = new Date();
    }
  }

  public desasociarMascota(mascotaId: string): void {
    const indice = this._idsMascotas.indexOf(mascotaId);
    if (indice !== -1) {
      this._idsMascotas.splice(indice, 1);
      this.fechaActualizacion = new Date();
    }
  }

  public tieneMascotasRegistradas(): boolean {
    return this._idsMascotas.length > 0;
  }

  public override obtenerRol(): string {
    return 'DUEÑO';
  }

  public override obtenerContactoPrincipal(): string {
    return `Tel: ${this.telefono} | Correo: ${this.correoElectronico}`;
  }

  public static desdeObjeto(obj: Partial<IDueno>): Dueno {
    return new Dueno(
      obj.id || '',
      obj.nombre || '',
      obj.apellido || '',
      obj.documentoIdentidad || '',
      obj.telefono || '',
      obj.correoElectronico || '',
      obj.direccion || '',
      obj.contactoEmergencia || '',
      obj.idsMascotas || [],
      obj.fechaCreacion ? new Date(obj.fechaCreacion) : new Date(),
      obj.fechaActualizacion ? new Date(obj.fechaActualizacion) : new Date()
    );
  }
}
