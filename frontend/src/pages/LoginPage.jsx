import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  HelpCircle,
  X,
  LogIn,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Mail,
  Info,
  Sparkles,
  Building2,
  Laptop,
  ShieldCheck
} from 'lucide-react';
import { Dialog as BaseDialog } from '@base-ui/react';
import { useAuth } from '../context/AuthContext';
import Popover from '../components/ui/Popover';
import logoUpla from '../assets/logo-upla-blanco.png';
import ambientesUpla from '../assets/ambientes-upla.jpg';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estado del formulario
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de interfaz y feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Cargar código recordado previamente (Heurística 6 y 7 / DCU)
  useEffect(() => {
    const saved = localStorage.getItem('reserva_upla_remembered_code');
    if (saved) {
      setCodigo(saved);
      setRememberMe(true);
    }
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/inicio';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Detección de Bloq Mayús (Caps Lock)
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  // Manejador del Código Institucional: convierte a mayúscula, solo letras y números, max 10 caracteres
  const handleCodigoChange = (e) => {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCodigo(clean.slice(0, 10));
    if (errorMessage) setErrorMessage('');
  };

  const handleCodigoKeyDown = (e) => {
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Tab' ||
      e.key === 'Enter' ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const isCodigoLengthComplete = codigo.length >= 4;
  const isCodigoFormatValid = /^[A-Z0-9]{4,10}$/.test(codigo);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedCodigo = codigo.trim();

    if (!trimmedCodigo) {
      setErrorMessage('Por favor, ingresa tu código institucional.');
      return;
    }

    if (trimmedCodigo.length < 4 || trimmedCodigo.length > 10) {
      setErrorMessage(`El código institucional debe contener entre 4 y 10 caracteres (Ej. ADM0001, DOC2024, Q01171J).`);
      return;
    }

    const codigoRegex = /^[A-Z0-9]{4,10}$/;
    if (!codigoRegex.test(trimmedCodigo)) {
      setErrorMessage('El código debe contener únicamente letras y números (Ej. ADM0001, DOC2024, Q01171J).');
      return;
    }

    if (!contrasena) {
      setErrorMessage('Por favor, ingresa tu contraseña institucional.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(trimmedCodigo, contrasena, rememberMe);
      setSuccessMessage(`¡Bienvenido(a), ${user.nombreCompleto}! Accediendo al sistema...`);

      setTimeout(() => {
        let dest = '/dashboard';
        if (user.rol === 'Responsable de ambiente' || user.rol === 'Solicitante') {
          dest = '/agenda';
        }
        const origin = location.state?.from?.pathname || dest;
        navigate(origin, { replace: true });
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'Credenciales incorrectas. Verifica tu código institucional y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-stretch font-sans text-slate-800 relative">
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        {/* PANEL IZQUIERDO */}
        <div className="lg:w-7/12 relative p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white overflow-hidden bg-blue-950">
          <img
            src={ambientesUpla}
            alt="Ambientes Universitarios UPLA"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-105"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-950/85 to-blue-950/80 backdrop-blur-[2px]"></div>

          <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-blue-600 border border-blue-400/30 backdrop-blur-md shadow-xl shadow-blue-950/40 flex items-center justify-center shrink-0">
                <img
                  src={logoUpla}
                  alt="Logo Universidad Peruana Los Andes"
                  className="h-14 sm:h-16 w-auto object-contain drop-shadow-md"
                />
              </div>

              <div>
                <span className="text-base sm:text-lg font-black tracking-wide text-white uppercase block leading-tight drop-shadow-sm">
                  Universidad Peruana Los Andes
                </span>
                <span className="text-sm font-semibold text-sky-300 block mt-0.5">
                  Oficina de Informática y Sistemas
                </span>
                <span className="text-xs text-slate-200 block mt-0.5 font-medium">
                  Huancayo • Chanchamayo
                </span>
              </div>
            </div>

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-300/40 text-sky-200 text-xs font-bold mb-4 backdrop-blur-md shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Plataforma Institucional de Gestión</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
                ReservaUPLA
              </h1>

              <p className="mt-2 text-lg sm:text-xl font-bold text-sky-200 drop-shadow-sm">
                Sistema de Reserva de Ambientes Universitarios
              </p>

              <p className="mt-4 text-base sm:text-lg text-slate-100 leading-relaxed font-normal drop-shadow-sm">
                Plataforma digital para la programación, verificación de disponibilidad en tiempo real y asignación de laboratorios, auditorios y salas académicas.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 max-w-2xl">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-sky-500/30 text-sky-200">
                  <Laptop className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider bg-sky-950/50 px-2 py-0.5 rounded-md">
                  Cómputo
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">Laboratorios</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Control de capacidad, proyectores y estaciones para clases prácticas.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/30 text-emerald-200">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  Eventos
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">Auditorios</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Asignación para conferencias, asambleas de facultad y sustentaciones.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/15 transition-all shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-amber-500/30 text-amber-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider bg-amber-950/50 px-2 py-0.5 rounded-md">
                  En Vivo
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">Sin Cruces</h3>
              <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
                Validación automática de turnos para prevenir solapamientos.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white">Servicios de Reserva en Línea</span>
              <span className="text-slate-300">• Exclusivo para personal docente y administrativo</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="lg:w-5/12 bg-white flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 shadow-2xl relative">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-normal">
                Ingresa tus credenciales institucionales para acceder a la gestión de ambientes.
              </p>
            </div>

            {(errorMessage || successMessage) && (
              <div className="mb-3">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between gap-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                      <span className="font-semibold">{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('')}
                      className="text-red-400 hover:text-red-700 cursor-pointer p-0.5"
                      title="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{successMessage}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="codigo-input" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Código Institucional</span>
                    <span className="text-red-500 font-bold" aria-hidden="true">*</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${
                        isCodigoLengthComplete && isCodigoFormatValid
                          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                          : codigo.length > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      title="Longitud del código institucional"
                    >
                      {codigo.length}/10
                    </span>

                    <Popover
                      title="Código Institucional"
                      position="top"
                      content={
                        <div>
                          <p className="mb-1 font-semibold text-slate-100">Cuentas Institucionales:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-200">
                            <li><strong>Admin:</strong> <code className="text-sky-300 font-mono">ADM0001</code></li>
                            <li><strong>Docente:</strong> <code className="text-sky-300 font-mono">DOC2024</code></li>
                            <li><strong>Responsable:</strong> <code className="text-sky-300 font-mono">Q01171J</code></li>
                          </ul>
                          <p className="mt-2 text-xs text-slate-300">
                            Contraseña oficial: <code className="text-amber-300 font-bold font-mono">Upla2026*</code>
                          </p>
                        </div>
                      }
                    />
                  </div>
                </div>

                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-blue-600">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="codigo-input"
                    type="text"
                    value={codigo}
                    onChange={handleCodigoChange}
                    onKeyDown={handleCodigoKeyDown}
                    maxLength={10}
                    placeholder="Ej. ADM0001, DOC2024, Q01171J"
                    autoComplete="username"
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={codigo.length > 0 && !isCodigoFormatValid}
                    aria-describedby="codigo-guide"
                    className={`block w-full rounded-xl border-2 bg-white py-3 pl-11 pr-10 text-sm font-bold font-mono tracking-wider uppercase text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal outline-none transition-all ${
                      isCodigoLengthComplete && isCodigoFormatValid
                        ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'
                        : codigo.length > 0 && !isCodigoFormatValid
                        ? 'border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />
                  {codigo && (
                    <button
                      type="button"
                      onClick={() => setCodigo('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Borrar texto"
                      aria-label="Borrar código ingresado"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div id="codigo-guide" className="min-h-[20px] mt-1.5 text-xs font-medium flex items-center gap-1.5">
                  {codigo.length === 0 ? (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>Ingresa tu código oficial (Ej. ADM0001, DOC2024, Q01171J).</span>
                    </span>
                  ) : isCodigoLengthComplete && isCodigoFormatValid ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold animate-fadeIn">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Formato de código válido ({codigo}).</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>Ingresando código institucional...</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password-input" className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Contraseña</span>
                    <span className="text-red-500 font-bold" aria-hidden="true">*</span>
                  </label>

                  <Popover
                    title="Seguridad de Acceso"
                    position="top"
                    content={
                      <div>
                        <p>Ingresa tu clave de acceso institucional.</p>
                        <p className="mt-1 text-[11px] text-slate-300">
                          Si eres personal nuevo, tu contraseña inicial es tu clave asignada.
                        </p>
                      </div>
                    }
                  />
                </div>

                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-blue-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => {
                      setContrasena(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    disabled={loading}
                    aria-required="true"
                    className="block w-full rounded-xl border-2 border-slate-200 bg-white py-3 pl-11 pr-16 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />

                  {capsLockActive && (
                    <span
                      className="absolute right-11 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 shadow-xs flex items-center gap-1"
                      title="Bloq Mayús activado - La contraseña distingue mayúsculas"
                    >
                      <AlertCircle className="h-3 w-3 text-amber-700" />
                      <span>MAYÚS</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1 font-medium">
                  <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span>Tu clave institucional asignada para el acceso a ambientes.</span>
                </p>
              </div>

              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    Recordar código en este equipo
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:from-blue-800 text-white font-extrabold text-base shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 outline-none focus:ring-4 focus:ring-blue-500/30"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-blue-50"
              >
                <HelpCircle className="h-4 w-4" />
                <span>¿Necesitas ayuda?</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <BaseDialog.Root open={showHelpModal} onOpenChange={setShowHelpModal}>
        <BaseDialog.Portal>
          <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs animate-fadeIn" />
          <BaseDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl max-w-lg w-[calc(100%-2rem)] p-6 sm:p-7 shadow-2xl border border-slate-100 outline-none">
            <BaseDialog.Close
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Cerrar ventana de ayuda"
            >
              <X className="h-5 w-5" />
            </BaseDialog.Close>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="h-11 w-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <BaseDialog.Title className="text-base sm:text-lg font-bold text-slate-900 m-0">
                  Mesa de Ayuda — ReservaUPLA
                </BaseDialog.Title>
                <BaseDialog.Description className="text-xs text-slate-500 m-0 mt-0.5">
                  Oficina de Informática y Sistemas
                </BaseDialog.Description>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800 mb-1">
                  Acceso para Docentes y Personal Académico:
                </p>
                <p className="leading-relaxed">
                  Ingresa con tu código institucional oficial de 7 caracteres (Ej. <code className="font-bold text-blue-700 font-mono">Q01171J</code>). Si necesitas asistencia técnica con tus credenciales o clave institucional, comunícate con nosotros.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-800 mb-1">
                  Responsables de Ambiente y Administradores:
                </p>
                <p className="leading-relaxed">
                  Para alta de nuevos laboratorios, auditorios o configuración de cupos de reserva, comunícate directamente con la Jefatura de Infraestructura.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Canales Oficiales — Oficina de Informática y Sistemas:
                </span>
                
                <a
                  href="https://wa.me/51964256145?text=Hola,%20necesito%20asistencia%20con%20el%20acceso%20a%20ReservaUPLA"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <PhoneCall className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp de Soporte: <strong>964256145</strong></span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Atención Inmediata
                  </span>
                </a>

                <a
                  href="mailto:soporte.reservas@upla.edu.pe?subject=Soporte%20Acceso%20ReservaUPLA"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700 hover:text-blue-800 transition-all cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Correo Institucional: <strong>soporte.reservas@upla.edu.pe</strong></span>
                </a>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <BaseDialog.Close className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs">
                Entendido
              </BaseDialog.Close>
            </div>
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      </BaseDialog.Root>
    </div>
  );
}
