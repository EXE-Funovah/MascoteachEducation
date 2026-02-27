import { cn } from '@/lib/utils';

export default function Card({
  children,
  className,
  hover = true,
  padding = 'p-8',
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-4xl border border-slate-100',
        'shadow-gamma-card',
        hover && 'transition-all duration-300 ease-out hover:shadow-gamma-hover hover:border-slate-200 hover:-translate-y-1',
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
