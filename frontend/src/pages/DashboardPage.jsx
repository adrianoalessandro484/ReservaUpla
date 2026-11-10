import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  Building2,
  AlertCircle,
  Check,
  ArrowRight,
  Eye,
  RefreshCw,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import CardIndicador from '../components/ui/CardIndicador';
import Button from '../components/ui/Button';
import AlertMessage from '../components/ui/AlertMessage';
import ModalConfirmacion from '../components/ui/ModalConfirmacion';
import { dashboardService, reservationService } from '../service';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentActor, currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Modal para aprobar / rechazar desde el dashboard
  const [modalAccion, setModalAccion] = useState({
    isOpen: false,
    reserva: null,
    accion: '', // 'Aprobada' | 'Rechazada'
    loading: false
  });

  const handleNavigate = (path, params = {}) => {
    const query = params.estado ? `?estado=${encodeURIComponent(params.estado)}` : '';
    navigate(`/${path}${query}`);
  };

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resIndicadores, resPendientes] = await Promise.all([
        dashboardService.getIndicators(),
        reservationService.getAll({ estado: 'Pendiente' })
      ]);
      setData(resIndicadores);
      setPendientes(resPendientes);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos del dashboard institucional.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, [currentActor]);

  // Manejar acción de aprobación / rechazo del Administrador
  const handleAbrirAccion = (reserva, accion) => {
    setModalAccion({
      isOpen: true,
      reserva,
      accion,
      loading: false
    });
  };

  const ejecutarAccionAdmin = async () => {
    const { reserva, accion } = modalAccion;
    if (!reserva) return;

    try {
      setModalAccion(prev => ({ ...prev, loading: true }));
      await reservationService.changeStatus(reserva.id, {
        nuevoEstado: accion,
        administradorUsuarioId: currentUser?.id
      });

      setFeedback({
        type: 'success',
        title: `Reserva ${accion}`,
        message: `La solicitud de ${reserva.usuarioNombre} para "${reserva.ambienteNombre}" fue ${accion.toLowerCase()} correctamente.`
      });

      setModalAccion({ isOpen: false, reserva: null, accion: '', loading: false });
      cargarDashboard();
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error de Regla de Negocio',
        message: err.message
      });
      setModalAccion(prev => ({ ...prev, loading: false }));
    }
  };

  const isAdmin = currentActor === 'Administrador';
  const isSolicitante = currentActor === 'Solicitante';
  const isResponsable = currentActor === 'Responsable de ambiente';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* BANNER DE BIENVENIDA INSTITUCIONAL Y CONTEXTO DEL ACTOR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-6 sm:p-8 text-white shadow-xl border border-blue-800/80">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-200 text-xs font-black uppercase tracking-wider mb-3 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Universidad Peruana Los Andes • ReservaUPLA</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Bienvenido(a), {currentUser?.nombreCompleto || 'Usuario'}
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              {isAdmin && (
                <>
                  Panel de Control del <strong>Administrador General</strong>. Desde aquí supervisas los ambientes institucionales, auditas indicadores y autorizas o rechazas solicitudes de reserva.
                </>
              )}
              {isSolicitante && (
                <>
                  Panel del <strong>Docente / Solicitante</strong>. Gestiona tus solicitudes de uso para laboratorios, salas y auditorios con validación automática de disponibilidad de horarios.
                </>
              )}
              {isResponsable && (
                <>
                  Panel del <strong>Responsable de Ambiente</strong>. Monitorea la agenda, ocupación diaria y estado operativo de las instalaciones universitarias asignadas.
                </>
              )}
            </p>

            {/* Aviso visual de pendientes para el Administrador (Heurística 1) */}
            {isAdmin && data?.reservasPendientes > 0 && (
              <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs sm:text-sm font-bold backdrop-blur-sm animate-pulse">
                <AlertCircle className="h-4 w-4 text-amber-300 shrink-0" />
                <span>
                  Hay <strong>{data.reservasPendientes} solicitud(es)</strong> esperando tu decisión administrativa.
                </span>
              </div>
            )}
          </div>

          {/* BOTONES PRINCIPALES DE ACCIÓN RÁPIDA (Grandes, Ergonómicos y Accesibles) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              icon={RefreshCw}
              onClick={cargarDashboard}
              loading={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
            >
              Actualizar
            </Button>

            {isAdmin ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  icon={Clock}
                  onClick={() => handleNavigate('reservas', { estado: 'Pendiente' })}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-900/30"
                >
                  Revisar Pendientes ({data?.reservasPendientes ?? 0})
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={Building2}
                  onClick={() => handleNavigate('ambientes')}
                  className="bg-white text-slate-900 hover:bg-slate-100 shadow-md font-extrabold"
                >
                  Nuevo Ambiente
                </Button>
              </>
            ) : isSolicitante ? (
              <div className="flex flex-wrap gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  icon={Calendar}
                  onClick={() => handleNavigate('agenda')}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-teal-900/30"
                >
                  Ver Agenda y Disponibilidad
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={PlusCircle}
                  onClick={() => handleNavigate('nueva-reserva')}
                  className="bg-white text-slate-900 hover:bg-slate-100 shadow-md font-extrabold"
                >
                  Registrar Solicitud
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                icon={Calendar}
                onClick={() => handleNavigate('agenda')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
              >
                Ver Uso del Ambiente Asignado
              </Button>
            )}
          </div>
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

      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* SECCIÓN: Indicadores Mínimos del Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Indicadores Principales del Sistema
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Métricas consolidadas de disponibilidad y uso de ambientes.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hidden sm:inline-block">
            Datos en tiempo real
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <CardIndicador
            title="Total de Reservas"
            value={data ? data.totalReservas : '...'}
            subtitle="Acumulado histórico institucional"
            icon={Calendar}
            color="blue"
            onClick={() => handleNavigate('reservas', { estado: '' })}
          />
          <CardIndicador
            title="Reservas Pendientes"
            value={data ? data.reservasPendientes : '...'}
            subtitle={isAdmin ? 'Requieren tu aprobación' : 'En espera de revisión'}
            icon={Clock}
            color="amber"
            onClick={() => handleNavigate('reservas', { estado: 'Pendiente' })}
          />
          <CardIndicador
            title="Reservas Aprobadas"
            value={data ? data.reservasAprobadas : '...'}
            subtitle="Horarios vigentes y confirmados"
            icon={CheckCircle2}
            color="emerald"
            onClick={() => handleNavigate('reservas', { estado: 'Aprobada' })}
          />
          <CardIndicador
            title="Reservas Rechazadas"
            value={data ? data.reservasRechazadas : '...'}
            subtitle="Finalizadas sin asignación"
            icon={XCircle}
            color="red"
            onClick={() => handleNavigate('reservas', { estado: 'Rechazada' })}
          />
        </div>
      </div>

      {/* MÓDULO PARA EL ADMINISTRADOR: SOLICITUDES PENDIENTES */}
      {isAdmin && (
        <div className="rounded-2xl border-2 border-amber-200/90 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <Clock className="h-5 w-5 stroke-[2.4]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Solicitudes Pendientes de Aprobación Inmediata
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Solo el administrador puede evaluar, autorizar o denegar estas reservas.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() => handleNavigate('reservas', { estado: 'Pendiente' })}
            >
              Ver Todas en Reservas
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {pendientes.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  ¡Al día! No hay reservas pendientes de aprobación
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Todas las solicitudes han sido atendidas o no se han registrado nuevas peticiones de ambientes en este momento.
                </p>
              </div>
            ) : (
              pendientes.slice(0, 4).map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {res.ambienteNombre}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                        {res.ambienteTipo}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded">
                        {res.fecha} • {res.horaInicio.slice(0, 5)} - {res.horaFin.slice(0, 5)} hrs
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Solicitante:</span>
                      <span>{res.usuarioNombre}</span>
                      <span className="text-slate-400">({res.usuarioCorreo})</span>
                    </div>

                    <div className="text-xs text-slate-500 italic truncate max-w-xl">
                      &quot;{res.motivo}&quot;
                    </div>
                  </div>

                  {/* Botones de Aprobación / Rechazo GRANDES para el Administrador (Ley de Fitts) */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleAbrirAccion(res, 'Aprobada')}
                      className="px-4"
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleAbrirAccion(res, 'Rechazada')}
                      className="px-4"
                    >
                      Rechazar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleNavigate('reservas')}
                      className="p-2"
                      title="Ver detalle completo"
                    >
                      Detalle
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* AMBIENTE MÁS UTILIZADO Y DEMANDA POR AMBIENTES (PDF Sección 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tarjeta Destacada: Ambiente más utilizado */}
        <div className="lg:col-span-1 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 p-6 sm:p-7 text-white shadow-xl flex flex-col justify-between border border-blue-800 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Award className="h-5 w-5 text-amber-400" />
              <span>Ambiente Más Utilizado (PDF Sec. 10)</span>
            </div>

            <h3 className="mt-5 text-2xl sm:text-3xl font-black text-white leading-tight">
              {data ? data.ambienteMasUtilizadoNombre : 'Cargando...'}
            </h3>

            {data?.ambienteMasUtilizadoTipo && (
              <span className="mt-2 inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-sky-300 text-xs font-bold border border-blue-400/30">
                {data.ambienteMasUtilizadoTipo}
              </span>
            )}

            <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Ambiente con mayor número de solicitudes aprobadas para sesiones académicas de la Universidad Peruana Los Andes.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-800/80 flex items-end justify-between">
            <div>
              <span className="text-xs text-blue-300 font-bold block uppercase tracking-wide">
                Total de reservas aprobadas
              </span>
              <div className="text-4xl font-black text-amber-400 mt-1">
                {data ? data.ambienteMasUtilizadoTotal : 0}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleNavigate('ambientes')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Ver Catálogo
            </Button>
          </div>
        </div>

        {/* Distribución de Demanda por Ambiente */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  Demanda por Ambiente Universitario
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proporción de solicitudes de reserva acumuladas por cada espacio académico.
                </p>
              </div>

              <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-700 w-fit">
                {data?.usoPorAmbiente?.length || 0} ambientes registrados
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {data?.usoPorAmbiente && data.usoPorAmbiente.length > 0 ? (
                data.usoPorAmbiente.map((item) => {
                  const max = Math.max(...data.usoPorAmbiente.map(x => x.totalReservas), 1);
                  const porcentaje = Math.round((item.totalReservas / max) * 100);

                  return (
                    <div key={item.ambienteId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-extrabold text-slate-800">{item.nombre}</span>
                        <span className="text-slate-500 font-bold text-xs">
                          {item.totalReservas} reservas ({item.aprobadas} confirmadas)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400 py-8 text-center">No hay registros de uso aún.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Gestión transparente de laboratorios y aulas magnas</span>
            <Button
              variant="outline"
              size="sm"
              icon={ArrowRight}
              onClick={() => handleNavigate('ambientes')}
            >
              Ir a Ambientes
            </Button>
          </div>
        </div>
      </div>

      {/* RESUMEN DE RECURSOS DEL CAMPUS INSTITUCIONAL */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-5 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {data?.totalAmbientes ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              Ambientes Físicos Totales
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-xs">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {data?.ambientesDisponibles ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              Ambientes Disponibles para Reserva
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-5 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 shadow-xs">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {data?.totalUsuarios ?? 0}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-0.5">
              Usuarios Institucionales Registrados
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE DECISIÓN ADMINISTRATIVA */}
      <ModalConfirmacion
        isOpen={modalAccion.isOpen}
        onClose={() => setModalAccion({ isOpen: false, reserva: null, accion: '', loading: false })}
        onConfirm={ejecutarAccionAdmin}
        loading={modalAccion.loading}
        title={
          modalAccion.accion === 'Aprobada'
            ? '¿Aprobar esta solicitud de reserva institucional?'
            : '¿Rechazar esta solicitud de reserva institucional?'
        }
        message={
          modalAccion.accion === 'Aprobada'
            ? `Se confirmará oficialmente el uso del ambiente "${modalAccion.reserva?.ambienteNombre}" para ${modalAccion.reserva?.usuarioNombre} el ${modalAccion.reserva?.fecha} de ${modalAccion.reserva?.horaInicio?.slice(0, 5)} a ${modalAccion.reserva?.horaFin?.slice(0, 5)} hrs.`
            : 'Atención: Una reserva rechazada no podrá modificarse posteriormente por ningún solicitante.'
        }
        confirmText={
          modalAccion.accion === 'Aprobada'
            ? 'Sí, Aprobar Solicitud'
            : 'Sí, Rechazar Solicitud'
        }
        confirmVariant={modalAccion.accion === 'Aprobada' ? 'success' : 'danger'}
      />
    </div>
  );
}
