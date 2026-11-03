import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejo amigable de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMsg = 'Ocurrió un error inesperado al comunicarse con el servidor.';
    if (error.response?.data?.mensaje) {
      errorMsg = error.response.data.mensaje;
    } else if (error.response?.data?.title) {
      errorMsg = error.response.data.title;
    } else if (typeof error.response?.data === 'string') {
      errorMsg = error.response.data;
    } else if (error.message) {
      errorMsg = error.message;
    }
    return Promise.reject(new Error(errorMsg));
  }
);

export const usuarioApi = {
  obtenerTodos: () => api.get('/usuarios').then(r => r.data),
  obtenerPorId: (id) => api.get(`/usuarios/${id}`).then(r => r.data),
  obtenerPorRol: (rol) => api.get(`/usuarios/rol/${encodeURIComponent(rol)}`).then(r => r.data),
  registrar: (data) => api.post('/usuarios', data).then(r => r.data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data).then(r => r.data),
  toggleActivo: (id) => api.patch(`/usuarios/${id}/toggle-activo`).then(r => r.data)
};

export const ambienteApi = {
  obtenerTodos: (params) => api.get('/ambientes', { params }).then(r => r.data),
  obtenerPorId: (id) => api.get(`/ambientes/${id}`).then(r => r.data),
  obtenerTipos: () => api.get('/ambientes/tipos').then(r => r.data),
  obtenerEstados: () => api.get('/ambientes/estados').then(r => r.data),
  registrar: (data) => api.post('/ambientes', data).then(r => r.data),
  actualizar: (id, data) => api.put(`/ambientes/${id}`, data).then(r => r.data),
  cambiarEstado: (id, nuevoEstado) => api.patch(`/ambientes/${id}/estado`, { nuevoEstado }).then(r => r.data)
};

export const reservaApi = {
  obtenerTodas: (params) => api.get('/reservas', { params }).then(r => r.data),
  obtenerPorId: (id) => api.get(`/reservas/${id}`).then(r => r.data),
  verificarDisponibilidad: (data) => api.post('/reservas/disponibilidad', data).then(r => r.data),
  crear: (data) => api.post('/reservas', data).then(r => r.data),
  cambiarEstado: (id, data) => api.patch(`/reservas/${id}/estado`, data).then(r => r.data),
  cancelar: (id) => api.delete(`/reservas/${id}`).then(r => r.data)
};

export const dashboardApi = {
  obtenerIndicadores: () => api.get('/dashboard/indicadores').then(r => r.data)
};

export default api;
