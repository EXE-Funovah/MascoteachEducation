import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = 'currentColor',
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = '100%',
  className = '',
  style = {},
}) {
  const containerRef = useRef(null);
  const pixelGridRef = useRef(null);
  const activeRef = useRef(null);
  const delayedCallRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  useEffect(() => {
    const el = pixelGridRef.current;
    if (!el) return;
    el.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const px = document.createElement('div');
        px.className = 'absolute hidden';
        px.style.backgroundColor = pixelColor;
        const size = 100 / gridSize;
        px.style.width = `${size}%`;
        px.style.height = `${size}%`;
        px.style.left = `${col * size}%`;
        px.style.top = `${row * size}%`;
        el.appendChild(px);
      }
    }
  }, [gridSize, pixelColor]);

  const animatePixels = (activate) => {
    setIsActive(activate);
    const el = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!el || !activeEl) return;

    const pixels = el.children;
    if (!pixels.length) return;

    gsap.killTweensOf(pixels);
    delayedCallRef.current?.kill();

    gsap.set(pixels, { display: 'none' });

    const stagger = animationStepDuration / pixels.length;

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: { each: stagger, from: 'random' },
    });

    delayedCallRef.current = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? 'block' : 'none';
      activeEl.style.pointerEvents = activate ? 'none' : '';
    });

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration,
      stagger: { each: stagger, from: 'random' },
    });
  };

  const handleEnter = () => { if (!isActive) animatePixels(true); };
  const handleLeave = () => { if (isActive && !once) animatePixels(false); };
  const handleClick = () => {
    if (!isActive) animatePixels(true);
    else if (!once) animatePixels(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
      onMouseEnter={!isTouchDevice ? handleEnter : undefined}
      onMouseLeave={!isTouchDevice ? handleLeave : undefined}
      onClick={isTouchDevice ? handleClick : undefined}
      onFocus={!isTouchDevice ? handleEnter : undefined}
      onBlur={!isTouchDevice ? handleLeave : undefined}
      tabIndex={0}
    >
      <div style={{ paddingTop: aspectRatio }} />
      {/* Default face */}
      <div className="absolute inset-0 w-full h-full" aria-hidden={isActive}>
        {firstContent}
      </div>
      {/* Revealed face */}
      <div className="absolute inset-0 w-full h-full z-[2] hidden" ref={activeRef} aria-hidden={!isActive}>
        {secondContent}
      </div>
      {/* Pixel grid overlay */}
      <div className="absolute inset-0 w-full h-full z-[3] pointer-events-none" ref={pixelGridRef} />
    </div>
  );
}
