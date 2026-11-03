import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function AlertMessage({
  type = 'info', // 'success' | 'error' | 'warning' | 'info'
  title = '',
  message = '',
  onClose = null,
  className = ''
}) {
  if (!message && !title) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      closeColor: 'text-emerald-700 hover:bg-emerald-100'
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      closeColor: 'text-red-700 hover:bg-red-100'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      closeColor: 'text-amber-700 hover:bg-amber-100'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
      closeColor: 'text-blue-700 hover:bg-blue-100'
    }
  };

  const current = styles[type] || styles.info;
  const IconComponent = current.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${current.bg} ${className}`}>
      <IconComponent className={`h-5 w-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        {message && <div className="leading-relaxed opacity-95">{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className={`shrink-0 p-1 rounded-md transition-colors ${current.closeColor}`}
          aria-label="Cerrar alerta"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
