import { Menu, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Tooltip from '../ui/Tooltip';

export default function Navbar({
  onToggleSidebar,
  currentActor,
  currentUser,
  onLogout
}) {
  const location = useLocation();

  // Mapeo dinámico de rutas institucionales para el Breadcrumb (DCU / Heurística 1)
  const getBreadcrumbTitle = (pathname) => {
    switch (pathname) {
      case '/':
      case '/inicio':
      case '/dashboard':
        return currentActor === 'Administrador'
          ? 'Dashboard General'
          : currentActor === 'Responsable de ambiente'
          ? 'Agenda de Ocupación'
          : 'Agenda y Solicitud';
      case '/agenda':
      case '/disponibilidad':
        return currentActor === 'Responsable de ambiente'
          ? 'Agenda de Ocupación de Ambientes'
          : 'Agenda y Solicitud de Reserva';
      case '/reservas':
      case '/reservations':
        return currentActor === 'Administrador'
          ? 'Gestión y Aprobación de Reservas'
          : currentActor === 'Responsable de ambiente'
          ? 'Historial de Uso de Ambientes'
          : 'Mis Reservas';
      case '/mis-reservas':
        return 'Mis Reservas Solicitadas';
      case '/reportes':
      case '/reports':
        return 'Informe de Ocupación y Reservas';
      case '/nueva-reserva':
      case '/create-reservation':
        return 'Registrar Nueva Solicitud';
      case '/ambientes':
      case '/rooms':
        return currentActor === 'Responsable de ambiente'
          ? 'Ambientes Asignados y Estado'
          : 'Catálogo de Ambientes Universitarios';
      case '/usuarios':
      case '/users':
        return 'Gestión de Solicitantes y Usuarios';
      default:
        return 'Módulo Institucional';
    }
  };

  const currentSection = getBreadcrumbTitle(location.pathname);
  const displayRole = currentActor === 'Solicitante' ? 'Docente' : currentActor;

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shadow-xs">
      
      {/* LADO IZQUIERDO: Botón Menú Móvil + Breadcrumb Dinámico iniciando en el Rol Institucional */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Abrir menú lateral de navegación" side="bottom">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-700 hover:text-slate-900 p-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Abrir menú lateral"
          >
            <Menu className="h-6 w-6 stroke-[2.2]" />
          </button>
        </Tooltip>

        {/* Breadcrumb Institucional: Rol al inicio según instrucción del usuario */}
        <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-1.5 font-black text-blue-900 bg-blue-50/90 border border-blue-200/90 px-3 py-1 rounded-xl text-xs sm:text-sm shadow-2xs">
            <Shield className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="uppercase tracking-wide">{displayRole}</span>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />

          <span className="font-extrabold text-slate-800 truncate py-1 px-2.5 bg-slate-100 rounded-xl text-xs sm:text-sm border border-slate-200/80">
            {currentSection}
          </span>
        </nav>
      </div>

      {/* LADO DERECHO: Perfil del Usuario + Botón Cerrar Sesión (Un solo lugar centralizado) */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* DATOS DEL USUARIO (Únicamente nombre y código institucional) */}
        {currentUser && (
          <div className="flex items-center gap-3 pl-2 sm:pl-3">
            <Tooltip content={`Sesión activa: ${currentUser.nombreCompleto} (${currentUser.codigo || 'DOC-UPLA'})`} side="bottom">
              <div
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-blue-500/20 shrink-0 cursor-default"
              >
                {currentUser.nombreCompleto?.charAt(0) || 'U'}
              </div>
            </Tooltip>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-extrabold text-slate-900 truncate max-w-[180px] leading-tight">
                {currentUser.nombreCompleto}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-600 mt-0.5">
                {currentUser.codigo || 'DOC-UPLA'}
              </span>
            </div>
          </div>
        )}

        {/* BOTÓN CERRAR SESIÓN (Accesible, visible y ergonómico) */}
        <Tooltip content="Cerrar sesión de la Intranet Institucional" side="bottom">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200/90 shadow-2xs transition-all duration-150 cursor-pointer min-h-[42px]"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4 stroke-[2.4]" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
