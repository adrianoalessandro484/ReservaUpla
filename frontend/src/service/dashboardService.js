import apiClient from './apiClient';

export const dashboardService = {
  // RF-08: Obtener indicadores institucionales y métricas del dashboard
  getIndicators: () =>
    apiClient.get('/dashboard/indicadores').then((res) => res.data),
  obtenerIndicadores: () =>
    apiClient.get('/dashboard/indicadores').then((res) => res.data)
};

export default dashboardService;
