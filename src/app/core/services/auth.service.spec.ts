import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

describe('AuthService - roles y permisos', () => {
  let servicio: AuthService;

  beforeEach(() => {
    localStorage.clear();
    servicio = new AuthService(new StorageService());
  });

  it('asigna el rol según el usuario que inicia sesión', () => {
    servicio.iniciarSesion({ correo: 'recepcion@veterinaria.com', password: '123456' }).subscribe();
    expect(servicio.usuarioActual?.rol).toBe('RECEPCIONISTA');
  });

  it('recepción agenda citas pero no accede al historial clínico', () => {
    servicio.iniciarSesion({ correo: 'recepcion@veterinaria.com', password: '123456' }).subscribe();
    expect(servicio.tienePermiso('CITAS_AGENDAR')).toBe(true);
    expect(servicio.tienePermiso('HISTORIAL_VER')).toBe(false);
  });

  it('el veterinario atiende y registra en historial, pero no agenda', () => {
    servicio.iniciarSesion({ correo: 'amorales@veterinaria.com', password: '123456' }).subscribe();
    expect(servicio.tienePermiso('CITAS_ATENDER')).toBe(true);
    expect(servicio.tienePermiso('HISTORIAL_REGISTRAR')).toBe(true);
    expect(servicio.tienePermiso('CITAS_AGENDAR')).toBe(false);
    expect(servicio.usuarioActual?.veterinarioId).toBe('VET-001');
  });

  it('el administrador ve reportes y el historial en solo lectura', () => {
    servicio.iniciarSesion({ correo: 'admin@veterinaria.com', password: '123456' }).subscribe();
    expect(servicio.tienePermiso('REPORTES_VER')).toBe(true);
    expect(servicio.tienePermiso('HISTORIAL_VER')).toBe(true);
    expect(servicio.tienePermiso('HISTORIAL_REGISTRAR')).toBe(false);
  });

  it('rechaza correos que no pertenecen a un usuario registrado', () => {
    let error = '';
    servicio.iniciarSesion({ correo: 'otro@correo.com', password: '123456' })
      .subscribe({ error: (e: Error) => error = e.message });
    expect(error).toContain('no corresponde');
    expect(servicio.estaAutenticado()).toBe(false);
  });
});
