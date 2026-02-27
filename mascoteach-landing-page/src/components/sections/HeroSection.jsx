import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { HERO } from '@/lib/constants';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center mesh-hero overflow-hidden">
      <div className="orb orb-sky w-[500px] h-[500px] -top-40 -left-40 animate-pulse-soft" />
      <div className="orb orb-violet w-[400px] h-[400px] top-20 -right-32 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-10 left-1/4 animate-pulse-soft" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20 text-center">
        <FadeInUp delay={0.1}>
          <Badge color="sky" className="mb-8">
            {HERO.badge}
          </Badge>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <h1 className="text-display-lg md:text-display-xl max-w-4xl mx-auto">
            {HERO.headline.map((line, i) => (
              <span key={i} className="block">
                {i === 1 ? <span className="text-gradient">{line}</span> : line}
              </span>
            ))}
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.35}>
          <p className="mt-8 text-body-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            {HERO.subheadline}
          </p>
        </FadeInUp>

        <FadeInUp delay={0.5}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="primary" size="lg">
              {HERO.cta_primary}
            </Button>
            <Button variant="secondary" size="lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              {HERO.cta_secondary}
            </Button>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.65}>
          <div className="mt-16 mx-auto max-w-4xl">
            <motion.div
              className="relative bg-white rounded-4xl shadow-gamma-float border border-slate-100 overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid" />
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <div className="w-3 h-3 rounded-full bg-amber-300" />
                  <div className="w-3 h-3 rounded-full bg-emerald-300" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-slate-50 rounded-full h-7 flex items-center px-3">
                    <span className="text-xs text-ink-muted">app.mascoteach.vn/classroom</span>
                  </div>
                </div>
              </div>
              <div className="p-8 min-h-[320px] md:min-h-[400px] bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-navy/10 to-brand-blue/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-ink-muted font-medium">{HERO.visual_caption}</p>
                  <div className="flex justify-center gap-2">
                    <div className="h-2 w-16 rounded-full bg-brand-navy/15" />
                    <div className="h-2 w-24 rounded-full bg-brand-blue/15" />
                    <div className="h-2 w-12 rounded-full bg-brand-mid/20" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
