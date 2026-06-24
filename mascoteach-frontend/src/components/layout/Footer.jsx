import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SITE, FOOTER } from '@/lib/constants';

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.footer
      className="border-t border-slate-100/80 bg-surface"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="/images/Logo.webp" alt={SITE.name} className="h-7 object-contain" />
            </Link>
            <p className="max-w-[260px] text-[15px] leading-7 text-ink-muted md:text-base">
              {SITE.description}
            </p>
            <div className="mt-6 flex gap-3">
              {['Facebook', 'YouTube', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-100 bg-white text-xs font-medium text-ink-muted shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-brand-blue"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {FOOTER.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="mb-4 text-base font-semibold tracking-wide text-ink">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[15px] text-ink-muted transition-colors hover:text-brand-blue md:text-base"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-100/80 pt-8 md:flex-row">
          <p className="text-[15px] text-ink-muted md:text-base">{FOOTER.copyright}</p>
          <div className="flex gap-6 text-[15px] text-ink-muted md:text-base">
            <Link to="/privacy" className="transition-colors hover:text-brand-blue">
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="transition-colors hover:text-brand-blue">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
