import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Dueno, IDueno } from '../../models/dueno.model';
import { Mascota, IMascota } from '../../models/mascota.model';
import { IHistorialMedico } from '../../models/historial.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class MascotasService {
  private readonly STORAGE_MASCOTAS = 'clinica_mascotas_db';
  private readonly STORAGE_DUENOS = 'clinica_duenos_db';
  private readonly STORAGE_HISTORIAL = 'clinica_historial_db';

  private duenosSubject: BehaviorSubject<Dueno[]>;
  private mascotasSubject: BehaviorSubject<Mascota[]>;
  private historialSubject: BehaviorSubject<IHistorialMedico[]>;

  public duenos$: Observable<Dueno[]>;
  public mascotas$: Observable<Mascota[]>;
  public historial$: Observable<IHistorialMedico[]>;

  constructor(private storageService: StorageService) {
    const duenosIniciales = this.cargarDuenosIniciales();
    const mascotasIniciales = this.cargarMascotasIniciales();
    const historialInicial = this.cargarHistorialInicial();

    this.duenosSubject = new BehaviorSubject<Dueno[]>(duenosIniciales);
    this.mascotasSubject = new BehaviorSubject<Mascota[]>(mascotasIniciales);
    this.historialSubject = new BehaviorSubject<IHistorialMedico[]>(historialInicial);

    this.duenos$ = this.duenosSubject.asObservable();
    this.mascotas$ = this.mascotasSubject.asObservable();
    this.historial$ = this.historialSubject.asObservable();
  }

  public obtenerMascotas(): Observable<Mascota[]> {
    return this.mascotas$;
  }

  public obtenerMascotaPorId(id: string): Observable<Mascota | undefined> {
    return this.mascotas$.pipe(
      map(lista => lista.find(m => m.id === id))
    );
  }

  public obtenerDuenos(): Observable<Dueno[]> {
    return this.duenos$;
  }

  public obtenerDuenoPorId(id: string): Observable<Dueno | undefined> {
    return this.duenos$.pipe(
      map(lista => lista.find(d => d.id === id))
    );
  }

  public registrarMascotaConDueno(
    datosDueno: Partial<IDueno>,
    datosMascota: Partial<IMascota>
  ): Observable<{ dueno: Dueno; mascota: Mascota }> {
    const duenosActuales = this.duenosSubject.value;
    let dueno = duenosActuales.find(
      d => d.documentoIdentidad === datosDueno.documentoIdentidad
    );

    const duenoId = dueno ? dueno.id : 'DUE-' + Date.now();
    const mascotaId = 'MAS-' + (Date.now() + 1);

    if (!dueno) {
      dueno = new Dueno(
        duenoId,
        datosDueno.nombre || '',
        datosDueno.apellido || '',
        datosDueno.documentoIdentidad || '',
        datosDueno.telefono || '',
        datosDueno.correoElectronico || '',
        datosDueno.direccion || '',
        datosDueno.contactoEmergencia || '',
        [mascotaId]
      );
      const nuevaListaDuenos = [...duenosActuales, dueno];
      this.actualizarDuenosStorage(nuevaListaDuenos);
    } else {
      dueno.asociarMascota(mascotaId);
      this.actualizarDuenosStorage([...duenosActuales]);
    }

    const nuevaMascota = new Mascota(
      mascotaId,
      datosMascota.nombre || '',
      datosMascota.especie || 'CANINO',
      datosMascota.raza || 'Mestizo',
      datosMascota.fechaNacimiento ? new Date(datosMascota.fechaNacimiento) : new Date(),
      datosMascota.sexo || 'MACHO',
      Number(datosMascota.pesoKg) || 1,
      duenoId,
      Boolean(datosMascota.esterilizado),
      datosMascota.alergias || [],
      datosMascota.condicionesPreexistentes || [],
      datosMascota.microchip
    );

    const nuevaListaMascotas = [...this.mascotasSubject.value, nuevaMascota];
    this.actualizarMascotasStorage(nuevaListaMascotas);

    const registroInicialHistorial: IHistorialMedico = {
      id: 'HIS-' + Date.now(),
      mascotaId: mascotaId,
      fechaAtencion: new Date(),
      veterinarioNombre: 'Dr. Alejandro Morales',
      tipoRegistro: 'CONSULTA',
      anamnesis: 'Ingreso inicial a la clínica veterinaria para registro clínico preventivo.',
      examenFisico: {
        temperaturaCorporal: 38.5,
        frecuenciaCardiaca: 110,
        frecuenciaRespiratoria: 24,
        pesoKg: nuevaMascota.pesoKg
      },
      diagnostico: 'Paciente clínicamente sano al momento de la apertura del expediente.',
      tratamientos: [],
      vacunasAplicadas: [],
      observaciones: 'Se apertura ficha clínica integral y se planifica calendario de vacunación.',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };
    this.agregarRegistroHistorial(registroInicialHistorial);

    return of({ dueno, mascota: nuevaMascota });
  }

  public actualizarMascota(mascota: Mascota): Observable<Mascota> {
    const lista = this.mascotasSubject.value;
    const indice = lista.findIndex(m => m.id === mascota.id);
    if (indice === -1) {
      return throwError(() => new Error('Mascota no encontrada'));
    }
    const listaActualizada = [...lista];
    listaActualizada[indice] = mascota;
    this.actualizarMascotasStorage(listaActualizada);
    return of(mascota);
  }

  public obtenerHistorialPorMascota(mascotaId: string): Observable<IHistorialMedico[]> {
    return this.historial$.pipe(
      map(lista => lista
        .filter(h => h.mascotaId === mascotaId)
        .sort((a, b) => new Date(b.fechaAtencion).getTime() - new Date(a.fechaAtencion).getTime())
      )
    );
  }

  public agregarRegistroHistorial(registro: IHistorialMedico): Observable<IHistorialMedico> {
    const lista = [...this.historialSubject.value, registro];
    this.actualizarHistorialStorage(lista);
    return of(registro);
  }

  private actualizarMascotasStorage(lista: Mascota[]): void {
    this.mascotasSubject.next(lista);
    const dto = lista.map(m => ({
      id: m.id,
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza,
      fechaNacimiento: m.fechaNacimiento,
      sexo: m.sexo,
      pesoKg: m.pesoKg,
      duenoId: m.duenoId,
      esterilizado: m.esterilizado,
      alergias: m.alergias,
      condicionesPreexistentes: m.condicionesPreexistentes,
      microchip: m.microchip,
      fechaCreacion: m.fechaCreacion,
      fechaActualizacion: m.fechaActualizacion
    }));
    this.storageService.guardar(this.STORAGE_MASCOTAS, dto);
  }

  private actualizarDuenosStorage(lista: Dueno[]): void {
    this.duenosSubject.next(lista);
    const dto = lista.map(d => ({
      id: d.id,
      nombre: d.nombre,
      apellido: d.apellido,
      documentoIdentidad: d.documentoIdentidad,
      telefono: d.telefono,
      correoElectronico: d.correoElectronico,
      direccion: d.direccion,
      contactoEmergencia: d.contactoEmergencia,
      idsMascotas: d.idsMascotas,
      fechaCreacion: d.fechaCreacion,
      fechaActualizacion: d.fechaActualizacion
    }));
    this.storageService.guardar(this.STORAGE_DUENOS, dto);
  }

  private actualizarHistorialStorage(lista: IHistorialMedico[]): void {
    this.historialSubject.next(lista);
    this.storageService.guardar(this.STORAGE_HISTORIAL, lista);
  }

  private cargarDuenosIniciales(): Dueno[] {
    const guardados = this.storageService.obtener<IDueno[]>(this.STORAGE_DUENOS);
    if (guardados && guardados.length > 0) {
      return guardados.map(d => Dueno.desdeObjeto(d));
    }

    return [
      new Dueno(
        'DUE-001',
        'Carlos',
        'Ramírez Mendoza',
        '45871236',
        '987654321',
        'carlos.ramirez@gmail.com',
        'Av. Primavera 450, Surco',
        '944112233',
        ['MAS-001']
      ),
      new Dueno(
        'DUE-002',
        'Lucía',
        'Fernández Soto',
        '70123456',
        '976543210',
        'lucia.fernandez@outlook.com',
        'Calle Las Palmeras 124, Miraflores',
        '955223344',
        ['MAS-002']
      ),
      new Dueno(
        'DUE-003',
        'Mateo',
        'Vargas Llosa',
        '41239874',
        '965432109',
        'mvargas@corporacion.pe',
        'Jr. San Martín 880, Barranco',
        '966334455',
        ['MAS-003']
      )
    ];
  }

  private cargarMascotasIniciales(): Mascota[] {
    const guardadas = this.storageService.obtener<IMascota[]>(this.STORAGE_MASCOTAS);
    if (guardadas && guardadas.length > 0) {
      return guardadas.map(m => Mascota.desdeObjeto(m));
    }

    return [
      new Mascota(
        'MAS-001',
        'Thor',
        'CANINO',
        'Golden Retriever',
        new Date(2021, 4, 15),
        'MACHO',
        28.5,
        'DUE-001',
        true,
        ['Polen'],
        ['Displasia de cadera leve'],
        'CHIP-982000412349'
      ),
      new Mascota(
        'MAS-002',
        'Michi',
        'FELINO',
        'Siamés',
        new Date(2022, 9, 10),
        'HEMBRA',
        4.2,
        'DUE-002',
        true,
        [],
        [],
        'CHIP-982000889123'
      ),
      new Mascota(
        'MAS-003',
        'Bruno',
        'CANINO',
        'Bulldog Francés',
        new Date(2019, 1, 20),
        'MACHO',
        13.8,
        'DUE-003',
        false,
        ['Penicilina'],
        ['Síndrome braquiocefálico'],
        'CHIP-982000554411'
      )
    ];
  }

  private cargarHistorialInicial(): IHistorialMedico[] {
    const guardado = this.storageService.obtener<IHistorialMedico[]>(this.STORAGE_HISTORIAL);
    if (guardado && guardado.length > 0) {
      return guardado;
    }

    return [
      {
        id: 'HIS-001',
        mascotaId: 'MAS-001',
        fechaAtencion: new Date(2026, 8, 12, 10, 30),
        veterinarioNombre: 'Dra. Mariana Castillo',
        tipoRegistro: 'VACUNA',
        anamnesis: 'Paciente acude a refuerzo anual de vacuna antirrábica y sextuple.',
        examenFisico: {
          temperaturaCorporal: 38.4,
          frecuenciaCardiaca: 95,
          frecuenciaRespiratoria: 20,
          pesoKg: 28.5
        },
        diagnostico: 'Paciente en óptimo estado fisiológico apto para inmunización.',
        tratamientos: [],
        vacunasAplicadas: [
          {
            nombreVacuna: 'Nobivac DHPPi + L',
            lote: 'NL-2026-X99',
            fechaProximaDosis: new Date(2027, 8, 12),
            laboratorio: 'MSD Animal Health'
          },
          {
            nombreVacuna: 'Defensor 3 (Antirrábica)',
            lote: 'DF-8812',
            fechaProximaDosis: new Date(2027, 8, 12),
            laboratorio: 'Zoetis'
          }
        ],
        observaciones: 'No presentó reacciones anafilácticas inmediatas. Se indica reposo por 24 horas.',
        fechaCreacion: new Date(2026, 8, 12),
        fechaActualizacion: new Date(2026, 8, 12)
      },
      {
        id: 'HIS-002',
        mascotaId: 'MAS-001',
        fechaAtencion: new Date(2026, 6, 5, 15, 0),
        veterinarioNombre: 'Dr. Alejandro Morales',
        tipoRegistro: 'CONSULTA',
        anamnesis: 'Propietario reporta claudicación leve en miembro pélvico derecho tras ejercicio prolongado.',
        examenFisico: {
          temperaturaCorporal: 38.6,
          frecuenciaCardiaca: 102,
          frecuenciaRespiratoria: 22,
          pesoKg: 28.2
        },
        diagnostico: 'Exacerbación de dolor articular secundario a displasia coxofemoral.',
        tratamientos: [
          {
            medicamento: 'Meloxicam 0.2%',
            dosisMg: 5.6,
            frecuenciaHoras: 24,
            duracionDias: 5,
            instrucciones: 'Administrar con comida una vez al día por las mañanas.'
          },
          {
            medicamento: 'Condroprotector Cosequin',
            dosisMg: 500,
            frecuenciaHoras: 24,
            duracionDias: 60,
            instrucciones: '1 tableta masticable cada 24 horas como suplementación articular.'
          }
        ],
        vacunasAplicadas: [],
        observaciones: 'Se recomienda moderar el ejercicio de impacto y control de peso estricto.',
        fechaCreacion: new Date(2026, 6, 5),
        fechaActualizacion: new Date(2026, 6, 5)
      },
      {
        id: 'HIS-003',
        mascotaId: 'MAS-002',
        fechaAtencion: new Date(2026, 7, 20, 11, 0),
        veterinarioNombre: 'Dra. Mariana Castillo',
        tipoRegistro: 'PROCEDIMIENTO',
        anamnesis: 'Limpieza dental por profilaxis ultrasónica de rutina y desparasitación.',
        examenFisico: {
          temperaturaCorporal: 38.2,
          frecuenciaCardiaca: 140,
          frecuenciaRespiratoria: 28,
          pesoKg: 4.2
        },
        diagnostico: 'Gingivitis marginal grado 1 resuelta.',
        tratamientos: [
          {
            medicamento: 'Profender Spot-on Felino',
            dosisMg: 30,
            frecuenciaHoras: 720,
            duracionDias: 1,
            instrucciones: 'Aplicar tópico en la base del cráneo para desparasitación interna.'
          }
        ],
        vacunasAplicadas: [],
        observaciones: 'Recuperación anestésica ambulatoria exitosa sin complicaciones.',
        fechaCreacion: new Date(2026, 7, 20),
        fechaActualizacion: new Date(2026, 7, 20)
      }
    ];
  }
}
