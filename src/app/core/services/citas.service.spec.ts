import { CitasService } from './citas.service';
import { StorageService } from './storage.service';
import { ICita } from '../../models/cita.model';
import { FechaUtils } from '../../shared/utils/fecha.utils';

/** Devuelve un día hábil (lun-sáb) a `dias` días o más de hoy, a la hora indicada. */
function diaHabilFuturo(dias: number, hora: string): Date {
  const fecha = FechaUtils.inicioDelDia();
  fecha.setDate(fecha.getDate() + dias);
  while (FechaUtils.esDomingo(fecha)) {
    fecha.setDate(fecha.getDate() + 1);
  }
  return FechaUtils.combinarFechaHora(FechaUtils.aFechaIso(fecha), hora);
}

function datosCita(parcial: Partial<ICita>): Partial<ICita> {
  return {
    mascotaId: 'MAS-001',
    mascotaNombre: 'Thor',
    duenoId: 'DUE-001',
    veterinarioId: 'VET-001',
    veterinarioNombre: 'Dr. Alejandro Morales',
    motivo: 'CONTROL_RUTINA',
    descripcionSintomas: 'Control general',
    prioridad: 'MEDIA',
    duracionMinutos: 30,
    ...parcial
  };
}

describe('CitasService - reglas de agendamiento', () => {
  let servicio: CitasService;

  beforeEach(() => {
    localStorage.clear();
    servicio = new CitasService(new StorageService());
  });

  it('rechaza citas en fechas pasadas', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    ayer.setHours(9, 0, 0, 0);
    expect(servicio.validarNuevaCita(datosCita({ fechaHora: ayer }))).toContain('pasadas');
  });

  it('rechaza citas en domingo', () => {
    const domingo = FechaUtils.inicioDelDia();
    domingo.setDate(domingo.getDate() + 7 + ((7 - domingo.getDay()) % 7));
    domingo.setHours(9, 0, 0, 0);
    expect(servicio.validarNuevaCita(datosCita({ fechaHora: domingo }))).toContain('domingos');
  });

  it('no permite que el mismo veterinario tenga dos citas a la misma hora', () => {
    const fecha = diaHabilFuturo(3, '09:00');
    let error: string | null = null;

    servicio.agendarCita(datosCita({ fechaHora: fecha })).subscribe();
    servicio.agendarCita(datosCita({ fechaHora: fecha, mascotaId: 'MAS-002', mascotaNombre: 'Michi' }))
      .subscribe({ error: (e: Error) => error = e.message });

    expect(error).toContain('ya tiene una cita');
  });

  it('sí permite la misma hora con otro veterinario', () => {
    const fecha = diaHabilFuturo(3, '09:00');
    servicio.agendarCita(datosCita({ fechaHora: fecha })).subscribe();
    const resultado = servicio.validarNuevaCita(datosCita({
      fechaHora: fecha, mascotaId: 'MAS-002', veterinarioId: 'VET-002'
    }));
    expect(resultado).toBeNull();
  });

  it('una cita de 60 min bloquea también el turno siguiente del médico', () => {
    const fecha = diaHabilFuturo(3, '10:00');
    servicio.agendarCita(datosCita({ fechaHora: fecha, duracionMinutos: 60 })).subscribe();

    const libres = servicio.calcularHorariosDisponibles(fecha, 'VET-001', 30);
    expect(libres).not.toContain('10:00');
    expect(libres).not.toContain('10:30');
    expect(libres).toContain('11:00');
  });

  it('guarda la cita en el día exacto elegido (sin desfase por zona horaria)', () => {
    const fechaIso = FechaUtils.aFechaIso(diaHabilFuturo(4, '08:00'));
    let guardada: Date | undefined;
    servicio.agendarCita(datosCita({ fechaHora: FechaUtils.combinarFechaHora(fechaIso, '15:00') }))
      .subscribe(c => guardada = c.fechaHora);
    expect(FechaUtils.aFechaIso(guardada!)).toBe(fechaIso);
    expect(FechaUtils.aHora(guardada!)).toBe('15:00');
  });
});
