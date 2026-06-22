import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SITE, FOOTER } from '@/lib/constants';

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.footer
      className="bg-surface border-t border-slate-100/80"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="/images/Logo.webp" alt={SITE.name} className="h-7 object-contain" />
            </Link>
            <p className="max-w-[260px] text-[15px] leading-7 text-ink-muted md:text-base">
              {SITE.description}
            </p>
            <div className="flex gap-3 mt-6">
              {['Facebook', 'YouTube', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center text-ink-muted hover:bg-blue-50 hover:text-brand-blue hover:border-blue-200 transition-all duration-300 text-xs font-medium shadow-sm"
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

        <div className="mt-16 pt-8 border-t border-slate-100/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[15px] text-ink-muted md:text-base">{FOOTER.copyright}</p>
          <div className="flex gap-6 text-[15px] text-ink-muted md:text-base">
            <a href="#" className="hover:text-brand-blue transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-brand-blue transition-colors">
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
