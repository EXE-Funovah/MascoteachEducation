import { useNavigate, useLocation, Link } from 'react-router-dom';
import useScroll from '@/hooks/useScroll';
import { SITE } from '@/lib/constants';
import PillNav from './PillNav';

const SECTION_LINKS = [
  { label: 'Tính năng', hash: '#features' },
  { label: 'Giải pháp', hash: '#showcase' },
  { label: 'Đánh giá', hash: '#testimonials' },
];

export default function Header() {
  const scrolled = useScroll(20);
  const navigate = useNavigate();
  const location = useLocation();

  function handleSectionClick(hash) {
    if (location.pathname === '/') {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/' + hash);
    }
  }

  const navItems = [
    ...SECTION_LINKS.map(link => ({
      label: link.label,
      href: link.hash,
      onClick: () => handleSectionClick(link.hash),
    })),
    { label: 'Bảng giá', href: '/pricing' },
  ];

  const activeHref = location.pathname === '/pricing' ? '/pricing' : undefined;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={[
          'mx-auto max-w-7xl grid grid-cols-[auto_1fr_auto] items-center gap-4',
          'px-4 py-2 rounded-full transition-all duration-500',
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-gamma-card border border-slate-100/80'
            : 'bg-white/40 backdrop-blur-md border border-transparent',
        ].join(' ')}
      >
        {/* ── Left: Logo ── */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/images/Logo.png" alt={SITE.name} className="h-6 object-contain" />
        </Link>

        {/* ── Center: Nav links ── */}
        <div className="flex justify-center">
          <PillNav
            items={navItems}
            activeHref={activeHref}
            baseColor="#1B3A6B"
            pillColor="#f8fafc"
            pillTextColor="#475569"
            hoveredPillTextColor="#ffffff"
            ease="power3.out"
            initialLoadAnimation={false}
          />
        </div>

        {/* ── Right: Auth Buttons (desktop) ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                       text-slate-600 hover:text-brand-navy hover:bg-slate-100/70
                       rounded-full transition-all duration-200"
          >
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                       bg-gradient-to-r from-brand-navy to-brand-blue text-white
                       rounded-full shadow-gamma-btn hover:shadow-gamma-btn-hover
                       hover:brightness-110 transition-all duration-300 active:scale-[0.97]"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}
