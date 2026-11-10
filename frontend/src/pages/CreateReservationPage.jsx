import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, CheckCircle } from 'lucide-react';
import SelectInput from '../components/ui/SelectInput';
import DateInput from '../components/ui/DateInput';
import TimeInput from '../components/ui/TimeInput';
import Button from '../components/ui/Button';
import AlertMessage from '../components/ui/AlertMessage';
import { usuarioService as usuarioApi, ambienteService as ambienteApi, reservaService as reservaApi } from '../service';
import { useAuth } from '../context/AuthContext';

export default function CreateReservationPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const hoyStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    usuarioId: currentUser?.id || '',
    ambienteId: '',
    fecha: hoyStr,
    horaInicio: '08:00',
    horaFin: '10:00',
    motivo: ''
  });

  const [usuarios, setUsuarios] = useState([]);
  const [ambientes, setAmbientes] = useState([]);
  const [loadingInit, setLoadingInit] = useState(true);

  const [verificando, setVerificando] = useState(false);
  const [resultadoDisponibilidad, setResultadoDisponibilidad] = useState(null);

  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  const [erroresFront, setErroresFront] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoadingInit(true);
        const [uRes, aRes] = await Promise.all([
          usuarioApi.obtenerTodos(),
          ambienteApi.obtenerTodos({ estado: 'Disponible' })
        ]);
        setUsuarios(uRes);
        setAmbientes(aRes);

        if (currentUser?.id) {
          setFormData(prev => ({ ...prev, usuarioId: currentUser.id }));
        } else if (uRes.length > 0) {
          setFormData(prev => ({ ...prev, usuarioId: uRes[0].id }));
        }

        if (aRes.length > 0) {
          setFormData(prev => ({ ...prev, ambienteId: aRes[0].id }));
        }
      } catch (err) {
        setMensajeError('No se pudieron cargar usuarios y ambientes institucionales: ' + err.message);
      } finally {
        setLoadingInit(false);
      }
    };

    cargarDatos();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setResultadoDisponibilidad(null);
    setMensajeExito(null);
    setMensajeError(null);

    if (erroresFront[name]) {
      setErroresFront(prev => ({ ...prev, [name]: null }));
    }
  };

  const validarFormularioFrontend = () => {
    const errs = {};

    if (!formData.usuarioId) {
      errs.usuarioId = 'Debe seleccionar el solicitante institucional.';
    }

    if (!formData.ambienteId) {
      errs.ambienteId = 'Debe seleccionar el ambiente universitario.';
    }

    if (!formData.fecha) {
      errs.fecha = 'La fecha es obligatoria.';
    }

    if (!formData.horaInicio) {
      errs.horaInicio = 'La hora de inicio es requerida.';
    }

    if (!formData.horaFin) {
      errs.horaFin = 'La hora de fin es requerida.';
    }

    // Regla: La hora de fin debe ser mayor que la hora de inicio
    if (formData.horaInicio && formData.horaFin) {
      if (formData.horaFin <= formData.horaInicio) {
        errs.horaFin = 'La hora de fin debe ser mayor que la hora de inicio.';
      }

      // Regla: Las reservas solo podrán realizarse entre las 07:00 y 22:00 horas
      if (formData.horaInicio < '07:00' || formData.horaFin > '22:00') {
        errs.horaInicio = 'El horario institucional permitido es de 07:00 a 22:00 horas.';
      }
    }

    // Regla: Motivo requerido
    if (!formData.motivo.trim()) {
      errs.motivo = 'Toda reserva debe registrar el motivo institucional.';
    } else if (formData.motivo.trim().length < 5) {
      errs.motivo = 'El motivo debe ser más detallado (mínimo 5 caracteres).';
    }

    setErroresFront(errs);
    return Object.keys(errs).length === 0;
  };

  // Validar disponibilidad antes de registrar
  const handleVerificarDisponibilidad = async () => {
    if (!validarFormularioFrontend()) {
      return;
    }

    try {
      setVerificando(true);
      setResultadoDisponibilidad(null);
      setMensajeError(null);

      const res = await reservaApi.verificarDisponibilidad({
        ambienteId: formData.ambienteId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin
      });

      setResultadoDisponibilidad(res);
    } catch (err) {
      setMensajeError(err.message || 'Error al comprobar disponibilidad.');
    } finally {
      setVerificando(false);
    }
  };

  // Registrar solicitud de reserva
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormularioFrontend()) {
      return;
    }

    try {
      setEnviando(true);
      setMensajeError(null);
      setMensajeExito(null);

      const nuevaReserva = await reservaApi.crear({
        usuarioId: formData.usuarioId,
        ambienteId: formData.ambienteId,
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        motivo: formData.motivo.trim()
      });

      setMensajeExito(`¡Solicitud de reserva registrada con éxito! Código: ${nuevaReserva.id.slice(0, 8)}... Estado: Pendiente de aprobación.`);
      setResultadoDisponibilidad(null);

      setTimeout(() => {
        navigate('/reservas');
      }, 1400);
    } catch (err) {
      setMensajeError(err.message || 'No se pudo registrar la reserva.');
    } finally {
      setEnviando(false);
    }
  };

  const ambienteSeleccionado = ambientes.find(a => a.id === formData.ambienteId);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            Registrar Solicitud de Reserva
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Complete el formulario con los datos de fecha, horario y motivo de la actividad institucional.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/reservas')}>
          Ver Listado
        </Button>
      </div>

      {mensajeExito && (
        <AlertMessage
          type="success"
          title="Reserva Registrada"
          message={mensajeExito}
          onClose={() => setMensajeExito(null)}
        />
      )}

      {mensajeError && (
        <AlertMessage
          type="error"
          title="Validación Institucional"
          message={mensajeError}
          onClose={() => setMensajeError(null)}
        />
      )}

      {/* Resultado de la verificación de disponibilidad */}
      {resultadoDisponibilidad && (
        <AlertMessage
          type={resultadoDisponibilidad.disponible ? 'success' : 'error'}
          title={resultadoDisponibilidad.disponible ? 'Ambiente Disponible' : 'Conflicto de Horario'}
          message={resultadoDisponibilidad.mensaje}
          onClose={() => setResultadoDisponibilidad(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Solicitante y Ambiente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SelectInput
            label="Solicitante"
            name="usuarioId"
            value={formData.usuarioId}
            onChange={handleChange}
            options={usuarios.map(u => ({ value: u.id, label: `${u.nombreCompleto} (${u.rol})` }))}
            error={erroresFront.usuarioId}
            required
            disabled={loadingInit}
          />

          <SelectInput
            label="Ambiente Universitario"
            name="ambienteId"
            value={formData.ambienteId}
            onChange={handleChange}
            options={ambientes.map(a => ({ value: a.id, label: `${a.nombre} [Cap. ${a.capacidad}]` }))}
            error={erroresFront.ambienteId}
            required
            disabled={loadingInit}
          />
        </div>

        {ambienteSeleccionado && (
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900 flex items-center justify-between">
            <div>
              <span className="font-bold">{ambienteSeleccionado.nombre}</span> — {ambienteSeleccionado.tipo}
              <div className="text-blue-700 mt-0.5">{ambienteSeleccionado.ubicacion}</div>
            </div>
            <div className="text-right">
              <span className="font-semibold px-2 py-0.5 bg-blue-200/60 rounded-md">
                Capacidad: {ambienteSeleccionado.capacidad} personas
              </span>
            </div>
          </div>
        )}

        {/* Fecha y Horarios */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <DateInput
            label="Fecha de Reserva"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            min={hoyStr}
            error={erroresFront.fecha}
            required
          />

          <TimeInput
            label="Hora de Inicio (Desde las 07:00)"
            name="horaInicio"
            value={formData.horaInicio}
            onChange={handleChange}
            min="07:00"
            max="21:45"
            error={erroresFront.horaInicio}
            required
          />

          <TimeInput
            label="Hora de Fin (Hasta las 22:00)"
            name="horaFin"
            value={formData.horaFin}
            onChange={handleChange}
            min="07:15"
            max="22:00"
            error={erroresFront.horaFin}
            required
          />
        </div>

        {/* Motivo */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="motivo" className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            Motivo Institucional de la Reserva
            <span className="text-red-500 font-bold">*</span>
          </label>
          <textarea
            id="motivo"
            name="motivo"
            rows={3}
            value={formData.motivo}
            onChange={handleChange}
            placeholder="Ejemplo: Práctica guiada de Base de Datos para estudiantes de VI ciclo..."
            className={`block w-full rounded-lg border bg-white p-3 text-sm transition-all outline-none
              ${erroresFront.motivo ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-900' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900'}`}
          />
          {erroresFront.motivo && (
            <p className="text-xs text-red-600 font-medium">{erroresFront.motivo}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            icon={ShieldCheck}
            onClick={handleVerificarDisponibilidad}
            loading={verificando}
          >
            Validar Disponibilidad
          </Button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/reservas')}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={CheckCircle}
              loading={enviando}
              className="flex-1 sm:flex-initial"
            >
              Registrar Reserva
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
