import { FormControl } from '@angular/forms';
import { ClinicaValidators } from './clinica-validators';

describe('ClinicaValidators', () => {
  it('debe validar DNI de exactamente 8 dígitos', () => {
    const controlValido = new FormControl('45871236');
    const controlInvalidoLetras = new FormControl('4587123A');
    const controlInvalidoLongitud = new FormControl('12345');

    expect(ClinicaValidators.documentoIdentidad(controlValido)).toBeNull();
    expect(ClinicaValidators.documentoIdentidad(controlInvalidoLetras)).toBeTruthy();
    expect(ClinicaValidators.documentoIdentidad(controlInvalidoLongitud)).toBeTruthy();
  });

  it('debe validar teléfono móvil peruano de 9 dígitos iniciando en 9', () => {
    const controlValido = new FormControl('987654321');
    const controlInvalidoInicio = new FormControl('887654321');
    const controlInvalidoLongitud = new FormControl('98765432');

    expect(ClinicaValidators.telefono(controlValido)).toBeNull();
    expect(ClinicaValidators.telefono(controlInvalidoInicio)).toBeTruthy();
    expect(ClinicaValidators.telefono(controlInvalidoLongitud)).toBeTruthy();
  });

  it('debe validar que el peso sea estrictamente positivo', () => {
    const controlPositivo = new FormControl(12.5);
    const controlCero = new FormControl(0);
    const controlNegativo = new FormControl(-3);

    expect(ClinicaValidators.pesoPositivo(controlPositivo)).toBeNull();
    expect(ClinicaValidators.pesoPositivo(controlCero)).toBeTruthy();
    expect(ClinicaValidators.pesoPositivo(controlNegativo)).toBeTruthy();
  });
});

describe('ClinicaValidators.fechaCitaValida', () => {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('rechaza una fecha pasada', () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    expect(ClinicaValidators.fechaCitaValida(new FormControl(iso(ayer)))).toHaveProperty('fechaPasada');
  });

  it('rechaza domingos y acepta un día hábil futuro', () => {
    const domingo = new Date();
    domingo.setDate(domingo.getDate() + 7 + ((7 - domingo.getDay()) % 7));
    const lunes = new Date(domingo);
    lunes.setDate(domingo.getDate() + 1);

    expect(ClinicaValidators.fechaCitaValida(new FormControl(iso(domingo)))).toHaveProperty('diaNoLaborable');
    expect(ClinicaValidators.fechaCitaValida(new FormControl(iso(lunes)))).toBeNull();
  });
});
