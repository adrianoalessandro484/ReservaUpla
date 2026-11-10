import apiClient from '../service/apiClient';
import { usuarioService } from '../service/userService';
import { ambienteService } from '../service/roomService';
import { reservaService } from '../service/reservationService';
import { dashboardService } from '../service/dashboardService';

export const usuarioApi = {
  obtenerTodos: usuarioService.getAll,
  obtenerPorId: usuarioService.getById,
  obtenerPorRol: usuarioService.getByRole,
  registrar: usuarioService.create,
  actualizar: usuarioService.update,
  toggleActivo: usuarioService.toggleActive
};

export const ambienteApi = {
  obtenerTodos: ambienteService.getAll,
  obtenerPorId: ambienteService.getById,
  obtenerTipos: ambienteService.getTypes,
  obtenerEstados: ambienteService.getStatuses,
  registrar: ambienteService.create,
  actualizar: ambienteService.update,
  cambiarEstado: ambienteService.changeStatus
};

export const reservaApi = {
  obtenerTodas: reservaService.getAll,
  obtenerPorId: reservaService.getById,
  verificarDisponibilidad: reservaService.checkAvailability,
  crear: reservaService.create,
  cambiarEstado: reservaService.changeStatus,
  cancelar: reservaService.cancel
};

export const dashboardApi = {
  obtenerIndicadores: dashboardService.getIndicators
};

export default apiClient;
