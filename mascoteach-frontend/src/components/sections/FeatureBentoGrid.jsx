import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import SpotlightCard from '@/components/common/SpotlightCard';
import { FEATURES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/*
  Palette (Uxintace ocean blue):
  #03045E  — Deep Navy
  #0077B6  — Ocean Blue
  #00B4D8  — Bright Cyan
  #90E0EF  — Light Sky
  #CAF0F8  — Ice Blue
*/

/* Icon set — ocean palette */
const FEATURE_ICONS = {
  'mascot-ai': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="16" r="10" fill="#90E0EF" />
      <circle cx="16" cy="15" r="2" fill="#03045E" />
      <circle cx="24" cy="15" r="2" fill="#03045E" />
      <path d="M15 20 Q20 24 25 20" stroke="#0077B6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M10 28 Q20 36 30 28" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  'quiz-game': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect x="6" y="10" width="28" height="20" rx="4" fill="#0077B6" stroke="#00B4D8" strokeWidth="1.5" />
      <path d="M14 20h4M22 16l4 4-4 4" stroke="#CAF0F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="10" r="5" fill="#03045E" />
      <path d="M30 10h4M32 8v4" stroke="#90E0EF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'analytics': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="6" fill="#03045E" />
      <rect x="10" y="24" width="4" height="8" rx="1" fill="#90E0EF" />
      <rect x="18" y="18" width="4" height="14" rx="1" fill="#00B4D8" />
      <rect x="26" y="12" width="4" height="20" rx="1" fill="#0077B6" />
      <path d="M10 20l8-6 8-4" stroke="#CAF0F8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

/* 
  Card config per feature — vibrant ocean palette 
  Lighter backgrounds get dark text, deeper backgrounds get white text.
*/
const CARD_CONFIG = {
  'mascot-ai': {
    bg: 'bg-gradient-to-br from-[#0077B6] to-[#00B4D8]', // Ocean to Cyan
    spotlightColor: 'rgba(255, 255, 255, 0.15)', // White glow
    iconBg: 'bg-white/20',
    label: 'text-[#CAF0F8]',
    border: 'border-white/10',
    titleColor: 'text-white',
    descColor: 'text-white/90',
    barColor: 'bg-white/20',
  },
  'quiz-game': {
    bg: 'bg-gradient-to-br from-[#90E0EF] to-[#CAF0F8]', // Light Sky to Ice Blue
    spotlightColor: 'rgba(3, 4, 94, 0.12)', // Deep Navy glow
    iconBg: 'bg-white/50',
    label: 'text-[#0077B6]',
    border: 'border-[#03045E]/10',
    titleColor: 'text-[#03045E]',
    descColor: 'text-[#03045E]/80',
    barColor: 'bg-[#03045E]/20',
  },
  'analytics': {
    bg: 'bg-gradient-to-tr from-[#00B4D8] to-[#90E0EF]', // Cyan to Light Sky
    spotlightColor: 'rgba(255, 255, 255, 0.25)', // White glow
    iconBg: 'bg-[#03045E]/10',
    label: 'text-[#03045E]',
    border: 'border-white/20',
    titleColor: 'text-[#03045E]',
    descColor: 'text-[#03045E]/80',
    barColor: 'bg-[#03045E]/20',
  },
};

/*
  Bento layout (3 cards):
  ┌────────────────┬──────────┐
  │                │          │
  │   mascot-ai    │ quiz-game│
  │   (hero card)  │          │
  │                ├──────────┤
  │                │          │
  │                │analytics │
  └────────────────┴──────────┘
*/

export default function FeatureBentoGrid() {
  return (
    <section id="features" className="py-16 md:py-20 relative overflow-hidden" aria-label="Tính năng">
      <div className="orb orb-sky w-[400px] h-[400px] -top-20 right-0 opacity-40" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-10 -left-20 opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <Badge color="violet" className="mb-3">Tính năng nổi bật</Badge>
            <h2 className="text-display-sm md:text-display-md">
              Tất cả trong một — để giáo viên tập trung vào điều quan trọng nhất
            </h2>
            <p className="mt-4 text-body-md text-ink/80 font-medium">
              Tiết kiệm hàng giờ soạn bài, biến mỗi tiết học thành trải nghiệm mà học sinh mong chờ mỗi ngày.
            </p>
          </div>
        </FadeInUp>

        {/* ── True Bento grid: hero card left + 2 stacked right ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 auto-rows-auto">
          {FEATURES.map((feature, idx) => {
            const config = CARD_CONFIG[feature.id];
            const isHero = idx === 0;

            /* Hero card spans 7 cols and 2 rows; others span 5 cols */
            const gridClass = isHero
              ? 'md:col-span-7 md:row-span-2'
              : 'md:col-span-5';

            return (
              <motion.div
                key={feature.id}
                className={gridClass}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.55,
                  delay: idx * 0.1,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                <SpotlightCard
                  spotlightColor={config.spotlightColor}
                  className={cn(
                    'h-full border transition-transform duration-300 hover:-translate-y-1',
                    config.bg,
                    config.border
                  )}
                >
                  {isHero ? (
                    /* ── Hero card: video on top + text below ── */
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Video area — contained inside the card */}
                      <div className="p-4 md:p-6 pb-0">
                        <div className="relative rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] bg-black/5">
                          {/* Top accent bar */}
                          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00B4D8] via-[#90E0EF] to-[#CAF0F8] z-10" />
                          <video
                            className="w-full aspect-video object-cover"
                            src="/videos/ezgif-807b48b0f627abca.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        </div>
                      </div>

                      {/* Text content below */}
                      <div className="flex flex-col justify-between flex-1 p-5 md:p-6">
                        <div>
                          <div className="mb-2">
                            <span className={cn(
                              'inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider',
                              'bg-white/20 backdrop-blur-sm shadow-sm',
                              config.label,
                            )}>
                              {feature.badge}
                            </span>
                          </div>

                          <h3 className={cn("text-xl md:text-2xl font-bold mb-1.5 leading-snug", config.titleColor)}>
                            {feature.title}
                          </h3>

                          <p className={cn("text-body-sm md:text-body-md leading-relaxed", config.descColor)}>
                            {feature.description}
                          </p>
                        </div>

                        {/* Bottom decorative bar */}
                        <div className={cn("flex items-center gap-2 mt-4 pt-3 border-t", config.border)}>
                          <div className={cn("h-1.5 w-10 rounded-full", config.barColor)} />
                          <div className={cn("h-1.5 w-6 rounded-full opacity-60", config.barColor)} />
                          <div className={cn("h-1.5 w-4 rounded-full opacity-40", config.barColor)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Standard cards: icon + text ── */
                    <div className="relative z-10 flex flex-col justify-between h-full p-5 md:p-6">
                      <div>
                        <div className={cn(
                          'inline-flex items-center justify-center rounded-2xl mb-4 w-12 h-12 shadow-sm',
                          config.iconBg,
                        )}>
                          {FEATURE_ICONS[feature.id]}
                        </div>

                        <div className="mb-3">
                          <span className={cn(
                            'inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider',
                            'bg-white/20 backdrop-blur-sm shadow-sm',
                            config.label,
                          )}>
                            {feature.badge}
                          </span>
                        </div>

                        <h3 className={cn("text-base md:text-lg font-bold mb-2 leading-snug", config.titleColor)}>
                          {feature.title}
                        </h3>

                        <p className={cn("text-body-sm leading-relaxed", config.descColor)}>
                          {feature.description}
                        </p>
                      </div>

                      {/* Bottom decorative bar */}
                      <div className={cn("flex items-center gap-2 mt-5 pt-4 border-t", config.border)}>
                        <div className={cn("h-1.5 w-10 rounded-full", config.barColor)} />
                        <div className={cn("h-1.5 w-6 rounded-full opacity-60", config.barColor)} />
                        <div className={cn("h-1.5 w-4 rounded-full opacity-40", config.barColor)} />
                      </div>
                    </div>
                  )}
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
