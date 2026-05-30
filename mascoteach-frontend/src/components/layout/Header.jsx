import { useNavigate, useLocation, Link } from 'react-router-dom';
import useScroll from '@/hooks/useScroll';
import { SITE } from '@/lib/constants';
import PillNav from './PillNav';

const SECTION_LINKS = [
  { label: 'Insight', hash: '#showcase' },
  { label: 'Đối tượng', hash: '#targeting' },
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

  const mobileAuthItems = [
    { label: 'Đăng nhập', href: '/login' },
    { label: 'Bắt đầu miễn phí', href: '/signup' },
  ];

  const activeHref = location.pathname === '/pricing' ? '/pricing' : undefined;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:pt-5">
      <div
        className={[
          'mx-auto max-w-7xl flex items-center justify-between gap-4',
          'px-5 py-3 rounded-full transition-all duration-500 md:px-6 md:py-3.5',
          scrolled
            ? 'bg-[#FFFDF7]/92 backdrop-blur-xl shadow-[0_12px_34px_rgba(74,46,31,0.14)] border border-[#EAD8C2]'
            : 'bg-[#FFFDF7]/78 backdrop-blur-md border border-[#EAD8C2]/80 shadow-[0_10px_28px_rgba(74,46,31,0.08)]',
        ].join(' ')}
      >
        <Link to="/" className="flex items-center shrink-0">
          <img src="/images/Logo.png" alt={SITE.name} className="h-7 object-contain md:h-8" />
        </Link>

        <div className="flex justify-end md:justify-center flex-1 min-w-0">
          <PillNav
            items={navItems}
            activeHref={activeHref}
            mobileExtraItems={mobileAuthItems}
            baseColor="#4A2E1F"
            pillColor="rgba(255, 248, 234, 0.84)"
            pillTextColor="#4A2E1F"
            hoveredPillTextColor="#FFF8EA"
            ease="power3.out"
            initialLoadAnimation={false}
          />
        </div>

        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-semibold text-[#6F6258] hover:text-[#4A2E1F] hover:bg-[#FFE1B8]/45 rounded-full transition-all duration-200"
          >
            Đăng nhập
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-5 py-2.5 text-[15px] font-bold bg-[#4A2E1F] text-[#FFF8EA] rounded-full hover:bg-[#5B3826] transition-all duration-300 active:scale-[0.97]"
          >
            Bắt đầu miễn phí
          </Link>
        </div>
      </div>
    </header>
  );
}
