import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-gamma-btn hover:shadow-gamma-btn-hover hover:brightness-110',
  secondary:
    'bg-white text-ink border border-slate-200 hover:border-brand-mid hover:bg-blue-50/40 shadow-gamma-soft hover:shadow-gamma-card',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-blue-50/60 hover:text-brand-blue',
  outline:
    'bg-transparent border-2 border-brand-blue text-brand-blue hover:bg-brand-blue/5',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-6 py-3 text-sm rounded-full',
  lg: 'px-8 py-4 text-base rounded-full font-medium',
  xl: 'px-10 py-5 text-lg rounded-full font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  href,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out',
    'font-medium whitespace-nowrap select-none cursor-pointer',
    'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40',
    'hover:-translate-y-0.5',
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
