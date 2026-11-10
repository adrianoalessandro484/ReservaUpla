import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  X,
  UserX,
  UserCheck,
  Search,
  ShieldAlert,
  AlertCircle,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import SelectInput from '../components/ui/SelectInput';
import TableList from '../components/ui/TableList';
import AlertMessage from '../components/ui/AlertMessage';
import ModalConfirmacion from '../components/ui/ModalConfirmacion';
import Tooltip from '../components/ui/Tooltip';
import { usuarioService as usuarioApi } from '../service';

export default function UsersPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modal para confirmar deshabilitación / habilitación de usuario
  const [modalToggle, setModalToggle] = useState({
    isOpen: false,
    usuario: null,
    loading: false
  });

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombreCompleto: '',
    codigo: '',
    rol: 'Solicitante'
  });

  const [errores, setErrores] = useState({});

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const res = await usuarioApi.obtenerTodos();
      setUsuarios(res);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error al cargar los usuarios institucionales.' });
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

    if (!nuevoUsuario.codigo.trim()) {
      errs.codigo = 'El código institucional es obligatorio.';
    } else if (!/^[A-Z][0-9]{5}[A-Z]$/.test(nuevoUsuario.codigo.trim())) {
      errs.codigo = 'Formato inválido: 1 letra inicial, 5 números y 1 letra final (Ej. Q01171J).';
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
        codigo: nuevoUsuario.codigo.trim().toUpperCase(),
        rol: nuevoUsuario.rol
      });

      setFeedback({
        type: 'success',
        title: 'Usuario Registrado',
        message: `El usuario "${nuevoUsuario.nombreCompleto}" fue registrado exitosamente con rol ${nuevoUsuario.rol}.`
      });

      setModalNuevoOpen(false);
      setNuevoUsuario({
        nombreCompleto: '',
        codigo: '',
        rol: 'Solicitante'
      });
      cargarUsuarios();
    } catch (err) {
      setFeedback({ type: 'error', title: 'Error al registrar usuario', message: err.message });
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de confirmación para deshabilitar o habilitar
  const handleAbrirConfirmacionToggle = (usuario) => {
    setModalToggle({
      isOpen: true,
      usuario,
      loading: false
    });
  };

  // Confirmar y ejecutar la deshabilitación o reactivación
  const handleConfirmarToggleActivo = async () => {
    const { usuario } = modalToggle;
    if (!usuario) return;

    try {
      setModalToggle(prev => ({ ...prev, loading: true }));
      const res = await usuarioApi.toggleActivo(usuario.id);
      await cargarUsuarios();

      const accionStr = usuario.activo ? 'deshabilitado' : 'reactivado';
      setFeedback({
        type: usuario.activo ? 'warning' : 'success',
        title: `Usuario ${accionStr.toUpperCase()}`,
        message: usuario.activo
          ? `El acceso del usuario "${usuario.nombreCompleto}" ha sido deshabilitado. No podrá iniciar sesión en la intranet hasta que sea rehabilitado.`
          : `El acceso del usuario "${usuario.nombreCompleto}" ha sido reactivado exitosamente.`
      });

      setModalToggle({ isOpen: false, usuario: null, loading: false });
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error al actualizar acceso',
        message: err.message
      });
      setModalToggle(prev => ({ ...prev, loading: false }));
    }
  };

  // Filtrado de usuarios en cliente por búsqueda y rol
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusqueda =
        u.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.codigo && u.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRol = filtroRol === 'Todos' || u.rol === filtroRol;

      return matchBusqueda && matchRol;
    });
  }, [usuarios, searchTerm, filtroRol]);

  const columnas = [
    {
      header: 'Código & Solicitante',
      render: (u) => (
        <div>
          <div className="font-extrabold text-slate-900 text-sm">{u.nombreCompleto}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <Tooltip content="Código institucional oficial">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {u.codigo || 'S/C'}
              </span>
            </Tooltip>
          </div>
        </div>
      )
    },
    {
      header: 'Rol Institucional',
      render: (u) => {
        const config = {
          Administrador: {
            bg: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: ShieldCheck
          },
          'Responsable de ambiente': {
            bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            icon: Building2
          },
          Solicitante: {
            bg: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: GraduationCap
          }
        }[u.rol] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Users };

        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${config.bg}`}>
            <Icon className="h-3.5 w-3.5" />
            <span>{u.rol === 'Solicitante' ? 'Docente' : u.rol}</span>
          </span>
        );
      }
    },
    {
      header: 'Reservas Totales',
      align: 'center',
      render: (u) => (
        <span className="font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
          {u.totalReservas ?? 0}
        </span>
      )
    },
    {
      header: 'Acceso a Intranet',
      align: 'center',
      render: (u) => (
        <Tooltip content={u.activo ? 'Usuario con permiso de ingreso a la intranet' : 'Acceso bloqueado por el administrador'}>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
              u.activo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {u.activo ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Activo</span>
              </>
            ) : (
              <>
                <UserX className="h-3.5 w-3.5 text-red-600" />
                <span>Deshabilitado</span>
              </>
            )}
          </span>
        </Tooltip>
      )
    },
    {
      header: 'Gestión de Acceso',
      align: 'right',
      render: (u) => (
        <Tooltip content={u.activo ? 'Deshabilitar acceso del usuario sin borrar su historial' : 'Reactivar acceso del usuario al sistema'}>
          <Button
            variant={u.activo ? 'outline' : 'primary'}
            size="sm"
            icon={u.activo ? UserX : UserCheck}
            onClick={() => handleAbrirConfirmacionToggle(u)}
            className={
              u.activo
                ? 'text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400 font-bold'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
            }
          >
            {u.activo ? 'Deshabilitar' : 'Habilitar'}
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera institucional del Administrador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            <span>Gestión de Solicitantes y Usuarios Institucionales</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Como Administrador puedes registrar nuevos docentes o solicitantes y gestionar su acceso al sistema de reservas mediante la función de <strong>habilitar o deshabilitar cuenta</strong> sin pérdida de datos históricos.
          </p>
        </div>

        <Button
          variant="primary"
          icon={UserPlus}
          size="md"
          onClick={() => setModalNuevoOpen(true)}
          className="shadow-md"
        >
          Nuevo Usuario
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

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrar por Rol:</span>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="Todos">Todos los Roles</option>
            <option value="Solicitante">Docentes (Solicitantes)</option>
            <option value="Responsable de ambiente">Responsables de Ambiente</option>
            <option value="Administrador">Administradores</option>
          </select>
        </div>
      </div>

      {/* Tabla con listado de usuarios */}
      <TableList
        columns={columnas}
        data={usuariosFiltrados}
        loading={loading}
        emptyMessage="No se encontraron usuarios que coincidan con la búsqueda."
      />

      {/* Modal Confirmación de Deshabilitar / Habilitar Usuario */}
      <ModalConfirmacion
        isOpen={modalToggle.isOpen}
        title={
          modalToggle.usuario?.activo
            ? '¿Deshabilitar acceso del usuario?'
            : '¿Reactivar acceso del usuario?'
        }
        message={
          modalToggle.usuario?.activo
            ? `Estás a punto de deshabilitar el acceso institucional de "${modalToggle.usuario?.nombreCompleto}" (${modalToggle.usuario?.codigo || 'Docente'}). El usuario no podrá iniciar sesión en ReservaUPLA, pero sus reservas históricas se conservarán intactas.`
            : `Estás a punto de reactivar el acceso de "${modalToggle.usuario?.nombreCompleto}". El usuario podrá volver a ingresar y gestionar reservas de ambientes normalmente.`
        }
        confirmText={
          modalToggle.usuario?.activo
            ? 'Sí, deshabilitar acceso'
            : 'Sí, reactivar acceso'
        }
        cancelText="Cancelar"
        variant={modalToggle.usuario?.activo ? 'danger' : 'success'}
        onConfirm={handleConfirmarToggleActivo}
        onCancel={() => setModalToggle({ isOpen: false, usuario: null, loading: false })}
      />

      {/* Modal Registrar Nuevo Usuario */}
      {modalNuevoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span>Registrar Usuario Institucional</span>
              </h3>
              <button
                onClick={() => setModalNuevoOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
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
                placeholder="Ejemplo: Dra. Carmen Morales Vega"
                error={errores.nombreCompleto}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  label="Código Institucional"
                  name="codigo"
                  value={nuevoUsuario.codigo}
                  onChange={(e) => {
                    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    setNuevoUsuario(prev => ({ ...prev, codigo: clean.slice(0, 7) }));
                    if (errores.codigo) setErrores(prev => ({ ...prev, codigo: null }));
                  }}
                  placeholder="Ej. Q01171J"
                  helper="1 letra + 5 números + 1 letra"
                  error={errores.codigo}
                  required
                />

                <SelectInput
                  label="Rol Institucional"
                  name="rol"
                  value={nuevoUsuario.rol}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Solicitante', label: 'Docente (Solicitante)' },
                    { value: 'Responsable de ambiente', label: 'Responsable de Ambiente' },
                    { value: 'Administrador', label: 'Administrador General' }
                  ]}
                  required
                />
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0" />
                  <span>Acceso Institucional Directo:</span>
                </p>
                <p className="text-blue-800">
                  El usuario podrá ingresar de inmediato utilizando su <strong>código institucional</strong> y la contraseña por defecto <code className="font-mono font-bold bg-blue-100/80 px-1 py-0.5 rounded text-blue-900">Upla2026*</code>.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNuevoOpen(false)}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={guardando}>
                  Registrar Usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
