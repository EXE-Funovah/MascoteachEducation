import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { HERO } from '@/lib/constants';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center mesh-hero overflow-hidden" aria-label="Hero">
      {/* ── Floating decorative blobs ── */}
      <div className="orb orb-violet w-[600px] h-[600px] -top-48 -left-48 animate-pulse-soft" />
      <div className="orb orb-pink w-[500px] h-[500px] top-10 -right-40 animate-pulse-soft" style={{ animationDelay: '2s' }} />
      <div className="orb orb-sky w-[350px] h-[350px] bottom-20 left-1/3 animate-pulse-soft" style={{ animationDelay: '4s' }} />

      {/* Organic floating shapes */}
      <motion.div
        className="floating-blob w-32 h-32 bg-brand-mid/20 top-32 right-[20%]"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="floating-blob w-24 h-24 bg-brand-light/25 bottom-40 left-[15%]"
        animate={{ y: [0, -15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="floating-blob w-16 h-16 bg-brand-blue/15 top-1/2 left-[8%]"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* ── Split-screen layout ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Text + CTAs */}
          <div className="text-center lg:text-left">
            <FadeInUp delay={0.1}>
              <Badge color="sky" className="mb-6 lg:mb-8">
                {HERO.badge}
              </Badge>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <h1 className="text-display-lg md:text-display-xl">
                {HERO.headline.map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? <span className="text-gradient">{line}</span> : line}
                  </span>
                ))}
              </h1>
            </FadeInUp>

            <FadeInUp delay={0.35}>
              <p className="mt-6 lg:mt-8 text-body-lg text-ink-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {HERO.subheadline}
              </p>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
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

            {/* Trust indicators */}
            <FadeInUp delay={0.6}>
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-ink-muted">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-brand-navy/30 to-brand-blue/40" />
                    ))}
                  </div>
                  <span>500+ giáo viên tin dùng</span>
                </div>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span>Miễn phí 30 ngày</span>
              </div>
            </FadeInUp>
          </div>

          {/* RIGHT: Visual mockup */}
          <FadeInUp delay={0.4} className="relative">
            <motion.div
              className="relative"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-blue/15 via-brand-mid/12 to-brand-light/10 rounded-[2.5rem] blur-2xl" />

              {/* Browser mockup */}
              <div className="relative bg-white rounded-4xl shadow-gamma-float border border-white/60 overflow-hidden">
                {/* Gradient top bar */}
                <div className="h-2 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid" />

                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100/80 bg-white/90">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-50 rounded-full h-7 flex items-center px-4">
                      <span className="text-xs text-ink-muted">app.mascoteach.vn/classroom</span>
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6 md:p-8 min-h-[280px] md:min-h-[380px] bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 flex items-center justify-center">
                  <div className="text-center space-y-5">
                    {/* Floating app icon */}
                    <motion.div
                      className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-navy to-brand-blue flex items-center justify-center shadow-gamma-glow"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>

                    <p className="text-sm text-ink-secondary font-medium">{HERO.visual_caption}</p>

                    {/* Skeleton bars */}
                    <div className="flex justify-center gap-2">
                      <div className="h-2.5 w-20 rounded-full bg-brand-navy/15" />
                      <div className="h-2.5 w-28 rounded-full bg-brand-blue/15" />
                      <div className="h-2.5 w-14 rounded-full bg-brand-mid/20" />
                    </div>

                    {/* Mini stats */}
                    <div className="flex justify-center gap-3 mt-4">
                      {['Học sinh: 32', 'Online: 28', 'Quiz: 94%'].map((stat, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-full bg-white/80 border border-slate-100 text-xs text-ink-secondary shadow-sm">
                          {stat}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating mini cards */}
              <motion.div
                className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-gamma-card border border-slate-100/60 px-4 py-3 flex items-center gap-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">AI sẵn sàng</p>
                  <p className="text-[10px] text-ink-muted">Mascot đang hoạt động</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -top-3 -right-4 bg-white rounded-2xl shadow-gamma-card border border-slate-100/60 px-4 py-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                    <span className="text-sm">⚡</span>
                  </div>
                  <span className="text-xs font-semibold text-ink">+15% điểm TB</span>
                </div>
              </motion.div>
            </motion.div>
          </FadeInUp>
        </div>
      </div>
    </section>
  );
}
