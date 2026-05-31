import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '@/lib/constants';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/product' },
  { label: 'Tính năng', href: '/features' },
  { label: 'Bảng giá', href: '/pricing' },
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapse, setCollapse] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCollapse(clamp((window.scrollY - 10) / 150));
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const navWidth = `${lerp(1148, 820, collapse)}px`;
  const navHeight = `${lerp(64, 58, collapse)}px`;
  const navPadding = `${lerp(18, 10, collapse)}px`;
  const logoScale = lerp(1, 0.88, collapse);
  const logoWidth = '190px';
  const authOpacity = 1 - collapse;

  const navLinkClass = ({ isActive }) => [
    'relative rounded-full px-4 py-2 text-[15px] font-semibold transition-colors duration-300',
    'after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:origin-center after:rounded-full after:bg-[#6DA6E8] after:transition-transform after:duration-300',
    isActive
      ? 'text-[#173154] after:scale-x-100'
      : 'text-[#173154]/72 hover:text-[#173154] after:scale-x-0 hover:after:scale-x-100',
  ].join(' ');

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-5">
      <div
        className="mx-auto flex items-center justify-between overflow-hidden rounded-full border border-white/90 bg-white shadow-[0_12px_42px_rgba(15,23,42,0.11)] backdrop-blur-2xl transition-[border-color,box-shadow] duration-300"
        style={{
          width: `min(calc(100vw - 40px), ${navWidth})`,
          height: navHeight,
          paddingLeft: navPadding,
          paddingRight: navPadding,
          boxShadow:
            collapse > 0.45
              ? '0 18px 52px rgba(15,23,42,0.14)'
              : '0 12px 42px rgba(15,23,42,0.11)',
        }}
      >
        <Link
          to="/"
          className="flex shrink-0 items-center overflow-hidden transition-[transform,width] duration-500"
          style={{ transform: `scale(${logoScale})`, width: logoWidth }}
          aria-label="Mascoteach Home"
        >
          <img src="/images/Logo.png" alt={SITE.name} className="h-6 w-[190px] max-w-none object-contain md:h-7" />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label="Primary"
          style={{ transform: `translateX(${lerp(0, -10, collapse)}px)` }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} to={item.href} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center md:flex">
          <Link
            to="/signin"
            className="mr-4 inline-flex h-10 items-center justify-center rounded-full px-3 text-[15px] font-semibold text-[#173154]/76 transition-colors duration-300 hover:text-[#6DA6E8]"
            style={{
              opacity: authOpacity,
              transform: `translateX(${lerp(0, 18, collapse)}px)`,
              pointerEvents: collapse > 0.86 ? 'none' : 'auto',
              width: `${lerp(86, 0, collapse)}px`,
            }}
          >
            <span className="whitespace-nowrap">Đăng nhập</span>
          </Link>

          <Link
            to="/register"
            className="grid h-11 place-items-center overflow-hidden rounded-full bg-[#6DA6E8] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(109,166,232,0.3)] transition-colors duration-300 hover:bg-[#4F92DD] active:scale-[0.97]"
            style={{
              width: `${lerp(104, 44, collapse)}px`,
            }}
            aria-label="Đăng ký"
          >
            <span
              className="inline-block overflow-hidden whitespace-nowrap transition-all duration-300"
              style={{
                opacity: 1 - clamp(collapse * 1.6),
                transform: `translateX(${lerp(0, -18, collapse)}px)`,
              width: `${lerp(72, 0, collapse)}px`,
              }}
            >
              Đăng ký
            </span>
            <ArrowUpRight
              className="absolute h-4 w-4 transition-all duration-300"
              style={{
                opacity: clamp((collapse - 0.35) / 0.65),
                transform: `translate(${lerp(24, 0, collapse)}px, ${lerp(10, 0, collapse)}px)`,
              }}
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/register"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#6DA6E8] px-4 text-[15px] font-semibold text-white"
          >
            Đăng ký
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mx-4 mt-3 rounded-3xl border border-white/80 bg-white/94 p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)] backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {[...NAV_ITEMS, { label: 'Đăng nhập', href: '/signin' }].map((item) => {
              const active = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={[
                    'rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors',
                    active ? 'bg-[#EAF4FF] text-[#173154]' : 'text-[#173154]/78 hover:bg-sky-50',
                  ].join(' ')}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
