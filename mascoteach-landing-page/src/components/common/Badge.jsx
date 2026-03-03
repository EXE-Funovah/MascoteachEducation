import { cn } from '@/lib/utils';

const colorMap = {
  sky: 'bg-sky-50 text-sky-700 border-sky-200/60',
  violet: 'bg-violet-50 text-violet-700 border-violet-200/60',
  pink: 'bg-pink-50 text-pink-700 border-pink-200/60',
  teal: 'bg-teal-50 text-teal-700 border-teal-200/60',
  orange: 'bg-orange-50 text-orange-700 border-orange-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  slate: 'bg-slate-100 text-slate-600 border-slate-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
};

export default function Badge({ children, color = 'sky', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full border',
        'tracking-wide uppercase',
        colorMap[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
