import apiClient from './apiClient';

export const reservationService = {
  // RF-05: Listar reservas registradas (filtros: estado, ambienteId, usuarioId, fecha)
  getAll: (params = {}) =>
    apiClient.get('/reservas', { params }).then((res) => res.data),
  obtenerTodas: (params = {}) =>
    apiClient.get('/reservas', { params }).then((res) => res.data),

  // RF-06: Consultar detalle completo de una reserva por su ID
  getById: (id) =>
    apiClient.get(`/reservas/${id}`).then((res) => res.data),
  obtenerPorId: (id) =>
    apiClient.get(`/reservas/${id}`).then((res) => res.data),

  // RF-04 y RN-01: Validar disponibilidad de ambiente en fecha y horario determinado
  checkAvailability: (data) =>
    apiClient.post('/reservas/disponibilidad', data).then((res) => res.data),
  verificarDisponibilidad: (data) =>
    apiClient.post('/reservas/disponibilidad', data).then((res) => res.data),

  // RF-03: Registrar solicitud de reserva (aplica RN-01 a RN-04)
  create: (data) =>
    apiClient.post('/reservas', data).then((res) => res.data),
  crear: (data) =>
    apiClient.post('/reservas', data).then((res) => res.data),

  // RF-07: Cambiar estado (Pendiente, Aprobada, Rechazada, Cancelada) - RN-05 y RN-06
  changeStatus: (id, data) =>
    apiClient.patch(`/reservas/${id}/estado`, data).then((res) => res.data),
  cambiarEstado: (id, data) =>
    apiClient.patch(`/reservas/${id}/estado`, data).then((res) => res.data),

  // Cancelar reserva
  cancel: (id) =>
    apiClient.delete(`/reservas/${id}`).then((res) => res.data),
  cancelar: (id) =>
    apiClient.delete(`/reservas/${id}`).then((res) => res.data)
};

export const reservaService = reservationService;
export default reservationService;
