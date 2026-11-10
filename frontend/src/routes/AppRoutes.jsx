import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import {
  LoginPage,
  DashboardPage,
  ReservationsPage,
  CreateReservationPage,
  RoomsPage,
  UsersPage,
  SchedulePage,
  ReportsPage,
  MyReservationsPage,
  NotFoundPage
} from '../pages';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ruta Pública: Inicio de Sesión UPLA */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas bajo Layout Institucional (Navbar + Sidebar + Footer) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="inicio" element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Agenda Visual Estilo Google Calendar */}
        <Route path="agenda" element={<SchedulePage />} />
        <Route path="disponibilidad" element={<SchedulePage />} />

        {/* Gestión y Aprobación de Reservas (Administrador y Responsable para consulta) */}
        <Route
          path="reservas"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Responsable de ambiente']}>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reservations"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Responsable de ambiente']}>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* Mis Reservas (Docente / Solicitante) */}
        <Route
          path="mis-reservas"
          element={
            <ProtectedRoute allowedRoles={['Solicitante']}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-reservations"
          element={
            <ProtectedRoute allowedRoles={['Solicitante']}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* Informe de Ocupación y Reservas (Solo Administrador) */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Registrar Nueva Reserva (Docente y Administrador) */}
        <Route
          path="nueva-reserva"
          element={
            <ProtectedRoute allowedRoles={['Solicitante', 'Administrador']}>
              <CreateReservationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create-reservation"
          element={
            <ProtectedRoute allowedRoles={['Solicitante', 'Administrador']}>
              <CreateReservationPage />
            </ProtectedRoute>
          }
        />

        {/* Ambientes Universitarios (Administrador y Responsable) */}
        <Route
          path="ambientes"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Responsable de ambiente']}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="rooms"
          element={
            <ProtectedRoute allowedRoles={['Administrador', 'Responsable de ambiente']}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        {/* Usuarios Institucionales (Exclusivo Administrador) */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta no encontrada dentro del Layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Fallback general */}
      <Route path="*" element={<Navigate to="/agenda" replace />} />
    </Routes>
  );
}
