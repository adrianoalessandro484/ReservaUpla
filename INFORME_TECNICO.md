# Informe Técnico del Proyecto ReservaUPLA
**Sistema de Gestión de Reservas de Ambientes Universitarios**  
**Universidad Peruana Los Andes — Construcción de Software (Semanas 01 a 09)**

---

## 1. Análisis del Problema, Actores y Alcance (Semana 01)
- **Problemática**: La Universidad Peruana Los Andes (UPLA) gestionaba reservas de laboratorios, auditorios y salas mediante llamadas, mensajes o documentos físicos, provocando duplicidad de reservas, pérdida de solicitudes y falta de trazabilidad.
- **Actores y Responsabilidades**:
  - **Solicitante**: Docentes, estudiantes y personal que registran solicitudes de reserva para fines académicos/institucionales.
  - **Administrador**: Aprueba o rechaza solicitudes de reserva, gestiona ambientes y supervisa métricas globales.
  - **Responsable de ambiente**: Supervisa el uso asignado y disponibilidad de laboratorios y salas específicas.
- **Alcance**: Solución web integral con backend en .NET (C#) bajo Arquitectura Limpia (Clean Architecture), frontend reactivo en React + Vite + Tailwind CSS v4, y base de datos relacional PostgreSQL.

---

## 2. Justificación Técnica del Ciclo de Vida del Software (Semana 02)
Se seleccionó un modelo **Iterativo e Incremental** complementado con prácticas ágiles (Scrum/Kanban):
- **Justificación**: Permite descomponer el sistema en módulos funcionales independientes y verificables (Usuarios, Ambientes, Reservas, Dashboard). Cada incremento entrega valor inmediato con sus respectivas pruebas de validación y control de versiones local.
- **Ventajas**: Mitiga riesgos en la lógica de negocio (reglas de no solapamiento y validación horaria), facilita refactorizaciones sin romper contratos de API y asegura alineación continua con la rúbrica de evaluación.

---

## 3. Estándares de Construcción de Software (Semana 03)
- **Nomenclatura y Código**:
  - Backend: PascalCase para clases, interfaces (`IUsuarioService`), métodos y propiedades de C#; camelCase para parámetros y variables locales.
  - Frontend: PascalCase para componentes React (`TextInput.jsx`, `ModalConfirmacion.jsx`); camelCase para hooks, funciones y variables en JavaScript.
- **Control de Versiones (Commits Semánticos)**:
  - Estilo Conventional Commits: `feat(database)`, `feat(usuarios)`, `feat(ambientes)`, `feat(reservas)`, `feat(dashboard)`, `feat(frontend)`.
- **Estructura de Carpetas**:
  - `backend/`: Separado en capas `API`, `Application`, `Domain`, `Infrastructure`.
  - `frontend/`: Estructurado en `src/api`, `src/components/ui` (reutilizables) y `src/components/views`.

---

## 4. Arquitectura de Software y Base de Datos (Semana 04)
### Backend (Clean Architecture):
- **ReservaUPLA.Domain**: Entidades de negocio (`Usuario`, `Ambiente`, `Reserva`) y constantes institucionales sin dependencias externas.
- **ReservaUPLA.Application**: Contratos de servicios (`IReservaService`, `IAmbienteService`, `IUsuarioService`), DTOs con Data Annotations y excepciones de dominio.
- **ReservaUPLA.Infrastructure**: Implementación con Entity Framework Core, configuración Fluent API para PostgreSQL (`ReservaDbContext`), inicializador con datos semilla (`DbInitializer`).
- **ReservaUPLA.API**: Controladores RESTful (`ReservasController`, `AmbientesController`, `UsuariosController`, `DashboardController`), CORS, documentación OpenAPI / Scalar / Swagger.

### Base de Datos PostgreSQL:
- Tablas: `usuarios`, `ambientes`, `reservas`.
- Claves primarias UUID (`Guid`), relaciones con integridad referencial (`OnDelete: Restrict`) e índices compuestos `(AmbienteId, Fecha, Estado)`.

---

## 5. Módulos de Entrada y Validación de Datos (Semanas 05 y 06)
### Implementación de Requerimientos Funcionales:
- **RF-01**: Registro y listado de usuarios solicitantes y administradores con validación de correo y rol.
- **RF-02**: Registro de ambientes con capacidad $> 0$, tipo institucional y ubicación.
- **RF-03**: Registro de solicitudes de reserva.
- **RF-04**: Validación interactiva de disponibilidad previa al guardado.
- **RF-05 & RF-06**: Listado con filtros dinámicos (estado, ambiente, fecha) y modal de consulta detallada.
- **RF-07**: Cambio controlado de estados (Pendiente, Aprobada, Rechazada, Cancelada).
- **RF-08**: Dashboard con métricas e indicadores en tiempo real.

### Reglas de Negocio Implementadas (Frontend y Backend):
- **RN-01**: No se permite más de una reserva aprobada para el mismo ambiente, fecha y rango de horas $(Inicio_1 < Fin_2 \land Fin_1 > Inicio_2)$.
- **RN-02**: Toda reserva registra fecha, hora de inicio, hora de fin, ambiente, solicitante y motivo.
- **RN-03**: La hora de fin debe ser estrictamente mayor que la de inicio ($HoraFin > HoraInicio$).
- **RN-04**: Las reservas solo pueden realizarse en horario universitario: **07:00 a 22:00 horas**.
- **RN-05**: Solo usuarios con rol Administrador pueden aprobar o rechazar reservas.
- **RN-06**: Una reserva en estado **Rechazada** queda bloqueada y no puede ser modificada ni cancelada.

---

## 6. Componentes Reutilizables Implementados (Semana 07, Sección 9)
Se construyeron e integraron los 9 componentes mínimos exigidos:
1. `TextInput`: Input controlado con soporte de iconos, labels, errores y accesibilidad.
2. `SelectInput`: Selector parametrizado para tipos, estados y relaciones.
3. `DateInput`: Selector de fecha con límite inferior en la fecha actual.
4. `TimeInput`: Selector de hora con límites institucionales (07:00 a 22:00).
5. `Button`: Botón modular con variantes (`primary`, `secondary`, `success`, `danger`, `outline`, `ghost`) y estados de carga (`loading`).
6. `AlertMessage`: Notificaciones contextuales para validaciones (`success`, `error`, `warning`, `info`).
7. `ModalConfirmacion`: Cuadro de diálogo modal accesible para aprobación, rechazo y cancelación.
8. `TableList`: Tabla reutilizable con renderizadores personalizados, cabeceras y estado vacío.
9. `CardIndicador`: Tarjetas estadísticas con iconos, paletas semánticas y etiquetas de resumen.

---

## 7. Módulo de Salida y Dashboard de Indicadores (Semanas 08 y 09, Sección 10)
El Dashboard despliega en tiempo real:
- **Total de reservas**: Cantidad acumulada de solicitudes.
- **Reservas pendientes**: Solicitudes esperando evaluación administrativa.
- **Reservas aprobadas**: Ambientes confirmados.
- **Reservas rechazadas**: Solicitudes denegadas bajo regla RN-06.
- **Ambiente más utilizado**: Ambiente con mayor número de reservas institucionales recibidas.
- **Gráfica de Demanda por Ambiente**: Barras porcentuales de utilización por cada ambiente registrado.

---

## 8. Pregunta de Reflexión Final (Sección 13)
> **Pregunta**: *Explique cómo la aplicación de estándares, validación de datos, reutilización de componentes y refinamiento de código contribuye a mejorar la calidad, mantenibilidad y evolución del sistema ReservaUPLA.*

### Respuesta:
1. **Aplicación de Estándares (Clean Architecture y Commits Semánticos)**: Desacopla la lógica del negocio de la infraestructura tecnológica. Si la universidad decide migrar de PostgreSQL a SQL Server o cambiar la interfaz de usuario, las entidades de dominio y las reglas de negocio permanecen inalteradas, reduciendo el costo de mantenimiento y el riesgo de regresiones.
2. **Validación de Datos en Dos Capas (Frontend y Backend)**: La validación temprana en el cliente (UI) proporciona retroalimentación instantánea al usuario (mejor experiencia UX), mientras que la validación defensiva en el backend y base de datos garantiza la consistencia e integridad de los datos, previniendo solapamientos de aulas (RN-01), horarios fuera del rango institucional (RN-04) o violaciones de seguridad en roles (RN-05).
3. **Reutilización de Componentes**: Minimiza la duplicidad de código fuente (principio DRY). Un ajuste de diseño o accesibilidad en `TextInput` o `ModalConfirmacion` se propaga inmediatamente a todos los formularios del sistema, garantizando uniformidad visual y reduciendo los tiempos de desarrollo para futuros módulos.
4. **Refinamiento de Código**: La estructuración en DTOs, servicios especializados y manejo uniforme de excepciones (`AppException`) optimiza el rendimiento y simplifica la incorporación de nuevos requerimientos, como notificaciones por correo o integración con calendarios institucionales.
