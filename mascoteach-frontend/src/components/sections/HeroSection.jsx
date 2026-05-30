import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-[#FFFDF7]"
      aria-label="Mascoteach hero"
    >
      <motion.div
        className="relative w-full overflow-hidden bg-[#FFFDF7]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="aspect-video w-full">
          <img
            src="/images/herosection/hero.png"
            alt="Mascoteach introduces Sumadi, a friendly AI learning companion, studying with a child at a warm learning table."
            className="h-full w-full object-cover object-center"
          />
        </div>
      </motion.div>
    </section>
  );
}
