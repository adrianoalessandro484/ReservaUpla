import { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import AlertMessage from '../components/ui/AlertMessage';
import Tooltip from '../components/ui/Tooltip';
import { reservationService, roomService } from '../service';

export default function ReportsPage() {
  const hoyStr = new Date().toISOString().split('T')[0];

  // Filtros de reporte
  const [fechaDesde, setFechaDesde] = useState(hoyStr);
  const [fechaHasta, setFechaHasta] = useState(hoyStr);
  const [filtroAmbiente, setFiltroAmbiente] = useState('Todos');
  const [filtroEstado, setFiltroEstado] = useState('Todas');

  // Datos
  const [reservas, setReservas] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Cargar ambientes y reservas iniciales
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const rooms = await roomService.getAll();
        setAmbientes(rooms);
      } catch (err) {
        console.error('Error cargando ambientes para reportes:', err);
      }
    };
    cargarCatalogos();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      setFeedback(null);
      const data = await reservationService.getAll();
      setReservas(data);
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
    cargarReservas();
  }, []);

  // Botones de filtro rápido de fechas
  const setRangoRapido = (tipo) => {
    const d = new Date();
    const hoy = d.toISOString().split('T')[0];

    if (tipo === 'hoy') {
      setFechaDesde(hoy);
      setFechaHasta(hoy);
    } else if (tipo === 'semana') {
      const primerDia = new Date(d);
      primerDia.setDate(d.getDate() - d.getDay() + 1);
      const ultimoDia = new Date(primerDia);
      ultimoDia.setDate(primerDia.getDate() + 6);
      setFechaDesde(primerDia.toISOString().split('T')[0]);
      setFechaHasta(ultimoDia.toISOString().split('T')[0]);
    } else if (tipo === 'mes') {
      const primerDia = new Date(d.getFullYear(), d.getMonth(), 1);
      const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      setFechaDesde(primerDia.toISOString().split('T')[0]);
      setFechaHasta(ultimoDia.toISOString().split('T')[0]);
    } else if (tipo === 'todos') {
      setFechaDesde('');
      setFechaHasta('');
    }
  };

  // Filtrado de las reservas en memoria según los criterios seleccionados
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      // Filtro de fecha
      if (fechaDesde && r.fecha < fechaDesde) return false;
      if (fechaHasta && r.fecha > fechaHasta) return false;

      // Filtro de ambiente
      if (filtroAmbiente !== 'Todos' && r.ambienteId !== filtroAmbiente) return false;

      // Filtro de estado
      if (filtroEstado !== 'Todas' && r.estado !== filtroEstado) return false;

      return true;
    }).sort((a, b) => {
      // Orden cronológico
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.horaInicio.localeCompare(b.horaInicio);
    });
  }, [reservas, fechaDesde, fechaHasta, filtroAmbiente, filtroEstado]);

  // Cálculo de indicadores del reporte filtrado
  const resumenReporte = useMemo(() => {
    const total = reservasFiltradas.length;
    const aprobadas = reservasFiltradas.filter((r) => r.estado === 'Aprobada').length;
    const pendientes = reservasFiltradas.filter((r) => r.estado === 'Pendiente').length;
    const rechazadas = reservasFiltradas.filter((r) => r.estado === 'Rechazada').length;

    // Calcular horas totales ocupadas (solo de aprobadas)
    let horasOcupadas = 0;
    reservasFiltradas
      .filter((r) => r.estado === 'Aprobada')
      .forEach((r) => {
        const [hI, mI] = r.horaInicio.split(':').map(Number);
        const [hF, mF] = r.horaFin.split(':').map(Number);
        const diff = (hF * 60 + mF - (hI * 60 + mI)) / 60;
        if (diff > 0) horasOcupadas += diff;
      });

    return { total, aprobadas, pendientes, rechazadas, horasOcupadas };
  }, [reservasFiltradas]);

  // Exportar a CSV / Excel con codificación UTF-8 BOM
  const handleExportarCSV = () => {
    if (reservasFiltradas.length === 0) {
      setFeedback({
        type: 'warning',
        title: 'Sin datos para exportar',
        message: 'No existen registros para el rango de fechas y filtros seleccionados.'
      });
      return;
    }

    const headers = [
      'Fecha',
      'Hora Inicio',
      'Hora Fin',
      'Horario Ocupado',
      'Ambiente Universitario',
      'Tipo de Ambiente',
      'Ubicación',
      'Código Solicitante',
      'Nombre del Solicitante',
      'Correo',
      'Motivo de la Reserva',
      'Estado'
    ];

    const rows = reservasFiltradas.map((r) => {
      const hInicio = r.horaInicio.slice(0, 5);
      const hFin = r.horaFin.slice(0, 5);
      return [
        r.fecha,
        hInicio,
        hFin,
        `"${hInicio} - ${hFin}"`,
        `"${(r.ambienteNombre || '').replace(/"/g, '""')}"`,
        `"${(r.ambienteTipo || '').replace(/"/g, '""')}"`,
        `"${(r.ambienteUbicacion || '').replace(/"/g, '""')}"`,
        `"${r.usuarioCodigo || ''}"`,
        `"${(r.usuarioNombre || '').replace(/"/g, '""')}"`,
        `"${r.usuarioCorreo || ''}"`,
        `"${(r.motivo || '').replace(/"/g, '""')}"`,
        r.estado
      ].join(',');
    });

    // Agregar UTF-8 BOM (\uFEFF) para que Excel reconozca tildes y caracteres especiales en español
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fechaNombre = fechaDesde ? `${fechaDesde}_a_${fechaHasta || fechaDesde}` : 'Historico';
    link.setAttribute('download', `Reporte_Ocupacion_Ambientes_UPLA_${fechaNombre}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Imprimir / Guardar en PDF mediante el diálogo del navegador
  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* CABECERA (Visible en pantalla, oculta en impresión si se desea) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="h-7 w-7 text-blue-600" />
            <span>Informe de Reservas y Ocupación de Ambientes</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Genera y descarga informes institucionales de ocupación de horarios por fecha o ambiente específico, con exportación a formato <strong>Excel/CSV</strong> e <strong>impresión formal en PDF</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Tooltip content="Imprimir reporte formal con membrete UPLA o guardar como PDF">
            <Button
              variant="outline"
              icon={Printer}
              size="md"
              onClick={handleImprimir}
              className="shadow-xs font-bold"
            >
              Imprimir / PDF
            </Button>
          </Tooltip>

          <Tooltip content="Descargar archivo .CSV con codificación UTF-8 compatible con Microsoft Excel">
            <Button
              variant="primary"
              icon={Download}
              size="md"
              onClick={handleExportarCSV}
              className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Descargar Excel (CSV)
            </Button>
          </Tooltip>
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

      {/* PANEL DE FILTROS CONFIGURABLES */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500 tracking-wider">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>Criterios de Filtrado de Ocupación</span>
          </div>

          {/* Accesos rápidos de rango */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setRangoRapido('hoy')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => setRangoRapido('semana')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Esta Semana
            </button>
            <button
              type="button"
              onClick={() => setRangoRapido('mes')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => setRangoRapido('todos')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              Histórico Completo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ambiente Universitario
            </label>
            <select
              value={filtroAmbiente}
              onChange={(e) => setFiltroAmbiente(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer"
            >
              <option value="Todos">Todos los Ambientes</option>
              {ambientes.map((amb) => (
                <option key={amb.id} value={amb.id}>
                  {amb.nombre} ({amb.tipo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Estado de la Reserva
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white cursor-pointer"
            >
              <option value="Todas">Todos los Estados</option>
              <option value="Aprobada">Aprobadas (Horarios Confirmados)</option>
              <option value="Pendiente">Pendientes de Revisión</option>
              <option value="Rechazada">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS RESUMEN DE LOS RESULTADOS FILTRADOS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Registros Filtrados
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {resumenReporte.total}
          </span>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Aprobadas (Confirmadas)
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {resumenReporte.aprobadas}
          </span>
        </div>

        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            Horas Ocupadas
          </span>
          <span className="text-2xl font-black text-blue-800 mt-1 block">
            {resumenReporte.horasOcupadas} hrs
          </span>
        </div>

        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Pendientes
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">
            {resumenReporte.pendientes}
          </span>
        </div>
      </div>

      {/* VISTA PREVIA IMPRESA Y EN PANTALLA */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Encabezado visible en impresión */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black uppercase text-slate-900">
                UNIVERSIDAD PERUANA LOS ANDES
              </h1>
              <p className="text-xs font-bold text-slate-600">
                Oficina de Informática y Sistemas • Sistema ReservaUPLA
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Reporte de Horarios de Ocupación y Control de Reservas
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Fecha de emisión: {new Date().toLocaleDateString('es-PE')}</p>
              <p>Rango: {fechaDesde || 'Inicio'} al {fechaHasta || 'Fin'}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            Bitácora de Horarios de Ocupación ({reservasFiltradas.length} resultados)
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={cargarReservas}
            loading={loading}
            className="text-xs font-bold text-slate-600 print:hidden"
          >
            Actualizar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-black border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Horario Ocupado</th>
                <th className="py-3 px-4">Ambiente</th>
                <th className="py-3 px-4">Docente / Solicitante</th>
                <th className="py-3 px-4">Motivo Institucional</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                    No se encontraron reservas registradas para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((r) => {
                  const estadoBadge = {
                    Aprobada: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    Pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
                    Rechazada: 'bg-red-50 text-red-800 border-red-200',
                    Cancelada: 'bg-slate-100 text-slate-600 border-slate-200'
                  }[r.estado] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {r.fecha}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                          {r.horaInicio.slice(0, 5)} - {r.horaFin.slice(0, 5)}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{r.ambienteNombre}</div>
                        <div className="text-[10px] text-slate-500">{r.ambienteTipo} • {r.ambienteUbicacion}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{r.usuarioNombre}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {r.usuarioCodigo || 'DOC-UPLA'} • {r.usuarioCorreo}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs text-slate-600 truncate" title={r.motivo}>
                        {r.motivo}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black border ${estadoBadge}`}>
                          {r.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de página oficial visible en impresión */}
        <div className="hidden print:flex justify-between items-center p-6 border-t border-slate-300 mt-8 text-xs text-slate-500">
          <div>
            <p>Generado por: Administrador General del Sistema</p>
            <p>Universidad Peruana Los Andes — Intranet</p>
          </div>
          <div className="border-t border-slate-400 w-48 text-center pt-1 text-slate-600 font-bold">
            Firma / Sello Responsable
          </div>
        </div>
      </div>
    </div>
  );
}
