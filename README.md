# VETCLINIC PRO - Plataforma Integral de Gestión Veterinaria

Sistema web empresarial desarrollado con Angular y TypeScript orientado a digitalizar y optimizar el flujo de atención en clínicas veterinarias. La solución resuelve la gestión del registro de pacientes y propietarios, la programación dinámica de citas médicas con triaje de urgencias y el seguimiento pormenorizado del expediente clínico con dosificación farmacológica adaptativa.

---

## 1. Arquitectura de Software y Principios de Diseño

El sistema implementa una arquitectura modular guiada por el dominio (Domain-Driven Design), desacoplando responsabilidades en módulos altamente cohesivos:

* **CoreModule:** Provee servicios singleton para el ciclo de vida completo de la aplicación (`AuthService`, `MascotasService`, `CitasService`, `StorageService`, `NotificationService`) con protección ante reimportaciones.
* **SharedModule:** Exporta componentes reutilizables, directivas personalizadas, pipes de transformación y módulos comunes (`ReactiveFormsModule`, `FormsModule`).
* **AuthModule:** Gestiona la autenticación, control de sesiones y perfiles con guardas de rutas (`AuthGuard`).
* **MascotasModule:** Dominio clínico de registro de pacientes y expedientes médicos, integrando el patrón Smart/Dumb Components.
* **CitasModule:** Dominio de calendarización, agenda de turnos, priorización por urgencia y transiciones de estado de atención.

### Programación Orientada a Objetos (POO)

1. **Abstracción:** Definición de clases base abstractas `Persona` y `Animal` que estipulan contratos de dominio y modelos de comportamiento.
2. **Encapsulamiento:** Ocultamiento de estado mediante miembros privados con acceso controlado a través de métodos accesores (`getters` y `setters`) que aplican validaciones de invariantes de negocio.
3. **Herencia:** Extensión de `Persona` en `Dueno` y `Veterinario`; y de `Animal` en `Mascota`.
4. **Polimorfismo:** Implementación diferenciada de métodos abstractos como `calcularDosisMedicamento(concentracion)` según factores metabólicos de especie, y `clasificarRiesgoAnestesico()` según edad fisiológica y preexistencias.

---

## 2. Requisitos y Dependencias del Entorno

* **Node.js:** v18.x, v20.x, v22.x o superior (Probado en v24.21.0)
* **NPM:** v9.x, v10.x u 11.x
* **Angular CLI:** v18.x a v22.x (Probado en v22.2.1)
* **Framework CSS:** Bootstrap 5.3.3 y Bootstrap Icons 1.11.3
* **Motor de Pruebas:** Vitest / Angular Build Unit Testing

---

## 3. Guía de Instalación y Ejecución

### Clonación e Instalación de Dependencias

```bash
git clone <url-del-repositorio>
cd EVALUACION_PARCIAL_DESARROLLO_III
npm install
```

### Ejecución en Servidor de Desarrollo

```bash
npm start
```

La aplicación se servirá en el puerto local por defecto: `http://localhost:4200/`

### Compilación para Producción

```bash
npm run build
```

Los artefactos optimizados y empaquetados se generarán en el directorio `dist/clinica-veterinaria-frontend/`.

---

## 4. Ejecución de Pruebas Unitarias

Para ejecutar el banco de pruebas unitarias automatizadas:

```bash
npm test -- --watch=false
```

### Evidencia de Cobertura de Pruebas

* `src/app/models/oop.spec.ts`:
  * Validación de polimorfismo en cálculo metabólico de dosis entre caninos y felinos.
  * Clasificación algorítmica de riesgo anestésico y quirúrgico.
  * Encapsulamiento y validación de atributos en clases `Persona` y `Dueno`.
  * Transición determinista de estados y banderas de urgencia en la clase `Cita`.
* `src/app/shared/validators/clinica-validators.spec.ts`:
  * Validación de formato estricto de DNI (8 dígitos).
  * Validación de numeración móvil (9 dígitos iniciando en 9).
  * Control de positividad estricta en peso del paciente.
* `src/app/shared/pipes/estado-cita.pipe.spec.ts`:
  * Transformación funcional de estados a nomenclatura en español y clases visuales de Bootstrap.
* `src/app/app.spec.ts`:
  * Instanciación y compilación de componentes de nivel superior del sistema.

* `src/app/core/services/citas.service.spec.ts`:
  * Rechazo de citas en fechas pasadas y en domingo.
  * Un mismo veterinario no puede tener dos citas que se crucen; otro veterinario sí puede atender a esa hora.
  * Una cita larga (60 min) bloquea también el turno siguiente del médico.
  * La cita se guarda en el día exacto elegido (sin desfase por zona horaria).
* `src/app/core/services/auth.service.spec.ts`:
  * Asignación de rol según usuario y matriz de permisos por rol.
* `src/app/shared/validators/clinica-validators.spec.ts` (`fechaCitaValida`): fechas pasadas y domingos.

