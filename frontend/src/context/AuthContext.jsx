import { createContext, useContext, useState, useEffect } from 'react';
import { usuarioService } from '../service/userService';

const AuthContext = createContext(null);

// Usuarios de demostración alineados a la base de datos de ReservaUPLA y formato institucional (7 caracteres: Letra + 5 números + Letra)
export const DEMO_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    codigo: 'ADM0001',
    aliases: ['a01001m', 'adm001', 'admin', 'carlos.mendoza'],
    nombreCompleto: 'Carlos Mendoza (Administrador)',
    correo: 'admin.reservas@upla.edu.pe',
    rol: 'Administrador',
    departamento: 'Oficina de Informática y Sistemas',
    activo: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    codigo: 'DOC2024',
    aliases: ['d02024r', 'doc-2024', 'aramos'],
    nombreCompleto: 'Dra. Ana Ramos Flores',
    correo: 'aramos@upla.edu.pe',
    rol: 'Solicitante',
    departamento: 'Facultad de Ingeniería - Escuela de Sistemas',
    activo: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    codigo: 'DOC2025',
    aliases: ['d02025q', 'doc-2025', 'mquispe'],
    nombreCompleto: 'Ing. Marcos Quispe',
    correo: 'mquispe@upla.edu.pe',
    rol: 'Solicitante',
    departamento: 'Facultad de Ciencias de la Salud',
    activo: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    codigo: 'Q01171J',
    aliases: ['r03001g', 'res-001', 'egutierrez'],
    nombreCompleto: 'Lic. Elena Gutierrez (Responsable Cómputo)',
    correo: 'egutierrez@upla.edu.pe',
    rol: 'Responsable de ambiente',
    departamento: 'Jefatura de Laboratorios de Cómputo',
    activo: true
  },
  {
    id: '6ba5bd1c-3933-4866-9baf-c8cb1d7db0f6',
    codigo: 'Q02941K',
    aliases: ['wcardenas', 'doc-wilder'],
    nombreCompleto: 'Prof. Wilder Cardenas',
    correo: 'q02941k@upla.edu.pe',
    rol: 'Solicitante',
    departamento: 'Facultad de Educación',
    activo: true
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('reserva_upla_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [usuariosDisponibles, setUsuariosDisponibles] = useState(DEMO_USERS);
  const [rememberedCode, setRememberedCode] = useState(() => {
    return localStorage.getItem('reserva_upla_remembered_code') || '';
  });

  // Sincronizar usuarios reales desde la API si está disponible
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const remoteUsers = await usuarioService.getAll();
        if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
          const merged = remoteUsers.map((u) => {
            const demo = DEMO_USERS.find(d => d.id === u.id || (u.codigo && d.codigo === u.codigo));
            return {
              ...u,
              codigo: u.codigo || demo?.codigo,
              aliases: demo?.aliases || [],
              departamento: demo?.departamento || 'Comunidad Universitaria UPLA'
            };
          });
          setUsuariosDisponibles(merged);
        }
      } catch (error) {
        console.warn('Usando catálogo institucional local para contingencia:', error.message);
      }
    };
    fetchUsuarios();
  }, []);

  const login = async (codigoInput, contrasena, rememberMe = false) => {
    const cleanCodigo = (codigoInput || '').trim().toUpperCase();
    const cleanClave = (contrasena || '').trim();

    if (!cleanCodigo) {
      throw new Error('Por favor ingresa tu código institucional.');
    }
    if (!cleanClave) {
      throw new Error('Por favor ingresa tu contraseña institucional.');
    }

    try {
      // 1. Validar contra el endpoint oficial del backend
      const user = await usuarioService.login(cleanCodigo, cleanClave);
      setCurrentUser(user);
      localStorage.setItem('reserva_upla_session', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('reserva_upla_remembered_code', user.codigo || cleanCodigo);
        setRememberedCode(user.codigo || cleanCodigo);
      } else {
        localStorage.removeItem('reserva_upla_remembered_code');
        setRememberedCode('');
      }

      return user;
    } catch (apiError) {
      // Si el backend arrojó un error de validación específico (400, 401, 403, 404)
      const errorMsg =
        apiError.response?.data?.message ||
        apiError.response?.data?.title ||
        apiError.message;

      if (
        errorMsg &&
        (errorMsg.includes('Contraseña') ||
          errorMsg.includes('deshabilitado') ||
          errorMsg.includes('No existe') ||
          errorMsg.includes('obligatorio'))
      ) {
        throw new Error(errorMsg);
      }

      // Si no hubo conexión directa con backend, validar con clave oficial Upla2026*
      if (cleanClave !== 'Upla2026*') {
        throw new Error('Contraseña incorrecta. Verifique sus credenciales institucionales (clave oficial: Upla2026*).');
      }

      const matchedUser = usuariosDisponibles.find(u => {
        const matchesCodigo = u.codigo && u.codigo.toUpperCase() === cleanCodigo;
        const matchesAlias = u.aliases && u.aliases.some(a => a.toUpperCase() === cleanCodigo);
        return matchesCodigo || matchesAlias;
      });

      if (!matchedUser) {
        throw new Error(`Código institucional "${cleanCodigo}" no encontrado en el sistema.`);
      }

      if (matchedUser.activo === false) {
        throw new Error('El acceso institucional para este usuario está deshabilitado.');
      }

      setCurrentUser(matchedUser);
      localStorage.setItem('reserva_upla_session', JSON.stringify(matchedUser));

      if (rememberMe) {
        localStorage.setItem('reserva_upla_remembered_code', matchedUser.codigo || cleanCodigo);
        setRememberedCode(matchedUser.codigo || cleanCodigo);
      } else {
        localStorage.removeItem('reserva_upla_remembered_code');
        setRememberedCode('');
      }

      return matchedUser;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('reserva_upla_session');
  };

  const switchRole = (nuevoRol) => {
    // Buscar un usuario con ese rol
    const targetUser = usuariosDisponibles.find(u => u.rol === nuevoRol);
    if (targetUser) {
      setCurrentUser(targetUser);
      localStorage.setItem('reserva_upla_session', JSON.stringify(targetUser));
    }
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    currentActor: currentUser?.rol || 'Solicitante',
    usuariosDisponibles,
    rememberedCode,
    login,
    logout,
    switchRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}