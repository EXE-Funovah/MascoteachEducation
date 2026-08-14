import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, CreditCard, Crown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isPremiumActive } from '@/lib/billingUi';
import { SITE } from '@/lib/constants';

const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Cách hoạt động', href: '/#how-it-works' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Dành cho ai', href: '/#targeting' },
  { label: 'Bảng giá', href: '/pricing' },
];

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const lerp = (from, to, progress) => from + (to - from) * progress;

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, loading, logout } = useAuth();
  const accountMenuRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [collapse, setCollapse] = useState(0);
  const shouldReduceMotion = useReducedMotion();

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

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountOpen) return undefined;

    function handlePointerDown(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  const navWidth = `${lerp(1148, 820, collapse)}px`;
  const navHeight = `${lerp(64, 58, collapse)}px`;
  const navPadding = `${lerp(18, 10, collapse)}px`;
  const logoScale = lerp(1, 0.88, collapse);
  const logoWidth = '190px';
  const authOpacity = 1 - collapse;
  const userRole = (user?.role || user?.roleName || '').toLowerCase();
  const isTeacher = userRole === 'teacher';
  const isPremiumTeacher = isTeacher && isPremiumActive(user);
  const portalPath = userRole === 'student' ? '/student' : userRole === 'parent' ? '/parent' : '/teacher';
  const profilePath = `${portalPath}/profile`;
  const checkoutBackState = { checkoutBackTo: `${location.pathname}${location.search}${location.hash}` };
  const displayName = user?.fullName || user?.email || 'Tài khoản';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'M';

  const isNavItemActive = (href) => {
    if (href === '/') return location.pathname === '/' && !location.hash;
    if (href.startsWith('/#')) return location.pathname === '/' && location.hash === href.slice(1);
    return location.pathname === href;
  };

  const handleSectionNavigation = (event, href) => {
    if (!href.startsWith('/#') || location.pathname !== '/') return;

    event.preventDefault();
    navigate(href);
    document.getElementById(href.slice(2))?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const navLinkClass = ({ isActive }) => [
    'relative rounded-full px-4 py-2 text-[15px] font-semibold transition-colors duration-300',
    'after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:origin-center after:rounded-full after:bg-[#6DA6E8] after:transition-transform after:duration-300',
    isActive
      ? 'text-[#173154] after:scale-x-100'
      : 'text-[#173154]/72 hover:text-[#173154] after:scale-x-0 hover:after:scale-x-100',
  ].join(' ');

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 px-4 pt-5"
      initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="mx-auto flex items-center justify-between overflow-visible rounded-full border border-white/90 bg-white shadow-[0_12px_42px_rgba(15,23,42,0.11)] backdrop-blur-2xl transition-[border-color,box-shadow] duration-300"
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
          <img src="/images/Logo_Redesign_Text.webp" alt={SITE.name} className="h-6 w-[190px] max-w-none object-contain md:h-7" />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center gap-1 md:flex"
          aria-label="Primary"
          style={{ transform: `translateX(${lerp(0, -10, collapse)}px)` }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={navLinkClass({ isActive: isNavItemActive(item.href) })}
              onClick={(event) => handleSectionNavigation(event, item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center md:flex">
          {!loading && isLoggedIn ? (
            <div ref={accountMenuRef} className="relative">
              <button
                type="button"
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-[#D8E5F2] bg-[#F7FBFF] py-1 pl-1 pr-3 text-[#173154] shadow-[0_10px_24px_rgba(23,49,84,0.10)] transition duration-300 hover:border-[#BFD8FA] hover:bg-white hover:shadow-[0_16px_36px_rgba(23,49,84,0.15)] active:scale-[0.98]"
                aria-label="Mở menu tài khoản"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#173154] text-sm font-black text-white shadow-[0_8px_18px_rgba(23,49,84,0.24)]">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${displayName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[#64748B] transition duration-300 group-hover:text-[#173154] ${accountOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2.4}
                />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    className="absolute right-0 top-[calc(100%+14px)] w-[332px] overflow-hidden rounded-[22px] border border-[#DDE7F1] bg-white text-left shadow-[0_28px_76px_rgba(15,23,42,0.18)]"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.96, filter: 'blur(6px)' }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98, filter: 'blur(4px)' }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-center gap-4 border-b border-[#EEF2F6] bg-[#F8FBFE] px-5 py-5">
                      <div className="relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full bg-[#173154] text-lg font-black text-white shadow-[0_14px_30px_rgba(23,49,84,0.22)]">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={`${displayName} avatar`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          avatarInitial
                        )}
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#22C55E]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-black leading-tight text-[#173154]">{displayName}</p>
                        {user?.email && <p className="mt-1 truncate text-sm font-semibold text-[#64748B]">{user.email}</p>}
                        {isPremiumTeacher && (
                          <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-700">
                            Đang dùng Pro
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <HeaderMenuLink to={portalPath} icon={LayoutDashboard} label="Trang quản lý" />
                      <HeaderMenuLink to={profilePath} icon={User} label="Hồ sơ cá nhân" />
                      {isTeacher && <HeaderMenuLink to="/teacher/billing" icon={CreditCard} label="Thanh toán" />}
                      {isTeacher && !isPremiumTeacher && <HeaderMenuLink to="/checkout?plan=yearly" state={checkoutBackState} icon={Crown} label="Nâng cấp Pro" />}
                    </div>

                    <div className="border-t border-[#EEF2F6] p-3">
                      <button
                        type="button"
                        className="flex min-h-12 w-full items-center gap-3 rounded-[14px] px-4 text-left text-sm font-black text-rose-600 transition duration-200 hover:bg-rose-50 active:translate-y-px"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5" strokeWidth={2.2} />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          {!loading && isLoggedIn ? (
            <Link
              to={portalPath}
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#6DA6E8] px-4 text-[15px] font-semibold text-white"
            >
              Quản lý
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full bg-[#6DA6E8] px-4 text-[15px] font-semibold text-white"
            >
              Đăng ký
            </Link>
          )}
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
            {[
              ...NAV_ITEMS,
              ...(!loading && isLoggedIn
                ? [
                    { label: 'Trang quản lý', href: portalPath },
                    ...(isTeacher ? [{ label: 'Thanh toán', href: '/teacher/billing' }] : []),
                  ]
                : [{ label: 'Đăng nhập', href: '/signin' }]),
            ].map((item) => {
              const active = isNavItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={[
                    'rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors',
                    active ? 'bg-[#EAF4FF] text-[#173154]' : 'text-[#173154]/78 hover:bg-sky-50',
                  ].join(' ')}
                  onClick={(event) => {
                    handleSectionNavigation(event, item.href);
                    setMobileOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            {!loading && isLoggedIn && (
              <button
                type="button"
                className="rounded-2xl px-4 py-3.5 text-left text-base font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                onClick={logout}
              >
                Đăng xuất
              </button>
            )}
          </nav>
        </div>
      )}
    </motion.header>
  );
}

function HeaderMenuLink({ to, state, icon: Icon, label }) {
  return (
    <Link
      to={to}
      state={state}
      className="group flex min-h-12 items-center gap-3 rounded-[14px] px-4 text-sm font-black text-[#173154] transition duration-200 hover:bg-[#F0F7FF] active:translate-y-px"
    >
      <Icon className="h-5 w-5 text-[#64748B] transition duration-200 group-hover:text-[#173154]" strokeWidth={2.15} />
      <span>{label}</span>
    </Link>
  );
}