Resultado de la suite de pruebas: **23/23 pruebas superadas satisfactoriamente (100% de éxito).**

---

## 5. Roles y Permisos

Cada rol tiene una pantalla y acciones distintas. Los permisos se definen en un único lugar
(`PERMISOS_POR_ROL` en `models/auth.model.ts`) y se aplican con:

* **`PermisoGuard`**: bloquea rutas según `data.permiso`.
* **Directiva estructural `*appTienePermiso`**: muestra u oculta botones y enlaces del menú.
* **`@Input()` en componentes**: `TarjetaCitaComponent` y `TablaHistorialComponent` reciben qué acciones están habilitadas.

| Acción | Recepción | Veterinario | Administrador |
| :--- | :---: | :---: | :---: |
| Ver agenda | Todos los médicos | Solo la suya | Todos los médicos |
| Agendar / cancelar citas | ✔ | ✘ | ✔ |
| Iniciar / finalizar atención | ✘ | ✔ | ✘ |
| Registrar paciente | ✔ | ✘ | ✔ |
| Ver historial clínico | ✘ | ✔ | ✔ (solo lectura) |
| Registrar atención en historial | ✘ | ✔ | ✘ |
| Indicador de ingresos estimados | ✘ | ✘ | ✔ |

**Usuarios de demostración** (cualquier contraseña de 6+ caracteres):

| Correo | Rol |
| :--- | :--- |
| `recepcion@veterinaria.com` | Recepción |
| `amorales@veterinaria.com` | Veterinario (Dr. Alejandro Morales) |
| `mcastillo@veterinaria.com` | Veterinaria (Dra. Mariana Castillo) |
| `admin@veterinaria.com` | Administrador |

---

## 6. Reglas de Agendamiento de Citas

* No se permiten fechas u horas pasadas (el calendario del formulario bloquea días anteriores a hoy y el servicio vuelve a validarlo).
* La clínica no atiende domingos.
* Se elige el **médico veterinario**; el combo de horarios muestra solo los **turnos libres de ese médico** en esa fecha, considerando la duración de cada cita.
* Un médico no puede tener dos citas que se crucen, y una mascota tampoco. Si se intenta, el sistema muestra el motivo en el formulario.
* Las fechas se manejan en **hora local** (`shared/utils/fecha.utils.ts`) para que la cita se registre en el día exacto elegido.
* La interfaz usa el idioma **español (Perú)** (`LOCALE_ID = 'es-PE'`), por lo que el calendario muestra "noviembre 2026", "martes, 3 de noviembre de 2026", etc.

### Filtros de la agenda

Los filtros de **Estado**, **Prioridad** y **Médico**:

1. Actualizan el contador de citas de cada día del calendario semanal.
2. Filtran la lista de citas del día seleccionado.
3. Muestran el panel **"Resultados del filtro"** con todas las citas que cumplen el criterio (de cualquier fecha) y un botón para ir a ese día en el calendario.

Las tarjetas de indicadores (Urgencias pendientes, En atención, Programadas) funcionan como accesos directos a esos filtros.

---

## 7. Matriz de Componentes Smart / Dumb

| Tipo de Componente | Nombre del Componente | Responsabilidad Principal |
| :--- | :--- | :--- |
| **Smart (Container)** | `AgendaCitasComponent` | Orquesta servicios, administra filtros de prioridad y estado, y maneja modales de agendamiento. |
| **Dumb (Presentacional)** | `CalendarioCitasComponent` | Renderiza la cuadrícula de días, calcula indicadores por fecha y emite eventos de selección. |
| **Dumb (Presentacional)** | `TarjetaCitaComponent` | Presenta la cita individual decorada con la directiva `appUrgenciaCita` y emite cambios de estado. |
| **Dumb (Presentacional)** | `FormularioCitaComponent` | `ReactiveForm` desacoplado: recibe los turnos libres por `@Input()` y emite `consultarDisponibilidad` por `@Output()` al cambiar médico, fecha u hora. |
| **Smart (Container)** | `RegistroMascotaComponent` | Gestiona el alta conjunta de paciente y propietario a través de `MascotasService`. |
| **Dumb (Presentacional)** | `FormularioMascotaComponent` | Formulario reactivo anidado (`dueno` + `mascota`) con validaciones personalizadas. |
| **Smart (Container)** | `HistorialMascotasComponent` | Administra la consulta de expedientes, ejecuta métodos polimórficos de POO y apertura notas clínicas. |
| **Dumb (Presentacional)** | `TablaHistorialComponent` | Presentación tabular responsive con constantes vitales, prescripciones y visualizador modal. Contiene el único botón "Registrar Nueva Atención", visible solo para el rol Veterinario (`@Input() permitirRegistro`). |
| **Dumb (Presentacional)** | `NavbarComponent` | Navegación reactiva con sesión de usuario y alertas flotantes integradas. |
