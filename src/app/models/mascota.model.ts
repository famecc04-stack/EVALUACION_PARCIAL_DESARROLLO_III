import { Animal, IAnimal, Especie, SexoMascota, NivelRiesgoAnestesico } from './animal.model';

export interface IMascota extends IAnimal {
  duenoId: string;
  esterilizado: boolean;
  microchip?: string;
  alergias: string[];
  condicionesPreexistentes: string[];
}

export class Mascota extends Animal implements IMascota {
  private _duenoId: string;
  private _esterilizado: boolean;
  private _microchip?: string;
  private _alergias: string[];
  private _condicionesPreexistentes: string[];

  constructor(
    id: string,
    nombre: string,
    especie: Especie,
    raza: string,
    fechaNacimiento: Date,
    sexo: SexoMascota,
    pesoKg: number,
    duenoId: string,
    esterilizado: boolean = false,
    alergias: string[] = [],
    condicionesPreexistentes: string[] = [],
    microchip?: string,
    fechaCreacion: Date = new Date(),
    fechaActualizacion: Date = new Date()
  ) {
    super(
      id,
      nombre,
      especie,
      raza,
      fechaNacimiento,
      sexo,
      pesoKg,
      fechaCreacion,
      fechaActualizacion
    );
    this._duenoId = duenoId;
    this._esterilizado = esterilizado;
    this._alergias = [...alergias];
    this._condicionesPreexistentes = [...condicionesPreexistentes];
    this._microchip = microchip;
  }

  public get duenoId(): string {
    return this._duenoId;
  }

  public set duenoId(valor: string) {
    if (!valor || valor.trim().length === 0) {
      throw new Error('El ID del dueño es obligatorio');
    }
    this._duenoId = valor;
  }

  public get esterilizado(): boolean {
    return this._esterilizado;
  }

  public set esterilizado(valor: boolean) {
    this._esterilizado = valor;
  }

  public get microchip(): string | undefined {
    return this._microchip;
  }

  public set microchip(valor: string | undefined) {
    this._microchip = valor ? valor.trim() : undefined;
  }

  public get alergias(): string[] {
    return [...this._alergias];
  }

  public set alergias(lista: string[]) {
    this._alergias = Array.isArray(lista) ? [...lista] : [];
  }

  public get condicionesPreexistentes(): string[] {
    return [...this._condicionesPreexistentes];
  }

  public set condicionesPreexistentes(lista: string[]) {
    this._condicionesPreexistentes = Array.isArray(lista) ? [...lista] : [];
  }

  public agregarAlergia(alergia: string): void {
    const normalizada = alergia.trim();
    if (normalizada && !this._alergias.includes(normalizada)) {
      this._alergias.push(normalizada);
      this.fechaActualizacion = new Date();
    }
  }

  public agregarCondicion(condicion: string): void {
    const normalizada = condicion.trim();
    if (normalizada && !this._condicionesPreexistentes.includes(normalizada)) {
      this._condicionesPreexistentes.push(normalizada);
      this.fechaActualizacion = new Date();
    }
  }

  public override calcularDosisMedicamento(concentracionMgPorKg: number): number {
    let factorMetabolico = 1.0;
    switch (this.especie) {
      case 'FELINO':
        factorMetabolico = 0.85;
        break;
      case 'CANINO':
        factorMetabolico = 1.0;
        break;
      case 'AVE':
        factorMetabolico = 1.3;
        break;
      case 'ROEDOR':
        factorMetabolico = 1.5;
        break;
      case 'EXOTICO':
        factorMetabolico = 0.75;
        break;
    }
    const dosisTotal = this.pesoKg * concentracionMgPorKg * factorMetabolico;
    return Number(dosisTotal.toFixed(2));
  }

  public override obtenerFichaClinica(): string {
    const edad = this.calcularEdad();
    return `Paciente: ${this.nombre} | Especie: ${this.especie} | Raza: ${this.raza} | Edad: ${edad.texto} | Peso: ${this.pesoKg}kg | Esterilizado: ${this.esterilizado ? 'Sí' : 'No'}`;
  }

  public override clasificarRiesgoAnestesico(): NivelRiesgoAnestesico {
    const edad = this.calcularEdad();
    const tieneComorbilidades = this._condicionesPreexistentes.length > 0;
    const esSenior = (this.especie === 'CANINO' && edad.anos >= 8) ||
                     (this.especie === 'FELINO' && edad.anos >= 10);

    if (esSenior && tieneComorbilidades) {
      return 'CRITICO';
    }
    if (tieneComorbilidades || esSenior) {
      return 'ALTO';
    }
    if (this._alergias.length > 0 || this.pesoKg < 2) {
      return 'MODERADO';
    }
    return 'BAJO';
  }

  public static desdeObjeto(obj: Partial<IMascota>): Mascota {
    return new Mascota(
      obj.id || '',
      obj.nombre || '',
      obj.especie || 'CANINO',
      obj.raza || 'Mestizo',
      obj.fechaNacimiento ? new Date(obj.fechaNacimiento) : new Date(),
      obj.sexo || 'MACHO',
      Number(obj.pesoKg) || 1,
      obj.duenoId || '',
      Boolean(obj.esterilizado),
      obj.alergias || [],
      obj.condicionesPreexistentes || [],
      obj.microchip,
      obj.fechaCreacion ? new Date(obj.fechaCreacion) : new Date(),
      obj.fechaActualizacion ? new Date(obj.fechaActualizacion) : new Date()
    );
  }
}
