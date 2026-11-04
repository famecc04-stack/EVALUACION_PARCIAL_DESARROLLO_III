import { IEntidadBase } from './base.model';

export type Especie = 'CANINO' | 'FELINO' | 'AVE' | 'ROEDOR' | 'EXOTICO';
export type SexoMascota = 'MACHO' | 'HEMBRA';
export type NivelRiesgoAnestesico = 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO';

export interface IAnimal extends IEntidadBase {
  nombre: string;
  especie: Especie;
  raza: string;
  fechaNacimiento: Date;
  sexo: SexoMascota;
  pesoKg: number;
}

export abstract class Animal implements IAnimal {
  private _id: string;
  private _nombre: string;
  private _especie: Especie;
  private _raza: string;
  private _fechaNacimiento: Date;
  private _sexo: SexoMascota;
  private _pesoKg: number;
  private _fechaCreacion: Date;
  private _fechaActualizacion: Date;

  constructor(
    id: string,
    nombre: string,
    especie: Especie,
    raza: string,
    fechaNacimiento: Date,
    sexo: SexoMascota,
    pesoKg: number,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ) {
    this._id = id;
    this._nombre = nombre;
    this._especie = especie;
    this._raza = raza;
    this._fechaNacimiento = new Date(fechaNacimiento);
    this._sexo = sexo;
    this._pesoKg = pesoKg;
    this._fechaCreacion = fechaCreacion;
    this._fechaActualizacion = fechaActualizacion;
  }

  public get id(): string {
    return this._id;
  }

  public set id(valor: string) {
    this._id = valor;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public set nombre(valor: string) {
    if (!valor || valor.trim().length === 0) {
      throw new Error('El nombre del animal no puede estar vacío');
    }
    this._nombre = valor.trim();
  }

  public get especie(): Especie {
    return this._especie;
  }

  public set especie(valor: Especie) {
    this._especie = valor;
  }

  public get raza(): string {
    return this._raza;
  }

  public set raza(valor: string) {
    this._raza = valor ? valor.trim() : 'Mestizo';
  }

  public get fechaNacimiento(): Date {
    return this._fechaNacimiento;
  }

  public set fechaNacimiento(valor: Date) {
    this._fechaNacimiento = new Date(valor);
  }

  public get sexo(): SexoMascota {
    return this._sexo;
  }

  public set sexo(valor: SexoMascota) {
    this._sexo = valor;
  }

  public get pesoKg(): number {
    return this._pesoKg;
  }

  public set pesoKg(valor: number) {
    if (valor <= 0) {
      throw new Error('El peso debe ser mayor a cero');
    }
    this._pesoKg = Number(valor.toFixed(2));
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

  public calcularEdad(): { anos: number; meses: number; texto: string } {
    const hoy = new Date();
    const nacimiento = new Date(this._fechaNacimiento);
    let anos = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) {
      anos--;
      meses += 12;
    }

    let texto = '';
    if (anos > 0) {
      texto = `${anos} año${anos > 1 ? 's' : ''}${meses > 0 ? ` y ${meses} m` : ''}`;
    } else {
      texto = `${meses} mes${meses !== 1 ? 'es' : ''}`;
    }

    return { anos, meses, texto };
  }

  public abstract calcularDosisMedicamento(concentracionMgPorKg: number): number;

  public abstract obtenerFichaClinica(): string;

  public abstract clasificarRiesgoAnestesico(): NivelRiesgoAnestesico;
}
