import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useScroll from '@/hooks/useScroll';
import Button from '@/components/common/Button';
import { NAV_LINKS, SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Header() {
  const scrolled = useScroll(20);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className={cn(
          'mx-auto max-w-5xl flex items-center justify-between',
          'px-6 py-3 rounded-full transition-all duration-500',
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-gamma-card border border-slate-100'
            : 'bg-white/40 backdrop-blur-md border border-transparent'
        )}
      >
        <a href="#" className="flex items-center">
          <span className="text-lg font-bold text-ink tracking-tight">
            {SITE.name}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors rounded-full hover:bg-slate-100/60"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Đăng nhập
          </Button>
          <Button variant="primary" size="sm">
            Bắt đầu miễn phí
          </Button>
        </div>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="w-5 h-0.5 bg-ink rounded-full block"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-5 h-0.5 bg-ink rounded-full block"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="w-5 h-0.5 bg-ink rounded-full block"
          />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-auto max-w-5xl mt-2 p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-100 shadow-gamma-float"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-base font-medium text-ink-secondary hover:text-ink hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-slate-100 my-2" />
              <Button variant="primary" size="lg" className="w-full mt-2">
                Bắt đầu miễn phí
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
