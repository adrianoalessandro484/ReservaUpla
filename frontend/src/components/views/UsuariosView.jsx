import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, CheckCircle2, XCircle, X } from 'lucide-react';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import SelectInput from '../ui/SelectInput';
import TableList from '../ui/TableList';
import AlertMessage from '../ui/AlertMessage';
import { usuarioApi } from '../../api/client';

export default function UsuariosView({ onNavigate, currentActor }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombreCompleto: '',
    correo: '',
    rol: 'Solicitante'
  });

  const [errores, setErrores] = useState({});

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await usuarioApi.obtenerTodos();
      setUsuarios(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar los usuarios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!nuevoUsuario.nombreCompleto.trim()) {
      errs.nombreCompleto = 'El nombre completo es obligatorio.';
    } else if (nuevoUsuario.nombreCompleto.trim().length < 3) {
      errs.nombreCompleto = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!nuevoUsuario.correo.trim()) {
      errs.correo = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.correo)) {
      errs.correo = 'Ingrese un correo electrónico válido.';
    }

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    try {
      setGuardando(true);
      setFeedback(null);
      await usuarioApi.registrar({
        nombreCompleto: nuevoUsuario.nombreCompleto.trim(),
        correo: nuevoUsuario.correo.trim(),
        rol: nuevoUsuario.rol
      });

      setFeedback({
        type: 'success',
        title: 'Usuario Registrado (RF-01)',
        message: `El usuario "${nuevoUsuario.nombreCompleto}" fue registrado exitosamente con rol ${nuevoUsuario.rol}.`
      });

      setModalNuevoOpen(false);
      setNuevoUsuario({
        nombreCompleto: '',
        correo: '',
        rol: 'Solicitante'
      });
      cargarUsuarios();
    } catch (err) {
      setFeedback({ type: 'error', title: 'Error al registrar usuario', message: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      const res = await usuarioApi.toggleActivo(id);
      cargarUsuarios();
      setFeedback({
        type: 'info',
        message: res.mensaje || 'Estado de usuario actualizado.'
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const columnas = [
    {
      header: 'Nombre Completo',
      render: (u) => (
        <div className="font-semibold text-slate-900">{u.nombreCompleto}</div>
      )
    },
    {
      header: 'Correo Institucional',
      render: (u) => (
        <span className="text-slate-600 font-mono text-xs">{u.correo}</span>
      )
    },
    {
      header: 'Rol Institucional',
      render: (u) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          u.rol === 'Administrador'
            ? 'bg-purple-100 text-purple-800'
            : u.rol === 'Responsable de ambiente'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {u.rol}
        </span>
      )
    },
    {
      header: 'Reservas',
      align: 'center',
      render: (u) => (
        <span className="font-bold text-slate-700">{u.totalReservas}</span>
      )
    },
    {
      header: 'Estado',
      align: 'center',
      render: (u) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
          u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {u.activo ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acción',
      align: 'right',
      render: (u) => (
        <button
          onClick={() => handleToggleActivo(u.id)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          {u.activo ? 'Desactivar' : 'Activar'}
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestión de Usuarios y Solicitantes (RF-01)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Administre solicitantes, administradores y responsables de ambiente institucional.
          </p>
        </div>
        <Button variant="primary" icon={UserPlus} size="sm" onClick={() => setModalNuevoOpen(true)}>
          Registrar Solicitante (RF-01)
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

      <TableList
        columns={columnas}
        data={usuarios}
        loading={loading}
        emptyMessage="No se encontraron usuarios registrados."
      />

      {/* Modal Nuevo Usuario (RF-01) */}
      {modalNuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Registrar Solicitante / Usuario (RF-01)
              </h3>
              <button
                onClick={() => setModalNuevoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarUsuario} className="space-y-4">
              <TextInput
                label="Nombre Completo"
                name="nombreCompleto"
                value={nuevoUsuario.nombreCompleto}
                onChange={handleInputChange}
                placeholder="Ejemplo: Ing. Roberto Sánchez Morales"
                error={errores.nombreCompleto}
                required
              />

              <TextInput
                label="Correo Electrónico Institucional"
                name="correo"
                type="email"
                value={nuevoUsuario.correo}
                onChange={handleInputChange}
                placeholder="rsanchez@upla.edu.pe"
                error={errores.correo}
                required
              />

              <SelectInput
                label="Rol Institucional"
                name="rol"
                value={nuevoUsuario.rol}
                onChange={handleInputChange}
                options={[
                  { value: 'Solicitante', label: 'Solicitante (Registra solicitudes de reserva)' },
                  { value: 'Administrador', label: 'Administrador (Aprueba o rechaza reservas)' },
                  { value: 'Responsable de ambiente', label: 'Responsable de ambiente (Consulta uso asignado)' }
                ]}
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
                  Guardar Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
