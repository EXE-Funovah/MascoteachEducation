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

  /* Extra items shown only in the mobile dropdown */
  const mobileAuthItems = [
    { label: 'Đăng nhập', href: '/login' },
    { label: 'Bắt đầu miễn phí', href: '/signup' },
  ];

  const activeHref = location.pathname === '/pricing' ? '/pricing' : undefined;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={[
          'mx-auto max-w-7xl flex items-center justify-between gap-3',
          'px-4 py-2 rounded-full transition-all duration-500',
          scrolled
            ? 'bg-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10'
            : 'bg-black/20 backdrop-blur-md border border-white/10',
        ].join(' ')}
      >
        {/* ── Left: Logo ── */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/images/Logo.png" alt={SITE.name} className="h-6 object-contain brightness-0 invert" />
        </Link>

        {/* ── Center: Nav links ── */}
        <div className="flex justify-end md:justify-center flex-1 min-w-0">
          <PillNav
            items={navItems}
            activeHref={activeHref}
            mobileExtraItems={mobileAuthItems}
            baseColor="#ffffff"
            pillColor="rgba(255,255,255,0.15)"
            pillTextColor="rgba(255,255,255,0.95)"
            hoveredPillTextColor="#0F172A"
            ease="power3.out"
            initialLoadAnimation={false}
          />
        </div>

        {/* ── Right: Auth Buttons (desktop only — mobile uses hamburger menu) ── */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                       text-white/70 hover:text-white hover:bg-white/10
                       rounded-full transition-all duration-200"
          >
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium
                       bg-white text-brand-navy
                       rounded-full hover:bg-white/90
                       transition-all duration-300 active:scale-[0.97]"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}
