import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Users,
  X,
  PhoneCall,
  GraduationCap,
  ShieldCheck,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';
import logoUpla from '../../assets/logo-upla-blanco.png';

export default function Sidebar({ isOpen, onClose, currentActor }) {
  // Navegación adaptativa según el Rol del usuario (Heurística 7: Flexibilidad y Roles DCU)
  const getNavItemsByRole = (rol) => {
    switch (rol) {
      case 'Administrador':
        return [
          { to: '/dashboard', label: 'Dashboard General', icon: LayoutDashboard },
          { to: '/reservas', label: 'Gestión de Reservas', icon: ShieldCheck },
          { to: '/ambientes', label: 'Ambientes Universitarios', icon: Building2 },
          { to: '/usuarios', label: 'Gestión de Usuarios', icon: Users },
          { to: '/reportes', label: 'Informe de Reservas', icon: FileSpreadsheet, isHighlight: true }
        ];

      case 'Solicitante':
        return [
          { to: '/agenda', label: 'Agenda y Solicitud', icon: CalendarDays, isHighlight: true },
          { to: '/mis-reservas', label: 'Mis Reservas', icon: ClipboardList }
        ];

      case 'Responsable de ambiente':
        return [
          { to: '/agenda', label: 'Agenda de Ocupación', icon: CalendarDays, isHighlight: true },
          { to: '/ambientes', label: 'Ambientes Asignados', icon: Building2 }
        ];

      default:
        return [
          { to: '/agenda', label: 'Agenda', icon: CalendarDays },
          { to: '/reservas', label: 'Reservas', icon: ShieldCheck }
        ];
    }
  };

  const navItems = getNavItemsByRole(currentActor);
  const displayRole = currentActor === 'Solicitante' ? 'Docente' : currentActor;

  return (
    <>
      {/* Backdrop para dispositivos móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar con Logo UPLA y Nombre del Sistema */}
        <div className="h-18 px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 p-1.5 flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <img src={logoUpla} alt="Logo UPLA" className="h-full w-auto object-contain" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight">
                  ReservaUPLA
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-blue-500/20 text-sky-300 rounded border border-blue-400/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate m-0">
                Oficina de Informática y Sistemas
              </p>
            </div>
          </div>

          {/* Botón Cerrar en móvil */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Cerrar menú lateral"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación Principal por Rol (Con botones confortables y grandes) */}
        <div className="flex-1 px-3 py-6 overflow-y-auto space-y-6">
          <div>
            <div className="px-3 mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Módulos del {displayRole}
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.to} content={`Ir a ${item.label}`} side="right" className="z-50">
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold min-h-[46px] transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                            : item.isHighlight
                            ? 'text-sky-300 hover:bg-slate-800 hover:text-white bg-blue-950/40 border border-blue-500/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0 stroke-[2.2]" />
                        <span>{item.label}</span>
                      </div>

                      {item.isHighlight && (
                        <span className="text-[10px] font-black uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md border border-sky-400/20">
                          Nuevo
                        </span>
                      )}
                    </NavLink>
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          {/* Tarjeta de Mesa de Ayuda Institucional */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-extrabold uppercase text-[10px] tracking-wider">
              <GraduationCap className="h-4 w-4" />
              <span>Soporte Técnico</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-400 m-0">
              Oficina de Informática y Sistemas UPLA.
            </p>
            <a
              href="https://wa.me/51964256145?text=Hola,%20necesito%20asistencia%20con%20ReservaUPLA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold text-xs pt-1 transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>WhatsApp: 964256145</span>
            </a>
          </div>
        </div>

        {/* Pie de Sidebar: Versión y Marca Institucional (Sin duplicar usuario ni botón de salir) */}
        <div className="p-4 border-t border-slate-800 text-center shrink-0 bg-slate-950/40">
          <span className="text-[11px] font-bold text-slate-400 block">
            Universidad Peruana Los Andes
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
            Módulo Institucional ReservaUPLA
          </span>
        </div>
      </aside>
    </>
  );
}
