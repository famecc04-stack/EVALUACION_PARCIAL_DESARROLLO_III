export type RolUsuario = 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA';

/**
 * Acciones del sistema que se controlan por rol.
 * Cada pantalla/botón pregunta por un permiso (no por un rol), así la matriz
 * de abajo es el único lugar donde se decide "quién puede hacer qué".
 */
export type Permiso =
  | 'CITAS_VER_TODAS'      // ver la agenda de todos los veterinarios
  | 'CITAS_AGENDAR'        // registrar nuevas citas
  | 'CITAS_CANCELAR'       // cancelar citas programadas
  | 'CITAS_ATENDER'        // iniciar / finalizar la atención de una cita
  | 'MASCOTAS_REGISTRAR'   // alta de pacientes y propietarios
  | 'HISTORIAL_VER'        // consultar el historial clínico
  | 'HISTORIAL_REGISTRAR'  // registrar atenciones en el historial clínico
  | 'REPORTES_VER';        // indicadores de gestión (ingresos estimados, etc.)

export const PERMISOS_POR_ROL: Readonly<Record<RolUsuario, readonly Permiso[]>> = {
  // Recepción: gestiona la agenda y el registro de pacientes. No accede a datos clínicos.
  RECEPCIONISTA: ['CITAS_VER_TODAS', 'CITAS_AGENDAR', 'CITAS_CANCELAR', 'MASCOTAS_REGISTRAR'],
  // Veterinario: ve solo SU agenda, atiende citas y registra atenciones clínicas.
  VETERINARIO: ['CITAS_ATENDER', 'HISTORIAL_VER', 'HISTORIAL_REGISTRAR'],
  // Administrador: supervisa toda la clínica (agenda, pacientes, historial en modo lectura e indicadores).
  ADMIN: ['CITAS_VER_TODAS', 'CITAS_AGENDAR', 'CITAS_CANCELAR', 'MASCOTAS_REGISTRAR', 'HISTORIAL_VER', 'REPORTES_VER']
};

export const DESCRIPCION_ROL: Readonly<Record<RolUsuario, string>> = {
  ADMIN: 'Administrador',
  VETERINARIO: 'Médico Veterinario',
  RECEPCIONISTA: 'Recepción'
};

export interface ICredenciales {
  correo: string;
  password: string;
}

export interface ISesionUsuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  /** Solo para el rol VETERINARIO: id del médico, usado para filtrar su agenda. */
  veterinarioId?: string;
  token: string;
  expiracion: Date;
}
