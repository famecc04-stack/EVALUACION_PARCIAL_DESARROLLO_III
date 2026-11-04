import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  ICredenciales,
  ISesionUsuario,
  Permiso,
  PERMISOS_POR_ROL,
  RolUsuario
} from '../../models/auth.model';
import { StorageService } from './storage.service';

type UsuarioDemo = Omit<ISesionUsuario, 'token' | 'expiracion'>;

/** Usuarios de demostración (simulan la respuesta de un backend de autenticación). */
const USUARIOS_DEMO: Readonly<Record<string, UsuarioDemo>> = {
  'amorales@veterinaria.com': {
    id: 'USR-001',
    nombre: 'Dr. Alejandro Morales',
    correo: 'amorales@veterinaria.com',
    rol: 'VETERINARIO',
    veterinarioId: 'VET-001'
  },
  'mcastillo@veterinaria.com': {
    id: 'USR-002',
    nombre: 'Dra. Mariana Castillo',
    correo: 'mcastillo@veterinaria.com',
    rol: 'VETERINARIO',
    veterinarioId: 'VET-002'
  },
  'recepcion@veterinaria.com': {
    id: 'USR-003',
    nombre: 'Sofía Paredes',
    correo: 'recepcion@veterinaria.com',
    rol: 'RECEPCIONISTA'
  },
  'admin@veterinaria.com': {
    id: 'USR-004',
    nombre: 'Administrador General',
    correo: 'admin@veterinaria.com',
    rol: 'ADMIN'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'clinica_veterinaria_auth_sesion_v2';
  private sesionSubject: BehaviorSubject<ISesionUsuario | null>;
  public sesion$: Observable<ISesionUsuario | null>;

  constructor(private storageService: StorageService) {
    const sesionGuardada = this.storageService.obtener<ISesionUsuario>(this.STORAGE_KEY);
    const sesionValida = sesionGuardada && new Date(sesionGuardada.expiracion).getTime() > Date.now()
      ? sesionGuardada
      : null;
    this.sesionSubject = new BehaviorSubject<ISesionUsuario | null>(sesionValida);
    this.sesion$ = this.sesionSubject.asObservable();
  }

  public get usuarioActual(): ISesionUsuario | null {
    return this.sesionSubject.value;
  }

  public estaAutenticado(): boolean {
    return this.sesionSubject.value !== null;
  }

  public tieneRol(rolesPermitidos: RolUsuario[]): boolean {
    const usuario = this.sesionSubject.value;
    if (!usuario) {
      return false;
    }
    return rolesPermitidos.includes(usuario.rol);
  }

  /** Consulta la matriz PERMISOS_POR_ROL para el usuario en sesión. */
  public tienePermiso(permiso: Permiso): boolean {
    const usuario = this.sesionSubject.value;
    if (!usuario) {
      return false;
    }
    return PERMISOS_POR_ROL[usuario.rol].includes(permiso);
  }

  public static usuariosDemo(): UsuarioDemo[] {
    return Object.values(USUARIOS_DEMO);
  }

  public iniciarSesion(credenciales: ICredenciales): Observable<ISesionUsuario> {
    const correo = (credenciales.correo || '').trim().toLowerCase();
    const usuario = USUARIOS_DEMO[correo];

    if (!usuario) {
      return throwError(() => new Error('El correo no corresponde a un usuario registrado.'));
    }

    const sesion: ISesionUsuario = {
      ...usuario,
      token: 'jwt_veterinaria_demo_token_' + Date.now(),
      expiracion: new Date(Date.now() + 8 * 60 * 60 * 1000)
    };
    this.storageService.guardar(this.STORAGE_KEY, sesion);
    this.sesionSubject.next(sesion);
    return of(sesion);
  }

  public cerrarSesion(): void {
    this.storageService.eliminar(this.STORAGE_KEY);
    this.sesionSubject.next(null);
  }
}
