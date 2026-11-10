import { Popover as BasePopover } from '@base-ui/react';
import { Info } from 'lucide-react';

export default function Popover({
  trigger,
  title,
  content,
  children,
  side,
  position = 'top',
  align = 'center',
  className = ''
}) {
  const actualSide = side || position || 'top';

  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        type="button"
        className="text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded-full hover:bg-slate-100 cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-blue-400 inline-flex items-center justify-center"
        aria-label="Ver más información"
      >
        {trigger || <Info className="h-3.5 w-3.5" />}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side={actualSide} align={align} sideOffset={6} className="z-50">
          <BasePopover.Popup className={`w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs border border-slate-700/80 outline-none ${className}`}>
            <BasePopover.Arrow className="w-2.5 h-2.5 rotate-45 bg-slate-900 border-slate-700/80 border-b border-r" />
            {title && (
              <BasePopover.Title className="font-bold text-sky-400 text-[11px] uppercase tracking-wider mb-1">
                {title}
              </BasePopover.Title>
            )}
            <div className="text-slate-200 text-xs leading-relaxed">
              {content || children}
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
