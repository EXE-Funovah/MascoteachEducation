import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
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
          'mx-auto max-w-7xl grid grid-cols-[auto_1fr_auto] items-center',
          'px-10 py-3.5 rounded-full transition-all duration-500',
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-gamma-card border border-slate-100/80'
            : 'bg-white/40 backdrop-blur-md border border-transparent',
        )}
        aria-label="Main navigation"
      >
        {/* ── Left: Logo ── */}
        <a href="/" className="flex items-center">
          <img src="/images/Logo.png" alt={SITE.name} className="h-6 object-contain" />
        </a>

        {/* ── Center: Nav Links ── */}
        <div className="hidden md:flex items-center justify-center gap-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-[15px] font-medium text-ink-secondary hover:text-ink transition-colors rounded-full hover:bg-slate-100/60"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ── Right: Auth Buttons (desktop) + Hamburger (mobile) ── */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" href="/login">
              Đăng nhập
            </Button>
            <Button variant="primary" size="sm" href="/signup">
              Bắt đầu miễn phí
            </Button>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
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
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-auto max-w-6xl mt-2 p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-100/80 shadow-gamma-float"
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
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-base font-medium text-ink-secondary hover:text-ink hover:bg-slate-50 rounded-2xl transition-colors text-center"
              >
                Đăng nhập
              </Link>
              <Button variant="primary" size="lg" className="w-full mt-2" href="/signup">
                Bắt đầu miễn phí
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
