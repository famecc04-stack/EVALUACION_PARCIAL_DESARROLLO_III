import { IEntidadBase } from './base.model';

export type TipoRegistroHistorial =
  | 'CONSULTA'
  | 'VACUNA'
  | 'CIRUGIA'
  | 'PROCEDIMIENTO'
  | 'EXAMEN_LABORATORIO';

export interface IConstantesVitales {
  temperaturaCorporal: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  pesoKg: number;
}

export interface ITratamiento {
  medicamento: string;
  dosisMg: number;
  frecuenciaHoras: number;
  duracionDias: number;
  instrucciones: string;
}

export interface IVacuna {
  nombreVacuna: string;
  lote: string;
  fechaProximaDosis?: Date;
  laboratorio: string;
}

export interface IHistorialMedico extends IEntidadBase {
  mascotaId: string;
  citaId?: string;
  fechaAtencion: Date;
  veterinarioNombre: string;
  tipoRegistro: TipoRegistroHistorial;
  anamnesis: string;
  examenFisico: IConstantesVitales;
  diagnostico: string;
  tratamientos: ITratamiento[];
  vacunasAplicadas: IVacuna[];
  observaciones: string;
}
