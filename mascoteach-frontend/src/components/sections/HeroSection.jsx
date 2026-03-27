import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Grainient from '@/components/animations/Grainient';
import SplitText from '@/components/animations/SplitText';
import { SITE } from '@/lib/constants';

const SLIDES = [
  { id: 1, text: 'SOẠN BÀI NHANH' },
  { id: 2, text: 'KẾT NỐI AI' },
  { id: 3, text: 'ĐỘT PHÁ DẠY HỌC' },
];

const INTERVAL = 3000;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [splitKey, setSplitKey] = useState(0);

  const advance = useCallback(() => {
    setIndex(prev => (prev + 1) % SLIDES.length);
    setSplitKey(k => k + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, INTERVAL);
    return () => clearInterval(timer);
  }, [advance]);

  const current = SLIDES[index];

  return (
    <section
      className="relative w-full h-screen overflow-hidden flex flex-col"
      aria-label="Hero"
    >
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#5BAED4"
          color2="#1B3A6B"
          color3="#080E1A"
          timeSpeed={0.18}
          colorBalance={0.1}
          warpStrength={1.2}
          warpFrequency={4}
          warpSpeed={1.2}
          warpAmplitude={60}
          blendAngle={20}
          blendSoftness={0.08}
          rotationAmount={360}
          noiseScale={1.8}
          grainAmount={0.06}
          grainScale={1.5}
          grainAnimated={false}
          contrast={1.4}
          gamma={1.0}
          saturation={1.1}
          centerX={0}
          centerY={0}
          zoom={0.95}
        />
      </div>

      <div className="relative z-10 px-4 pt-[110px] sm:px-8 sm:pt-[122px] md:px-16 md:pt-[136px] lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto flex w-full max-w-7xl justify-center"
        >
          <p className="text-center text-sm font-semibold tracking-[0.22em] text-white/88 sm:text-base">
            {SITE.tagline}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="w-full max-w-7xl text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SplitText
                key={splitKey}
                text={current.text}
                tag="span"
                className="font-black uppercase text-white leading-tight block w-full text-center sm:whitespace-nowrap"
                style={{
                  fontSize: 'clamp(2.3rem, 8.8vw, 10rem)',
                  letterSpacing: '-0.04em',
                  textShadow: '0 4px 40px rgba(0,0,0,0.4)',
                }}
                splitType="chars"
                delay={60}
                duration={0.6}
                ease="power3.out"
                from={{ opacity: 0, y: 60, rotateX: -40 }}
                to={{ opacity: 1, y: 0, rotateX: 0 }}
                threshold={0}
                rootMargin="0px"
                textAlign="center"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 flex justify-center pb-16">
        <QuickGuideButton />
      </div>
    </section>
  );
}

function QuickGuideButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => {/* TODO: mở panel hướng dẫn nhanh */}}
      className="relative flex items-center gap-4 px-8 py-4 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm text-white font-semibold text-base overflow-hidden cursor-pointer"
      whileTap={{ scale: 0.96 }}
      animate={{ scale: hovered ? 1.04 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.span
        className="absolute inset-0 bg-white/20 rounded-full"
        initial={{ x: '-100%' }}
        animate={{ x: hovered ? '0%' : '-100%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      />

      <span className="relative z-10">Hướng dẫn nhanh</span>

      <motion.span
        className="relative z-10 flex items-center overflow-hidden"
        animate={{
          opacity: hovered ? 1 : 0,
          width: hovered ? 16 : 0,
          marginLeft: hovered ? 0 : -12,
        }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </motion.span>
    </motion.button>
  );
}

