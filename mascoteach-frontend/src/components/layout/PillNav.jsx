import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const PillNav = ({
  items,
  activeHref,
  className = '',
  containerClassName = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#060010',
  hoveredPillTextColor = '#060010',
  pillTextColor,
  mobileExtraItems = [],
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.6, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const navItems = navItemsRef.current;
      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, { width: 'auto', duration: 0.6, ease });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease, transformOrigin: 'top center' }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
        });
      }
    }

    onMobileMenuClick?.();
  };

  /* Auto-close mobile menu on scroll */
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onScroll = () => {
      toggleMobileMenu();
      window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobileMenuOpen]);

  const isExternalLink = href =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': resolvedPillTextColor,
  };

  // Pill content — class names kept for GSAP querySelector targeting
  const renderPillContent = (item, i) => (
    <>
      {/* hover-circle: dimensions set programmatically by GSAP layout fn */}
      <span
        className="pill-label-circle absolute left-1/2 bottom-0 rounded-full pointer-events-none z-[1] will-change-transform"
        aria-hidden="true"
        style={{ background: baseColor }}
        ref={el => { circleRefs.current[i] = el; }}
      />
      <span className="relative inline-block leading-none z-[2]">
        <span className="pill-label relative z-[2] inline-block leading-none will-change-transform">
          {item.label}
        </span>
        <span
          className="pill-label-hover absolute left-0 top-0 z-[3] inline-block will-change-[transform,opacity] font-bold tracking-tight"
          style={{ color: hoveredPillTextColor, fontSize: '16px' }}
          aria-hidden="true"
        >
          {item.label}
        </span>
      </span>
    </>
  );

  const pillClass = (isActive) =>
    `inline-flex items-center justify-center h-full px-[18px] rounded-full
     font-medium text-[15px] whitespace-nowrap cursor-pointer
     relative overflow-hidden border-0 outline-none leading-none
     ${isActive ? 'after:content-[\'\'] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-3 after:h-3 after:rounded-full after:z-[4]' : ''}`;

  const pillStyle = { background: pillColor, color: resolvedPillTextColor };

  const mobileLinkCls = (isActive) =>
    `block w-full text-left px-5 py-3.5 rounded-2xl text-[15px] font-medium cursor-pointer
     transition-colors duration-200 border-0 text-white/90 hover:bg-white/10
     ${isActive ? 'bg-white/10' : ''}`;

  return (
    <div className={`relative flex items-center ${containerClassName}`}>
      <nav
        className={`flex items-center w-max ${className}`}
        aria-label="Primary"
      >
        {/* Desktop nav items */}
        <div
          className="hidden md:flex items-center h-[48px] rounded-full"
          style={{ background: pillColor }}
          ref={navItemsRef}
        >
          <ul className="flex items-stretch gap-[3px] m-0 p-[3px] h-full list-none" role="menubar">
            {items.map((item, i) => (
              <li key={item.href || `item-${i}`} className="flex h-full" role="none">
                {item.onClick ? (
                  <button
                    role="menuitem"
                    className={pillClass(activeHref === item.href)}
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                    onClick={item.onClick}
                  >
                    {renderPillContent(item, i)}
                  </button>
                ) : isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={pillClass(activeHref === item.href)}
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {renderPillContent(item, i)}
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={pillClass(activeHref === item.href)}
                    style={pillStyle}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    {renderPillContent(item, i)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-[46px] h-[46px] rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer border-0 p-0 shrink-0"
          style={{ background: pillColor }}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line w-4 h-0.5 rounded-sm" style={{ background: resolvedPillTextColor }} />
          <span className="hamburger-line w-4 h-0.5 rounded-sm" style={{ background: resolvedPillTextColor }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div
        className="fixed top-[72px] left-4 right-4 rounded-3xl shadow-2xl z-[998] invisible opacity-0 md:hidden
                   bg-[#0f172a]/90 backdrop-blur-xl border border-white/10"
        ref={mobileMenuRef}
      >
        <ul className="flex flex-col gap-1 m-0 p-2 list-none">
          {items.map((item, i) => (
            <li key={item.href || `mobile-item-${i}`}>
              {item.onClick ? (
                <button
                  className={mobileLinkCls(activeHref === item.href)}
                  onClick={() => { item.onClick(); toggleMobileMenu(); }}
                >
                  {item.label}
                </button>
              ) : isRouterLink(item.href) ? (
                <Link
                  to={item.href}
                  className={mobileLinkCls(activeHref === item.href)}
                  onClick={() => toggleMobileMenu()}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className={mobileLinkCls(activeHref === item.href)}
                  onClick={() => toggleMobileMenu()}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
          {mobileExtraItems.length > 0 && (
            <>
              <li className="mx-4 my-1.5 border-t border-white/15" aria-hidden="true" />
              {mobileExtraItems.map((item, i) => (
                <li key={item.href || `mobile-extra-${i}`}>
                  {isRouterLink(item.href) ? (
                    <Link
                      to={item.href}
                      className={mobileLinkCls(false)}
                      onClick={() => toggleMobileMenu()}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={mobileLinkCls(false)}
                      onClick={() => toggleMobileMenu()}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;

