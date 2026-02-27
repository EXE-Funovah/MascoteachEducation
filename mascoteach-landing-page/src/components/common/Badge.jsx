import { cn } from '@/lib/utils';

const colorMap = {
  sky: 'bg-sky-50 text-sky-600 border-sky-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  pink: 'bg-pink-50 text-pink-600 border-pink-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function Badge({ children, color = 'sky', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border',
        'tracking-wide uppercase',
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}
