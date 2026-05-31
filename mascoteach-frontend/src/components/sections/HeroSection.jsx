import { motion, useReducedMotion } from 'framer-motion';

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative isolate overflow-hidden px-3 pb-14 pt-[124px] sm:px-5 sm:pb-16 sm:pt-[136px] lg:px-8 lg:pb-20 lg:pt-[144px] xl:pb-24"
      aria-label="Mascoteach hero"
      style={{
        background:
          'radial-gradient(circle at left center, rgba(120, 170, 255, 0.10), transparent 40%), radial-gradient(circle at right center, rgba(120, 170, 255, 0.08), transparent 40%), linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 100%)',
      }}
    >
      <motion.div
        className="relative z-10 mx-auto w-[96%] max-w-[1440px] overflow-hidden rounded-[20px] border border-[#78AAFF]/[0.12] bg-white shadow-[0_18px_60px_rgba(30,60,120,0.06)] sm:w-[94%] sm:rounded-[28px] lg:w-[92%] lg:max-w-[1080px] lg:rounded-[32px] xl:max-w-[1320px] 2xl:max-w-[1440px]"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.995 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src="/images/herosection/hero.png"
          alt="Sumadi - người bạn đồng hành học tập của Mascoteach."
          className="block h-auto w-full object-contain"
        />
      </motion.div>
    </section>
  );
}
