import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Button from '@/components/common/Button';
import { CTA } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden" aria-label="Kêu gọi hành động">
      {/* ── Massive gradient background ── */}
      <div className="mesh-cta py-24 md:py-32 lg:py-40 relative">
        {/* Decorative elements peeking from edges */}
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 md:w-72 md:h-72"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-full h-full rounded-tr-[4rem] bg-white/10 backdrop-blur-sm" />
        </motion.div>

        <motion.div
          className="absolute bottom-0 right-0 w-40 h-40 md:w-64 md:h-64"
          animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="w-full h-full rounded-tl-[4rem] bg-white/8 backdrop-blur-sm" />
        </motion.div>

        {/* Floating circles */}
        <motion.div
          className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-white/10"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-32 right-[15%] w-14 h-14 rounded-full bg-white/8"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="absolute bottom-32 left-[20%] w-10 h-10 rounded-full bg-white/10"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        {/* Side-peeking illustrative shapes */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-24 h-48 md:w-32 md:h-64 bg-white/5 rounded-r-[3rem]" />
        <div className="absolute -right-8 top-1/3 w-20 h-40 md:w-28 md:h-56 bg-white/5 rounded-l-[3rem]" />

        {/* ── Content ── */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <FadeInUp>
            {/* Animated dots */}
            <div className="flex justify-center gap-3 mb-8">
              <motion.div
                className="w-3 h-3 rounded-full bg-white/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-white/50"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
              />
              <motion.div
                className="w-3 h-3 rounded-full bg-white/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              />
            </div>

            <h2 className="text-display-md md:text-display-lg lg:text-display-xl text-white max-w-3xl mx-auto">
              {CTA.headline}
            </h2>

            <p className="mt-6 md:mt-8 text-body-lg text-white/80 max-w-xl mx-auto">
              {CTA.subheadline}
            </p>

            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="xl"
                className="bg-white text-brand-navy border-white/20 hover:bg-white/90 hover:text-brand-navy shadow-lg hover:shadow-xl font-bold"
                href="/signup"
              >
                {CTA.cta_primary}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white/90 hover:text-white hover:bg-white/10 border border-white/20"
              >
                {CTA.cta_secondary}
              </Button>
            </div>

            {/* Trust stats */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm" />
                  ))}
                </div>
                <span>500+ giáo viên đã tham gia</span>
              </div>
              <span className="hidden sm:inline text-white/30">|</span>
              <span>Miễn phí 30 ngày</span>
              <span className="hidden sm:inline text-white/30">|</span>
              <span>Không cần thẻ tín dụng</span>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
