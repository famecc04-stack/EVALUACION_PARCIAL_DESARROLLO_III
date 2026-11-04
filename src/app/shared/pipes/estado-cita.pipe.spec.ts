import { EstadoCitaPipe } from './estado-cita.pipe';

describe('EstadoCitaPipe', () => {
  const pipe = new EstadoCitaPipe();

  it('debe transformar estados a etiquetas legibles en español', () => {
    expect(pipe.transform('PROGRAMADA', 'texto')).toBe('Programada');
    expect(pipe.transform('EN_ATENCION', 'texto')).toBe('En Atención');
    expect(pipe.transform('COMPLETADA', 'texto')).toBe('Completada');
    expect(pipe.transform('CANCELADA', 'texto')).toBe('Cancelada');
  });

  it('debe retornar clases badge de Bootstrap correspondientes', () => {
    expect(pipe.transform('PROGRAMADA', 'badge')).toContain('bg-primary');
    expect(pipe.transform('EN_ATENCION', 'badge')).toContain('bg-warning');
    expect(pipe.transform('COMPLETADA', 'badge')).toContain('bg-success');
    expect(pipe.transform('CANCELADA', 'badge')).toContain('bg-danger');
  });
});
