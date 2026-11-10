import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Interceptor global para unificar y enriquecer los mensajes de error del backend C#
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Ocurrió un error inesperado al comunicarse con el servidor institucional.';

    if (error.response?.data?.mensaje) {
      errorMessage = error.response.data.mensaje;
    } else if (error.response?.data?.title) {
      errorMessage = error.response.data.title;
    } else if (typeof error.response?.data === 'string' && error.response.data.trim()) {
      errorMessage = error.response.data;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
