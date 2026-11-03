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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 select-none cursor-pointer';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200 focus:ring-slate-400 disabled:opacity-50',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm focus:ring-emerald-500 disabled:bg-emerald-300',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500 disabled:bg-red-300',
    warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm focus:ring-amber-400 disabled:bg-amber-300',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400 disabled:opacity-50',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 disabled:opacity-50'
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
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : ''}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      <span>{children}</span>
    </button>
  );
}
