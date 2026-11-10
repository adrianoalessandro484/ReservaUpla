import apiClient from './apiClient';

export const roomService = {
  // RF-02: Listar todos los ambientes universitarios (filtros opcionales: tipo, estado)
  getAll: (params = {}) =>
    apiClient.get('/ambientes', { params }).then((res) => res.data),
  obtenerTodos: (params = {}) =>
    apiClient.get('/ambientes', { params }).then((res) => res.data),

  // Consultar ambiente institucional por UUID
  getById: (id) =>
    apiClient.get(`/ambientes/${id}`).then((res) => res.data),
  obtenerPorId: (id) =>
    apiClient.get(`/ambientes/${id}`).then((res) => res.data),

  // Obtener catálogo institucional de tipos (LaboratorioComputo, Auditorio, etc.)
  getTypes: () =>
    apiClient.get('/ambientes/tipos').then((res) => res.data),
  obtenerTipos: () =>
    apiClient.get('/ambientes/tipos').then((res) => res.data),

  // Obtener estados de ambientes (Disponible, Mantenimiento, Inactivo)
  getStatuses: () =>
    apiClient.get('/ambientes/estados').then((res) => res.data),
  obtenerEstados: () =>
    apiClient.get('/ambientes/estados').then((res) => res.data),

  // RF-02: Registrar un nuevo ambiente universitario
  create: (data) =>
    apiClient.post('/ambientes', data).then((res) => res.data),
  registrar: (data) =>
    apiClient.post('/ambientes', data).then((res) => res.data),

  // Actualizar datos de un ambiente
  update: (id, data) =>
    apiClient.put(`/ambientes/${id}`, data).then((res) => res.data),
  actualizar: (id, data) =>
    apiClient.put(`/ambientes/${id}`, data).then((res) => res.data),

  // Cambiar estado operativo del ambiente
  changeStatus: (id, nuevoEstado) =>
    apiClient.patch(`/ambientes/${id}/estado`, { nuevoEstado }).then((res) => res.data),
  cambiarEstado: (id, nuevoEstado) =>
    apiClient.patch(`/ambientes/${id}/estado`, { nuevoEstado }).then((res) => res.data)
};

export const ambienteService = roomService;
export default roomService;
