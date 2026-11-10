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
      border: 'border-blue-200/90 hover:border-blue-400',
      text: 'text-blue-900',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
      badge: 'text-blue-800 bg-blue-100/80 border border-blue-200'
    },
    emerald: {
      border: 'border-emerald-200/90 hover:border-emerald-400',
      text: 'text-emerald-900',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-500/20',
      badge: 'text-emerald-800 bg-emerald-100/80 border border-emerald-200'
    },
    amber: {
      border: 'border-amber-200/90 hover:border-amber-400',
      text: 'text-amber-900',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/20',
      badge: 'text-amber-800 bg-amber-100/80 border border-amber-200'
    },
    red: {
      border: 'border-red-200/90 hover:border-red-400',
      text: 'text-red-900',
      iconBg: 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-red-500/20',
      badge: 'text-red-800 bg-red-100/80 border border-red-200'
    },
    purple: {
      border: 'border-purple-200/90 hover:border-purple-400',
      text: 'text-purple-900',
      iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/20',
      badge: 'text-purple-800 bg-purple-100/80 border border-purple-200'
    },
    indigo: {
      border: 'border-indigo-200/90 hover:border-indigo-400',
      text: 'text-indigo-900',
      iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-indigo-500/20',
      badge: 'text-indigo-800 bg-indigo-100/80 border border-indigo-200'
    }
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border-2 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg ${theme.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
            {title}
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ${theme.iconBg}`}>
            <Icon className="h-7 w-7 stroke-[2.2]" />
          </div>
        )}
      </div>

      {subtitle && (
        <div className="mt-4 flex items-center text-xs font-bold">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${theme.badge}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
