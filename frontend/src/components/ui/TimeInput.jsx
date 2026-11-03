export default function TimeInput({
  label,
  id,
  name,
  value,
  onChange,
  min = '07:00',
  max = '22:00',
  step = '900', // 15 minutos por defecto
  error = '',
  helperText = '',
  required = false,
  disabled = false,
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
      <input
        id={inputId}
        name={name}
        type="time"
        value={value ?? ''}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all outline-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-red-900' : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900'}
          ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''}`}
      />
      {error ? (
        <p className="text-xs text-red-600 flex items-center gap-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
