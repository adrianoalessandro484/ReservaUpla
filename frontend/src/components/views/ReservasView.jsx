import { useState, useEffect } from 'react';
import { Calendar, Filter, CheckCircle2, XCircle, Ban, Eye, Plus, Clock, AlertTriangle, Building2, User } from 'lucide-react';
import TableList from '../ui/TableList';
import Button from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import ModalConfirmacion from '../ui/ModalConfirmacion';
import SelectInput from '../ui/SelectInput';
import DateInput from '../ui/DateInput';
import { reservaApi, ambienteApi } from '../../api/client';

export default function ReservasView({ onNavigate, currentActor, currentUser, initialEstado = '' }) {
  const [reservas, setReservas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState(initialEstado);
  const [filtroAmbiente, setFiltroAmbiente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

  // Estados del modal de confirmación de acción (Aprobar / Rechazar / Cancelar)
  const [modalAccion, setModalAccion] = useState({
    isOpen: false,
    reserva: null,
    accion: '', // 'Aprobada' | 'Rechazada' | 'Cancelada'
    loading: false
  });

  const [feedback, setFeedback] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setFeedback(null);

      const params = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroAmbiente) params.ambienteId = filtroAmbiente;
      if (filtroFecha) params.fecha = filtroFecha;

      const [resData, ambData] = await Promise.all([
        reservaApi.obtenerTodas(params),
        ambienteApi.obtenerTodos()
      ]);

      setReservas(resData);
      setAmbientes(ambData);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar las reservas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroAmbiente, filtroFecha]);

  const handleVerDetalle = (reserva) => {
    setReservaSeleccionada(reserva);
    setModalDetalleOpen(true);
  };

  // Abrir confirmación de aprobación o rechazo
  const handleAbrirAccion = (reserva, accion) => {
    // RN-06: Una reserva rechazada no podrá modificarse
    if (reserva.estado === 'Rechazada') {
      setFeedback({
        type: 'warning',
        title: 'Regla de Negocio RN-06',
        message: 'Una reserva rechazada no podrá modificarse.'
      });
      return;
    }

    // RN-05: Solo el administrador puede aprobar o rechazar una reserva
    if ((accion === 'Aprobada' || accion === 'Rechazada') && currentActor !== 'Administrador') {
      setFeedback({
        type: 'warning',
        title: 'Acceso Denegado (RN-05)',
        message: 'Solo el administrador institucional puede aprobar o rechazar reservas. Cambie su rol actual a Administrador en la barra superior para continuar.'
      });
      return;
    }

    setModalAccion({
      isOpen: true,
      reserva,
      accion,
      loading: false
    });
  };

  const ejecutarCambioEstado = async () => {
    const { reserva, accion } = modalAccion;
    if (!reserva) return;

    try {
      setModalAccion(prev => ({ ...prev, loading: true }));

      if (accion === 'Cancelada') {
        await reservaApi.cancelar(reserva.id);
        setFeedback({
          type: 'success',
          title: 'Reserva Cancelada',
          message: `La reserva para ${reserva.ambienteNombre} fue cancelada exitosamente.`
        });
      } else {
        // RN-05: Enviar id de admin
        await reservaApi.cambiarEstado(reserva.id, {
          nuevoEstado: accion,
          administradorUsuarioId: currentUser?.id
        });
        setFeedback({
          type: 'success',
          title: `Reserva ${accion}`,
          message: `La reserva para el ambiente "${reserva.ambienteNombre}" fue cambiada a estado ${accion}.`
        });
      }

      setModalAccion({ isOpen: false, reserva: null, accion: '', loading: false });
      if (modalDetalleOpen) setModalDetalleOpen(false);
      cargarDatos();
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error al cambiar estado',
        message: err.message
      });
      setModalAccion(prev => ({ ...prev, loading: false }));
    }
  };

  const getBadgeEstado = (estado) => {
    const styles = {
      Pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
      Aprobada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Rechazada: 'bg-red-100 text-red-800 border-red-200',
      Cancelada: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[estado] || styles.Pendiente}`}>
        {estado}
      </span>
    );
  };

  const columnas = [
    {
      header: 'Ambiente',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-900">{r.ambienteNombre}</div>
          <div className="text-xs text-slate-500">{r.ambienteTipo}</div>
        </div>
      )
    },
    {
      header: 'Solicitante',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-900">{r.usuarioNombre}</div>
          <div className="text-xs text-slate-400">{r.usuarioCorreo}</div>
        </div>
      )
    },
    {
      header: 'Fecha y Horario',
      render: (r) => (
        <div>
          <div className="font-medium text-slate-800">{r.fecha}</div>
          <div className="text-xs font-semibold text-blue-700">
            {r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)} hrs
          </div>
        </div>
      )
    },
    {
      header: 'Motivo',
      render: (r) => (
        <span className="truncate max-w-[180px] block text-xs text-slate-600" title={r.motivo}>
          {r.motivo}
        </span>
      )
    },
    {
      header: 'Estado',
      align: 'center',
      render: (r) => getBadgeEstado(r.estado)
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleVerDetalle(r)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100"
            title="Ver detalle de la reserva (RF-06)"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Botones de Administrador (RN-05) */}
          {r.estado === 'Pendiente' && (
            <>
              <button
                onClick={() => handleAbrirAccion(r, 'Aprobada')}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                title="Aprobar reserva (Solo Admin - RN-05)"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleAbrirAccion(r, 'Rechazada')}
                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                title="Rechazar reserva (Solo Admin - RN-05)"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </>
          )}

          {r.estado !== 'Rechazada' && r.estado !== 'Cancelada' && (
            <button
              onClick={() => handleAbrirAccion(r, 'Cancelada')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Cancelar reserva"
            >
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera y controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Listado y Gestión de Reservas (RF-05, RF-07)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Consulte y administre las solicitudes cumpliendo las reglas RN-01, RN-05 y RN-06.
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm" onClick={() => onNavigate('nueva-reserva')}>
          Nueva Reserva (RF-03)
        </Button>
      </div>

      {feedback && (
        <AlertMessage
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <SelectInput
          label="Filtrar por Estado"
          name="filtroEstado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          placeholder="Todos los estados"
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'Pendiente', label: 'Pendientes' },
            { value: 'Aprobada', label: 'Aprobadas' },
            { value: 'Rechazada', label: 'Rechazadas' },
            { value: 'Cancelada', label: 'Canceladas' }
          ]}
        />

        <SelectInput
          label="Filtrar por Ambiente"
          name="filtroAmbiente"
          value={filtroAmbiente}
          onChange={(e) => setFiltroAmbiente(e.target.value)}
          placeholder="Todos los ambientes"
          options={[
            { value: '', label: 'Todos los ambientes' },
            ...ambientes.map(a => ({ value: a.id, label: a.nombre }))
          ]}
        />

        <DateInput
          label="Filtrar por Fecha"
          name="filtroFecha"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setFiltroEstado('');
              setFiltroAmbiente('');
              setFiltroFecha('');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>

      {/* Tabla de Reservas (TableList component) */}
      <TableList
        columns={columnas}
        data={reservas}
        loading={loading}
        emptyMessage="No se encontraron reservas con los filtros seleccionados."
        onRowClick={handleVerDetalle}
      />

      {/* Modal de Detalle de Reserva (RF-06) */}
      {modalDetalleOpen && reservaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Detalle de Reserva (RF-06)
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {reservaSeleccionada.ambienteNombre}
                </h3>
              </div>
              <div>{getBadgeEstado(reservaSeleccionada.estado)}</div>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400 block">Fecha Programada</span>
                  <span className="font-semibold text-slate-900">{reservaSeleccionada.fecha}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Horario</span>
                  <span className="font-semibold text-blue-700">
                    {reservaSeleccionada.horaInicio.slice(0, 5)} - {reservaSeleccionada.horaFin.slice(0, 5)} hrs
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Motivo Institucional (RN-02)</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-800">
                  {reservaSeleccionada.motivo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <User className="h-3.5 w-3.5" /> Solicitante
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{reservaSeleccionada.usuarioNombre}</div>
                  <div className="text-[11px] text-slate-500">{reservaSeleccionada.usuarioCorreo}</div>
                </div>

                <div className="border border-slate-100 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1">
                    <Building2 className="h-3.5 w-3.5" /> Ubicación y Capacidad
                  </div>
                  <div className="font-bold text-slate-900 text-xs">{reservaSeleccionada.ambienteUbicacion}</div>
                  <div className="text-[11px] text-slate-500">Capacidad: {reservaSeleccionada.ambienteCapacidad} personas</div>
                </div>
              </div>

              {reservaSeleccionada.estado === 'Rechazada' && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>RN-06: Esta reserva se encuentra rechazada y ya no puede ser modificada.</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setModalDetalleOpen(false)}>
                Cerrar
              </Button>

              {reservaSeleccionada.estado === 'Pendiente' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => {
                      setModalDetalleOpen(false);
                      handleAbrirAccion(reservaSeleccionada, 'Rechazada');
                    }}
                  >
                    Rechazar
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => {
                      setModalDetalleOpen(false);
                      handleAbrirAccion(reservaSeleccionada, 'Aprobada');
                    }}
                  >
                    Aprobar (RN-05)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Acción (ModalConfirmacion component) */}
      <ModalConfirmacion
        isOpen={modalAccion.isOpen}
        onClose={() => setModalAccion({ isOpen: false, reserva: null, accion: '', loading: false })}
        onConfirm={ejecutarCambioEstado}
        loading={modalAccion.loading}
        title={
          modalAccion.accion === 'Aprobada'
            ? '¿Aprobar esta solicitud de reserva?'
            : modalAccion.accion === 'Rechazada'
            ? '¿Rechazar esta solicitud de reserva?'
            : '¿Cancelar esta reserva?'
        }
        message={
          modalAccion.accion === 'Aprobada'
            ? `Se confirmará el uso del ambiente "${modalAccion.reserva?.ambienteNombre}" para el ${modalAccion.reserva?.fecha} de ${modalAccion.reserva?.horaInicio?.slice(0, 5)} a ${modalAccion.reserva?.horaFin?.slice(0, 5)} hrs.`
            : modalAccion.accion === 'Rechazada'
            ? 'Atención (RN-06): Una reserva rechazada no podrá modificarse posteriormente.'
            : 'La reserva pasará a estado Cancelada y el horario quedará liberado.'
        }
        confirmText={
          modalAccion.accion === 'Aprobada'
            ? 'Sí, Aprobar Reserva'
            : modalAccion.accion === 'Rechazada'
            ? 'Sí, Rechazar Reserva'
            : 'Sí, Cancelar Reserva'
        }
        confirmVariant={modalAccion.accion === 'Aprobada' ? 'success' : 'danger'}
      />
    </div>
  );
}
