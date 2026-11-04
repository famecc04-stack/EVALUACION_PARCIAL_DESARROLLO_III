import { Mascota } from './mascota.model';
import { Dueno } from './dueno.model';
import { Cita } from './cita.model';

describe('Pruebas Unitarias de POO y Polimorfismo', () => {
  it('debe calcular dosis metabólica polimórfica según la especie canina y felina', () => {
    const perro = new Mascota(
      'MAS-TEST-1',
      'Firulais',
      'CANINO',
      'Labrador',
      new Date(2020, 1, 1),
      'MACHO',
      20,
      'DUE-1'
    );

    const gato = new Mascota(
      'MAS-TEST-2',
      'Gaturro',
      'FELINO',
      'Persa',
      new Date(2021, 1, 1),
      'MACHO',
      10,
      'DUE-2'
    );

    const dosisPerro = perro.calcularDosisMedicamento(10);
    const dosisGato = gato.calcularDosisMedicamento(10);

    expect(dosisPerro).toBe(200);
    expect(dosisGato).toBe(85);
  });

  it('debe clasificar riesgo anestésico correctamente según comorbilidades y edad', () => {
    const perroMayorComorbido = new Mascota(
      'MAS-TEST-3',
      'Rex',
      'CANINO',
      'Pastor Alemán',
      new Date(2014, 1, 1),
      'MACHO',
      32,
      'DUE-1',
      false,
      [],
      ['Insuficiencia Renal']
    );

    const cachorroSano = new Mascota(
      'MAS-TEST-4',
      'Bobi',
      'CANINO',
      'Poodle',
      new Date(2024, 1, 1),
      'MACHO',
      5,
      'DUE-1'
    );

    expect(perroMayorComorbido.clasificarRiesgoAnestesico()).toBe('CRITICO');
    expect(cachorroSano.clasificarRiesgoAnestesico()).toBe('BAJO');
  });

  it('debe encapsular atributos y validar mutaciones en Persona y Dueno', () => {
    const dueno = new Dueno(
      'DUE-TEST-1',
      'Ana',
      'Gómez',
      '12345678',
      '987654321',
      'ana@correo.com',
      'Lima'
    );

    expect(dueno.nombreCompleto).toBe('Ana Gómez');
    expect(dueno.obtenerRol()).toBe('DUEÑO');

    dueno.asociarMascota('MAS-999');
    expect(dueno.idsMascotas).toContain('MAS-999');
  });

  it('debe validar lógica de transición de estados y urgencia en Cita', () => {
    const cita = new Cita(
      'CIT-TEST',
      'MAS-1',
      'DUE-1',
      'VET-1',
      new Date(Date.now() + 1000000),
      'URGENCIA_MEDICA',
      'Traumatismo',
      'URGENCIA'
    );

    expect(cita.esUrgente()).toBe(true);
    expect(cita.puedeSerCancelada()).toBe(true);

    cita.transicionarA('EN_ATENCION');
    expect(cita.estado).toBe('EN_ATENCION');

    cita.transicionarA('COMPLETADA');
    expect(cita.estado).toBe('COMPLETADA');
    expect(() => cita.transicionarA('CANCELADA')).toThrow();
  });
});
