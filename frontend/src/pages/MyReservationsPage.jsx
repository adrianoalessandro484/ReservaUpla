import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog as BaseDialog } from '@base-ui/react';
import Button from '../components/ui/Button';
import AlertMessage from '../components/ui/AlertMessage';
import ModalConfirmacion from '../components/ui/ModalConfirmacion';
import Tooltip from '../components/ui/Tooltip';
import { reservationService } from '../service';
import { useAuth } from '../context/AuthContext';

export default function MyReservationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Todas');

  // Modal para ver detalles completos
  const [detalleReserva, setDetalleReserva] = useState(null);

  // Modal para confirmar cancelación de reserva pendiente
  const [cancelarModal, setCancelarModal] = useState({
    isOpen: false,
    reserva: null,
    loading: false
  });

  const cargarMisReservas = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const data = await reservationService.getAll();

      // Filtrar únicamente las reservas del usuario docente actual
      const misReservas = data.filter((r) => {
        if (!currentUser) return true;
        return (
          r.usuarioId === currentUser.id ||
          r.usuarioCorreo?.toLowerCase() === currentUser.correo?.toLowerCase() ||
          r.usuarioCodigo?.toUpperCase() === currentUser.codigo?.toUpperCase()
        );
      });

      setReservas(misReservas);
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error al consultar reservas',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMisReservas();
  }, [currentUser]);

  // Filtrado por estado
  const reservasFiltradas = useMemo(() => {
    if (filtroEstado === 'Todas') return reservas;
    return reservas.filter((r) => r.estado === filtroEstado);
  }, [reservas, filtroEstado]);

  // Manejar cancelación de reserva pendiente
  const handleConfirmarCancelar = async () => {
    const { reserva } = cancelarModal;
    if (!reserva) return;

    try {
      setCancelarModal((prev) => ({ ...prev, loading: true }));
      await reservationService.cancel(reserva.id);

      setFeedback({
        type: 'info',
        title: 'Solicitud Cancelada',
        message: `La solicitud para "${reserva.ambienteNombre}" del ${reserva.fecha} fue cancelada correctamente.`
      });

      setCancelarModal({ isOpen: false, reserva: null, loading: false });
      cargarMisReservas();
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'No se pudo cancelar la solicitud',
        message: err.message
      });
      setCancelarModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABECERA DE MIS RESERVAS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-blue-600" />
            <span>Mis Solicitudes y Reservas de Ambientes</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Consulta el estado institucional en tiempo real de tus solicitudes de laboratorios, auditorios y salas. Puedes visualizar el detalle completo de cada reserva.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            icon={RefreshCw}
            size="md"
            onClick={cargarMisReservas}
            loading={loading}
            className="font-bold"
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            size="md"
            onClick={() => navigate('/agenda')}
            className="shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Nueva Reserva
          </Button>
        </div>
      </div>

      {feedback && (
        <AlertMessage
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* FILTROS DE ESTADO */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filtrar por Estado:</span>
          {['Todas', 'Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'].map((est) => (
            <button
              key={est}
              type="button"
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filtroEstado === est
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {est}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-500">
          Mostrando <strong>{reservasFiltradas.length}</strong> de {reservas.length} solicitudes
        </span>
      </div>

      {/* LISTADO DE TARJETAS DE RESERVAS */}
      {reservasFiltradas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No tienes reservas registradas en este estado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Puedes explorar los laboratorios y auditorios universitarios disponibles en la agenda y registrar una nueva solicitud.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={() => navigate('/agenda')}>
              Ir a la Agenda de Disponibilidad
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservasFiltradas.map((r) => {
            const estadoBadge = {
              Aprobada: {
                bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                icon: CheckCircle2,
                label: 'Aprobada (Confirmada)'
              },
              Pendiente: {
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                icon: AlertCircle,
                label: 'Pendiente de Revisión'
              },
              Rechazada: {
                bg: 'bg-red-50 text-red-800 border-red-200',
                icon: XCircle,
                label: 'Rechazada por Admin'
              },
              Cancelada: {
                bg: 'bg-slate-100 text-slate-600 border-slate-200',
                icon: XCircle,
                label: 'Cancelada'
              }
            }[r.estado] || { bg: 'bg-slate-100 text-slate-700', icon: AlertCircle, label: r.estado };

            const Icon = estadoBadge.icon;
            const hInicio = r.horaInicio.slice(0, 5);
            const hFin = r.horaFin.slice(0, 5);

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${estadoBadge.bg}`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span>{estadoBadge.label}</span>
                    </span>

                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Fecha: {r.fecha}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base leading-tight">
                    {r.ambienteNombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.ambienteTipo} • {r.ambienteUbicacion}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-700 font-bold">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Horario:</span>
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {hInicio} – {hFin} hrs
                    </span>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 line-clamp-2">
                    <span className="font-bold text-slate-900">Motivo: </span>
                    {r.motivo}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Tooltip content="Consultar especificaciones completas del turno">
                    <button
                      type="button"
                      onClick={() => setDetalleReserva(r)}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </Tooltip>

                  {r.estado === 'Pendiente' && (
                    <Tooltip content="Cancelar esta solicitud antes de su evaluación">
                      <button
                        type="button"
                        onClick={() => setCancelarModal({ isOpen: true, reserva: r, loading: false })}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar Solicitud</span>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLES DE LA RESERVA (DOCENTE) */}
      <BaseDialog.Root open={!!detalleReserva} onOpenChange={(open) => !open && setDetalleReserva(null)}>
        <BaseDialog.Portal>
          <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-fadeIn" />
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-3xl max-w-lg w-[calc(100%-2rem)] p-6 sm:p-7 shadow-2xl border border-slate-100 outline-none">
            <BaseDialog.Close
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Cerrar detalles"
            >
              <X className="h-5 w-5" />
            </BaseDialog.Close>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <BaseDialog.Title className="text-lg font-black text-slate-900 m-0">
                  Detalles de tu Solicitud
                </BaseDialog.Title>
                <BaseDialog.Description className="text-xs text-slate-500 m-0 mt-0.5">
                  Estado y especificaciones del ambiente solicitado
                </BaseDialog.Description>
              </div>
            </div>

            {detalleReserva && (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Estado Institucional:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border ${
                        detalleReserva.estado === 'Aprobada'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : detalleReserva.estado === 'Pendiente'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {detalleReserva.estado}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Fecha:</span>
                    <span className="font-mono font-bold text-slate-900">{detalleReserva.fecha}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Horario:</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {detalleReserva.horaInicio.slice(0, 5)} - {detalleReserva.horaFin.slice(0, 5)} hrs
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Ambiente Solicitado
                  </span>
                  <div className="font-bold text-slate-900 text-sm">{detalleReserva.ambienteNombre}</div>
                  <div className="text-xs text-slate-500">
                    {detalleReserva.ambienteTipo} • {detalleReserva.ambienteUbicacion}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Motivo Declarado
                  </span>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                    {detalleReserva.motivo}
                  </div>
                </div>

                {detalleReserva.estado === 'Pendiente' && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 leading-relaxed">
                    <strong>En evaluación:</strong> Esta solicitud está pendiente de revisión por el Administrador Institucional. Recibirás confirmación cuando sea aprobada o rechazada.
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <BaseDialog.Close className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors">
                Cerrar
              </BaseDialog.Close>
            </div>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>

      {/* MODAL DE CONFIRMACIÓN PARA CANCELAR SOLICITUD */}
      <ModalConfirmacion
        isOpen={cancelarModal.isOpen}
        title="¿Cancelar solicitud de reserva?"
        message={`¿Estás seguro de que deseas cancelar la solicitud para "${cancelarModal.reserva?.ambienteNombre}" del ${cancelarModal.reserva?.fecha}? Esta acción liberará el horario de revisión.`}
        confirmText="Sí, cancelar solicitud"
        cancelText="Conservar solicitud"
        variant="danger"
        onConfirm={handleConfirmarCancelar}
        onCancel={() => setCancelarModal({ isOpen: false, reserva: null, loading: false })}
      />
    </div>
  );
}
