import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Button from '@/components/common/Button';
import { CTA } from '@/lib/constants';

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden mesh-cta">
      <div className="orb orb-sky w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="orb orb-violet w-[300px] h-[300px] top-0 right-0 opacity-20" />
      <div className="orb orb-pink w-[250px] h-[250px] bottom-0 left-0 opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <FadeInUp>
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-slate-100 shadow-gamma-float p-12 md:p-16"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-brand-navy animate-pulse-soft" />
              <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
              <div className="w-2 h-2 rounded-full bg-brand-mid animate-pulse-soft" style={{ animationDelay: '1s' }} />
            </div>

            <h2 className="text-display-md md:text-display-lg max-w-2xl mx-auto">
              {CTA.headline}
            </h2>

            <p className="mt-6 text-body-lg text-ink-secondary max-w-xl mx-auto">
              {CTA.subheadline}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="xl">
                {CTA.cta_primary}
              </Button>
              <Button variant="secondary" size="lg">
                {CTA.cta_secondary}
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-navy/30 to-brand-blue/40" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-blue/30 to-brand-mid/40" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-mid/30 to-brand-light/50" />
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-light/40 to-brand-blue/30" />
                </div>
                <span>500+ giáo viên đã tham gia</span>
              </div>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span>Miễn phí 30 ngày</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span>Không cần thẻ tín dụng</span>
            </div>
          </motion.div>
        </FadeInUp>
      </div>
    </section>
  );
}
