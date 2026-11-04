export interface IEntidadBase {
  id: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface IRespuestaOperacion<T> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  errores?: string[];
}
