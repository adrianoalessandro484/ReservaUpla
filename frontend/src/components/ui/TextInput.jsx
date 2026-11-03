export default function TextInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  icon: Icon = null,
  className = ''
}) {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border bg-white py-2.5 text-sm transition-all outline-none
            ${Icon ? 'pl-9 pr-3' : 'px-3.5'}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-900' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900'}
            ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
