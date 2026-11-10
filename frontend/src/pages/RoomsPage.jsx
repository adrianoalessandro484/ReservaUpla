import { useState, useEffect } from 'react';
import { Building2, Plus, Users, MapPin, X } from 'lucide-react';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import SelectInput from '../components/ui/SelectInput';
import AlertMessage from '../components/ui/AlertMessage';
import { ambienteService as ambienteApi } from '../service';

export default function RoomsPage() {
  const [ambientes, setAmbientes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [nuevoAmbiente, setNuevoAmbiente] = useState({
    nombre: '',
    tipo: 'Laboratorio de Cómputo',
    capacidad: 30,
    ubicacion: '',
    estado: 'Disponible'
  });

  const [errores, setErrores] = useState({});

  const cargarAmbientes = async () => {
    try {
      setLoading(true);
      const [ambData, tiposData, estadosData] = await Promise.all([
        ambienteApi.obtenerTodos(),
        ambienteApi.obtenerTipos(),
        ambienteApi.obtenerEstados()
      ]);
      setAmbientes(ambData);
      setTipos(tiposData);
      setEstados(estadosData);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar ambientes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAmbientes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoAmbiente(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleGuardarAmbiente = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!nuevoAmbiente.nombre.trim()) errs.nombre = 'El nombre del ambiente es obligatorio.';
    if (!nuevoAmbiente.ubicacion.trim()) errs.ubicacion = 'La ubicación física es obligatoria.';
    if (!nuevoAmbiente.capacidad || Number(nuevoAmbiente.capacidad) <= 0) {
      errs.capacidad = 'La capacidad debe ser mayor que 0.';
    }

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    try {
      setGuardando(true);
      setFeedback(null);
      await ambienteApi.registrar({
        nombre: nuevoAmbiente.nombre.trim(),
        tipo: nuevoAmbiente.tipo,
        capacidad: parseInt(nuevoAmbiente.capacidad, 10),
        ubicacion: nuevoAmbiente.ubicacion.trim(),
        estado: nuevoAmbiente.estado
      });

      setFeedback({
        type: 'success',
        title: 'Ambiente Registrado',
        message: `El ambiente "${nuevoAmbiente.nombre}" fue registrado correctamente.`
      });

      setModalNuevoOpen(false);
      setNuevoAmbiente({
        nombre: '',
        tipo: tipos[0] || 'Laboratorio de Cómputo',
        capacidad: 30,
        ubicacion: '',
        estado: 'Disponible'
      });
      cargarAmbientes();
    } catch (err) {
      setFeedback({ type: 'error', title: 'Error al registrar', message: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (id, estadoActual) => {
    const nuevo = estadoActual === 'Disponible' ? 'En Mantenimiento' : 'Disponible';
    try {
      await ambienteApi.cambiarEstado(id, nuevo);
      cargarAmbientes();
      setFeedback({
        type: 'info',
        message: `Estado de ambiente actualizado a "${nuevo}".`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Catálogo de Ambientes Universitarios
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Laboratorios, auditorios y salas institucionales disponibles para reservas.
          </p>
        </div>
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setModalNuevoOpen(true)}>
          Registrar Ambiente
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

      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <svg className="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="text-xs font-medium">Cargando ambientes institucionales...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ambientes.map((amb) => {
            const isDisponible = amb.estado === 'Disponible';
            return (
              <div
                key={amb.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {amb.tipo}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${isDisponible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {amb.estado}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
                    {amb.nombre}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{amb.ubicacion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">Capacidad: {amb.capacidad} personas</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {amb.totalReservas} reservas registradas
                  </span>

                  <button
                    onClick={() => handleCambiarEstado(amb.id, amb.estado)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {isDisponible ? 'Marcar Mantenimiento' : 'Habilitar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registrar Nuevo Ambiente */}
      {modalNuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Registrar Nuevo Ambiente
              </h3>
              <button
                onClick={() => setModalNuevoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarAmbiente} className="space-y-4">
              <TextInput
                label="Nombre del Ambiente"
                name="nombre"
                value={nuevoAmbiente.nombre}
                onChange={handleInputChange}
                placeholder="Ejemplo: Laboratorio Especializado de Robótica"
                error={errores.nombre}
                required
              />

              <SelectInput
                label="Tipo Institucional"
                name="tipo"
                value={nuevoAmbiente.tipo}
                onChange={handleInputChange}
                options={tipos.map(t => ({ value: t, label: t }))}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Capacidad (Personas)"
                  name="capacidad"
                  type="number"
                  value={nuevoAmbiente.capacidad}
                  onChange={handleInputChange}
                  error={errores.capacidad}
                  required
                />

                <SelectInput
                  label="Estado Inicial"
                  name="estado"
                  value={nuevoAmbiente.estado}
                  onChange={handleInputChange}
                  options={estados.map(e => ({ value: e, label: e }))}
                  required
                />
              </div>

              <TextInput
                label="Ubicación Física"
                name="ubicacion"
                value={nuevoAmbiente.ubicacion}
                onChange={handleInputChange}
                placeholder="Ejemplo: Pabellón C - 3er Piso"
                error={errores.ubicacion}
                required
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNuevoOpen(false)}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={guardando}>
                  Guardar Ambiente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
