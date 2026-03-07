import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useScroll from '@/hooks/useScroll';
import { SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * NAV_LINKS — anchor links go to LandingPage sections,
 * "Bảng giá" is a real route so it's handled separately (moved to end).
 */
const SECTION_LINKS = [
  { label: 'Tính năng', hash: '#features' },
  { label: 'Giải pháp', hash: '#showcase' },
  { label: 'Đánh giá', hash: '#testimonials' },
];

export default function Header() {
  const scrolled = useScroll(20);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle section link clicks properly for SPA:
   * - If already on "/", just scroll to the section
   * - If on another page (e.g. /pricing), navigate to "/" first then scroll
   */
  function handleSectionClick(hash, closeMobile = false) {
    if (closeMobile) setMobileOpen(false);

    if (location.pathname === '/') {
      // Already on landing page — just scroll
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to landing page with hash
      navigate('/' + hash);
    }
  }

  const linkClass =
    'px-4 py-2 text-[15px] font-medium text-ink-secondary hover:text-ink transition-colors rounded-full hover:bg-slate-100/60 cursor-pointer';

  const mobileLinkClass =
    'px-4 py-3 text-base font-medium text-ink-secondary hover:text-ink hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer';

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
        <Link to="/" className="flex items-center">
          <img src="/images/Logo.png" alt={SITE.name} className="h-6 object-contain" />
        </Link>

        {/* ── Center: Nav Links ── */}
        <div className="hidden md:flex items-center justify-center gap-2">
          {SECTION_LINKS.map((link) => (
            <button
              key={link.hash}
              onClick={() => handleSectionClick(link.hash)}
              className={linkClass}
            >
              {link.label}
            </button>
          ))}
          {/* "Bảng giá" — cuối hàng */}
          <Link to="/pricing" className={linkClass}>
            Bảng giá
          </Link>
        </div>

        {/* ── Right: Auth Buttons (desktop) + Hamburger (mobile) ── */}
        <div className="flex items-center justify-end gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out
                         font-medium whitespace-nowrap select-none cursor-pointer
                         active:scale-[0.97] hover:-translate-y-0.5
                         bg-transparent text-ink-secondary hover:bg-blue-50/60 hover:text-brand-blue
                         px-4 py-2 text-sm rounded-full"
            >
              Đăng nhập
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 transition-all duration-300 ease-out
                         font-medium whitespace-nowrap select-none cursor-pointer
                         active:scale-[0.97] hover:-translate-y-0.5
                         bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-gamma-btn
                         hover:shadow-gamma-btn-hover hover:brightness-110
                         px-4 py-2 text-sm rounded-full"
            >
              Bắt đầu miễn phí
            </Link>
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
              {SECTION_LINKS.map((link) => (
                <button
                  key={link.hash}
                  onClick={() => handleSectionClick(link.hash, true)}
                  className={mobileLinkClass}
                >
                  {link.label}
                </button>
              ))}
              {/* "Bảng giá" cuối hàng */}
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className={mobileLinkClass}
              >
                Bảng giá
              </Link>
              <hr className="border-slate-100 my-2" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-base font-medium text-ink-secondary hover:text-ink hover:bg-slate-50 rounded-2xl transition-colors text-center"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center w-full mt-2 px-8 py-4 text-base rounded-full font-medium
                           bg-gradient-to-r from-brand-navy to-brand-blue text-white shadow-gamma-btn
                           hover:shadow-gamma-btn-hover hover:brightness-110 transition-all duration-300"
              >
                Bắt đầu miễn phí
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
