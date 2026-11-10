import apiClient from './apiClient';

export const userService = {
  // RF-01: Listar todos los usuarios institucionales
  getAll: () =>
    apiClient.get('/usuarios').then((res) => res.data),
  obtenerTodos: () =>
    apiClient.get('/usuarios').then((res) => res.data),

  // Consultar usuario por ID
  getById: (id) =>
    apiClient.get(`/usuarios/${id}`).then((res) => res.data),
  obtenerPorId: (id) =>
    apiClient.get(`/usuarios/${id}`).then((res) => res.data),

  // Filtrar usuarios por rol (Solicitante, Administrador, ResponsableAmbiente)
  getByRole: (rol) =>
    apiClient.get(`/usuarios/rol/${encodeURIComponent(rol)}`).then((res) => res.data),
  obtenerPorRol: (rol) =>
    apiClient.get(`/usuarios/rol/${encodeURIComponent(rol)}`).then((res) => res.data),

  // RF-01: Registrar un nuevo usuario
  create: (data) =>
    apiClient.post('/usuarios', data).then((res) => res.data),
  registrar: (data) =>
    apiClient.post('/usuarios', data).then((res) => res.data),

  // Actualizar datos del usuario
  update: (id, data) =>
    apiClient.put(`/usuarios/${id}`, data).then((res) => res.data),
  actualizar: (id, data) =>
    apiClient.put(`/usuarios/${id}`, data).then((res) => res.data),

  // Alternar estado activo / inactivo
  toggleActive: (id) =>
    apiClient.patch(`/usuarios/${id}/toggle-activo`).then((res) => res.data),
  toggleActivo: (id) =>
    apiClient.patch(`/usuarios/${id}/toggle-activo`).then((res) => res.data),

  // Iniciar sesión institucional con Código y Contraseña
  login: (codigo, contrasena) =>
    apiClient.post('/usuarios/login', { codigo, contrasena }).then((res) => res.data),
  iniciarSesion: (codigo, contrasena) =>
    apiClient.post('/usuarios/login', { codigo, contrasena }).then((res) => res.data)
};

export const usuarioService = userService;
export default userService;
