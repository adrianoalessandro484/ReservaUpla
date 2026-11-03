import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Building2,
  Users,
  Shield,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import DashboardView from './components/views/DashboardView';
import ReservasView from './components/views/ReservasView';
import NuevaReservaView from './components/views/NuevaReservaView';
import AmbientesView from './components/views/AmbientesView';
import UsuariosView from './components/views/UsuariosView';
import { usuarioApi } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tabParams, setTabParams] = useState({});

  // Simulación de roles para la rúbrica (Solicitante, Administrador, Responsable de ambiente)
  const [currentActor, setCurrentActor] = useState('Administrador');
  const [usuarios, setUsuarios] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const uList = await usuarioApi.obtenerTodos();
        setUsuarios(uList);
        // Seleccionar usuario por defecto según el rol activo
        const defaultUser = uList.find(u => u.rol === currentActor) || uList[0];
        setCurrentUser(defaultUser);
      } catch (err) {
        console.warn('Backend aún no disponible o sin conexión:', err);
      }
    };
    cargarUsuarios();
  }, []);

  const handleActorChange = (nuevoRol) => {
    setCurrentActor(nuevoRol);
    const match = usuarios.find(u => u.rol === nuevoRol);
    if (match) setCurrentUser(match);
  };

  const handleNavigate = (tab, params = {}) => {
    setActiveTab(tab);
    setTabParams(params);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservas', label: 'Reservas', icon: CalendarDays },
    { id: 'nueva-reserva', label: 'Nueva Reserva', icon: PlusCircle },
    { id: 'ambientes', label: 'Ambientes', icon: Building2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo y Título Institucional */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-sm font-black text-lg">
                UPLA
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-slate-900 m-0">
                    ReservaUPLA
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block m-0">
                  Sistema de Gestión de Reservas de Ambientes Universitarios
                </p>
              </div>
            </div>

            {/* Selector de Actor / Rol (Para evaluar y testear flujos según rúbrica) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <Shield className="h-4 w-4 text-slate-500" />
                <span className="text-slate-500 hidden md:inline font-medium">Actor Activo:</span>
                <select
                  value={currentActor}
                  onChange={(e) => handleActorChange(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Administrador">Administrador (Aprueba/Rechaza)</option>
                  <option value="Solicitante">Solicitante (Registra reservas)</option>
                  <option value="Responsable de ambiente">Responsable de ambiente</option>
                </select>
              </div>

              {currentUser && (
                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 pl-2 border-l border-slate-200">
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.nombreCompleto?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium truncate max-w-[140px]">
                    {currentUser.nombreCompleto}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Menú de Pestañas */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 border-t border-slate-100 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Contenido Principal de las Vistas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} currentActor={currentActor} />
        )}

        {activeTab === 'reservas' && (
          <ReservasView
            onNavigate={handleNavigate}
            currentActor={currentActor}
            currentUser={currentUser}
            initialEstado={tabParams.estado || ''}
          />
        )}

        {activeTab === 'nueva-reserva' && (
          <NuevaReservaView
            onNavigate={handleNavigate}
            currentActor={currentActor}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'ambientes' && (
          <AmbientesView onNavigate={handleNavigate} currentActor={currentActor} />
        )}

        {activeTab === 'usuarios' && (
          <UsuariosView onNavigate={handleNavigate} currentActor={currentActor} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            <span>Universidad Peruana Los Andes — Asignatura Construcción de Software (Semanas 01 - 09)</span>
          </div>
          <div>
            <span>Backend: C# Clean Architecture (.NET 10) • Frontend: React + Tailwind v4 + Axios</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
