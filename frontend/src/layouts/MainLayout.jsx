import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import ModalConfirmacion from '../components/ui/ModalConfirmacion';

export default function MainLayout() {
  const { currentUser, currentActor, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* SIDEBAR INSTITUCIONAL (Navegación contextual por rol) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentActor={currentActor}
      />

      {/* CONTENEDOR DERECHO (Navbar con Breadcrumb y Perfil + Outlet + Footer) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* NAVBAR SUPERIOR */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentActor={currentActor}
          currentUser={currentUser}
          onLogout={() => setShowLogoutModal(true)}
        />

        {/* CONTENIDO PRINCIPAL ENRUTADO */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>

        {/* FOOTER INSTITUCIONAL */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Universidad Peruana Los Andes — Oficina de Informática y Sistemas</span>
            </div>
            <div>
              <span>ReservaUPLA • Gestión de Ambientes Universitarios</span>
            </div>
          </div>
        </footer>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE CIERRE DE SESIÓN */}
      <ModalConfirmacion
        isOpen={showLogoutModal}
        title="Cerrar Sesión de la Intranet"
        message="¿Estás seguro de que deseas salir del sistema de reserva de ambientes? Para volver a ingresar deberás identificarte con tu código institucional."
        confirmText="Sí, cerrar sesión"
        cancelText="Permanecer conectado"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
