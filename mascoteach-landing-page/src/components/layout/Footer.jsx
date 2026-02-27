import { SITE, FOOTER } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold text-ink tracking-tight mb-4">{SITE.name}</p>
            <p className="text-sm text-ink-muted leading-relaxed max-w-[240px]">
              {SITE.description}
            </p>
            <div className="flex gap-3 mt-6">
              {['Facebook', 'YouTube', 'LinkedIn'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-ink-muted hover:bg-slate-200 hover:text-ink transition-colors text-xs font-medium"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink mb-4 tracking-wide">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-muted hover:text-ink transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">{FOOTER.copyright}</p>
          <div className="flex gap-6 text-sm text-ink-muted">
            <a href="#" className="hover:text-ink transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-ink transition-colors">
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
