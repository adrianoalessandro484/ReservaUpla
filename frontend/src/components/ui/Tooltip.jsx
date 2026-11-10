import { Tooltip as BaseTooltip } from '@base-ui/react';

export default function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delay = 150,
  className = ''
}) {
  if (!content) return children;

  return (
    <BaseTooltip.Provider delay={delay}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger
          render={(props) => (
            <span {...props} className="inline-flex items-center cursor-default">
              {children}
            </span>
          )}
        />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner side={side} align={align} sideOffset={6} className="z-50 pointer-events-none">
            <BaseTooltip.Popup
              className={`px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-sm text-white text-xs font-semibold shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-150 max-w-xs text-center z-50 ${className}`}
            >
              <BaseTooltip.Arrow className="w-2.5 h-2.5 rotate-45 bg-slate-900/95 border-slate-700/80 border-b border-r" />
              <span>{content}</span>
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
