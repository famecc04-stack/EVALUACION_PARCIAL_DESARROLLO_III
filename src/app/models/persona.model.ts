import { IEntidadBase } from './base.model';

export interface IPersona extends IEntidadBase {
  nombre: string;
  apellido: string;
  documentoIdentidad: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
}

export abstract class Persona implements IPersona {
  private _id: string;
  private _nombre: string;
  private _apellido: string;
  private _documentoIdentidad: string;
  private _telefono: string;
  private _correoElectronico: string;
  private _direccion: string;
  private _fechaCreacion: Date;
  private _fechaActualizacion: Date;

  constructor(
    id: string,
    nombre: string,
    apellido: string,
    documentoIdentidad: string,
    telefono: string,
    correoElectronico: string,
    direccion: string,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ) {
    this._id = id;
    this._nombre = nombre;
    this._apellido = apellido;
    this._documentoIdentidad = documentoIdentidad;
    this._telefono = telefono;
    this._correoElectronico = correoElectronico;
    this._direccion = direccion;
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = fechaActualizacion;
  }

  public get id(): string {
    return this._id;
  }

  public set id(valor: string) {
    if (!valor || valor.trim().length === 0) {
      throw new Error('El identificador no puede estar vacío');
    }
    this._id = valor;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public set nombre(valor: string) {
    if (!valor || valor.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }
    this._nombre = valor.trim();
  }

  public get apellido(): string {
    return this._apellido;
  }

  public set apellido(valor: string) {
    if (!valor || valor.trim().length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }
    this._apellido = valor.trim();
  }

  public get documentoIdentidad(): string {
    return this._documentoIdentidad;
  }

  public set documentoIdentidad(valor: string) {
    if (!valor || valor.trim().length < 8) {
      throw new Error('Documento de identidad no válido');
    }
    this._documentoIdentidad = valor.trim();
  }

  public get telefono(): string {
    return this._telefono;
  }

  public set telefono(valor: string) {
    this._telefono = valor ? valor.trim() : '';
  }

  public get correoElectronico(): string {
    return this._correoElectronico;
  }

  public set correoElectronico(valor: string) {
    this._correoElectronico = valor ? valor.trim().toLowerCase() : '';
  }

  public get direccion(): string {
    return this._direccion;
  }

  public set direccion(valor: string) {
    this._direccion = valor ? valor.trim() : '';
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

  public get nombreCompleto(): string {
    return `${this._nombre} ${this._apellido}`.trim();
  }

  public abstract obtenerRol(): string;

  public abstract obtenerContactoPrincipal(): string;
}
