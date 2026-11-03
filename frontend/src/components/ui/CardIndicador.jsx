export default function CardIndicador({
  title,
  value,
  subtitle = '',
  icon: Icon = null,
  color = 'blue', // 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'indigo'
  onClick = null,
  className = ''
}) {
  const colorThemes = {
    blue: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-100',
      text: 'text-blue-900',
      iconBg: 'bg-blue-600 text-white',
      badge: 'text-blue-700 bg-blue-100/60'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-100',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'text-emerald-700 bg-emerald-100/60'
    },
    amber: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-100',
      text: 'text-amber-900',
      iconBg: 'bg-amber-500 text-white',
      badge: 'text-amber-700 bg-amber-100/60'
    },
    red: {
      bg: 'bg-red-50/70',
      border: 'border-red-100',
      text: 'text-red-900',
      iconBg: 'bg-red-600 text-white',
      badge: 'text-red-700 bg-red-100/60'
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-100',
      text: 'text-purple-900',
      iconBg: 'bg-purple-600 text-white',
      badge: 'text-purple-700 bg-purple-100/60'
    },
    indigo: {
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-100',
      text: 'text-indigo-900',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'text-indigo-700 bg-indigo-100/60'
    }
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${theme.border} ${onClick ? 'cursor-pointer hover:border-slate-300' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${theme.iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {subtitle && (
        <div className="mt-3 flex items-center text-xs text-slate-500 font-medium">
          <span className={`inline-block rounded-md px-2 py-0.5 ${theme.badge}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
