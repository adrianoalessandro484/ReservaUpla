import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Award, Users, Building2, AlertCircle } from 'lucide-react';
import CardIndicador from '../ui/CardIndicador';
import Button from '../ui/Button';
import AlertMessage from '../ui/AlertMessage';
import { dashboardApi } from '../../api/client';

export default function DashboardView({ onNavigate, currentActor }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.obtenerIndicadores();
      setData(res);
    } catch (err) {
      setError(err.message || 'Error al cargar los indicadores del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel de Indicadores y Disponibilidad
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Métricas institucionales en tiempo real para la gestión de reservas de ambientes universitarios UPLA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={cargarDashboard} loading={loading}>
            Actualizar
          </Button>
          <Button variant="primary" size="sm" icon={Calendar} onClick={() => onNavigate('nueva-reserva')}>
            Nueva Reserva
          </Button>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Rúbrica Sec. 10: Indicadores mínimos del dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardIndicador
          title="Total de Reservas"
          value={data ? data.totalReservas : '...'}
          subtitle="Registros acumulados"
          icon={Calendar}
          color="blue"
          onClick={() => onNavigate('reservas', { estado: '' })}
        />
        <CardIndicador
          title="Reservas Pendientes"
          value={data ? data.reservasPendientes : '...'}
          subtitle="En espera de aprobación"
          icon={Clock}
          color="amber"
          onClick={() => onNavigate('reservas', { estado: 'Pendiente' })}
        />
        <CardIndicador
          title="Reservas Aprobadas"
          value={data ? data.reservasAprobadas : '...'}
          subtitle="Ambientes confirmados"
          icon={CheckCircle2}
          color="emerald"
          onClick={() => onNavigate('reservas', { estado: 'Aprobada' })}
        />
        <CardIndicador
          title="Reservas Rechazadas"
          value={data ? data.reservasRechazadas : '...'}
          subtitle="RN-06: No modificables"
          icon={XCircle}
          color="red"
          onClick={() => onNavigate('reservas', { estado: 'Rechazada' })}
        />
      </div>

      {/* Indicador destacado: Ambiente más utilizado y Recursos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Ambiente Más Utilizado</span>
            </div>
            <h3 className="mt-4 text-2xl font-black text-white leading-tight">
              {data ? data.ambienteMasUtilizadoNombre : 'Cargando...'}
            </h3>
            {data?.ambienteMasUtilizadoTipo && (
              <p className="mt-1 text-sm text-blue-200 font-medium">
                {data.ambienteMasUtilizadoTipo}
              </p>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-blue-800/80 flex items-end justify-between">
            <div>
              <span className="text-xs text-blue-300">Total de reservas recibidas</span>
              <div className="text-3xl font-black text-amber-400">
                {data ? data.ambienteMasUtilizadoTotal : 0}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('ambientes')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Ver Ambientes
            </Button>
          </div>
        </div>

        {/* Distribución de Uso de Ambientes */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Demanda por Ambiente Universitario</h3>
              <p className="text-xs text-slate-500">Distribución de reservas aprobadas y totales registradas</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-600">
              {data?.usoPorAmbiente?.length || 0} ambientes activos
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {data?.usoPorAmbiente && data.usoPorAmbiente.length > 0 ? (
              data.usoPorAmbiente.map((item) => {
                const max = Math.max(...data.usoPorAmbiente.map(x => x.totalReservas), 1);
                const porcentaje = Math.round((item.totalReservas / max) * 100);

                return (
                  <div key={item.ambienteId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{item.nombre}</span>
                      <span className="text-slate-500 font-medium">
                        {item.totalReservas} reservas ({item.aprobadas} aprobadas)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 rounded-full transition-all duration-500"
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
      </div>

      {/* Resumen de Recursos Institucionales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{data?.totalAmbientes ?? 0}</div>
            <div className="text-xs text-slate-500">Ambientes Registrados</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{data?.ambientesDisponibles ?? 0}</div>
            <div className="text-xs text-slate-500">Ambientes Operativos</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{data?.totalUsuarios ?? 0}</div>
            <div className="text-xs text-slate-500">Usuarios Solicitantes y Admins</div>
          </div>
        </div>
      </div>
    </div>
  );
}
