export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon = null,
  className = ''
}) {
  // Base con diseño centrado en el usuario (DCU): feedback táctil, focus visible y bordes ergonómicos
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-offset-1 select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

  // Tamaños generosos y confortables según recomendaciones WCAG y DCU para evitar botones diminutos
  const sizeClasses = {
    sm: 'text-xs px-4 py-2 min-h-[38px] gap-2 shadow-xs',
    md: 'text-sm px-5 py-2.5 min-h-[46px] gap-2.5 shadow-sm',
    lg: 'text-base px-6 py-3.5 min-h-[52px] gap-3 shadow-md'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white shadow-blue-500/25 focus:ring-blue-500/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300/80 focus:ring-slate-400/30',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 text-white shadow-emerald-500/25 focus:ring-emerald-500/30',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:from-red-800 text-white shadow-red-500/25 focus:ring-red-500/30',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:from-amber-700 text-white shadow-amber-500/25 focus:ring-amber-500/30',
    outline: 'border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 text-slate-700 focus:ring-slate-400/30',
    ghost: 'text-slate-700 hover:bg-slate-100/80 active:bg-slate-200 text-slate-900 focus:ring-slate-400/30'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.primary}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
      )}
      <span>{children}</span>
    </button>
  );
}
