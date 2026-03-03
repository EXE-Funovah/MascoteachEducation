import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { FEATURES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* Vibrant icon set — brand blue palette */
const FEATURE_ICONS = {
  'mascot-ai': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="16" r="10" fill="#A8D8EA" />
      <circle cx="16" cy="15" r="2" fill="#1B3A6B" />
      <circle cx="24" cy="15" r="2" fill="#1B3A6B" />
      <path d="M15 20 Q20 24 25 20" stroke="#2B7AB5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M10 28 Q20 36 30 28" stroke="#5BAED4" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  'quiz-game': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect x="6" y="10" width="28" height="20" rx="4" fill="#E0F0FA" stroke="#5BAED4" strokeWidth="1.5" />
      <path d="M14 20h4M22 16l4 4-4 4" stroke="#2B7AB5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="10" r="5" fill="#1B3A6B" />
      <path d="M30 10h4M32 8v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  'analytics': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="6" fill="#EBF5FB" />
      <rect x="10" y="24" width="4" height="8" rx="1" fill="#A8D8EA" />
      <rect x="18" y="18" width="4" height="14" rx="1" fill="#5BAED4" />
      <rect x="26" y="12" width="4" height="20" rx="1" fill="#2B7AB5" />
      <path d="M10 20l8-6 8-4" stroke="#1B3A6B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  ),
  'hardware': (
    <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="12" width="32" height="16" rx="4" fill="#EBF5FB" stroke="#5BAED4" strokeWidth="1.5" />
      <circle cx="12" cy="20" r="3" fill="#A8D8EA" />
      <circle cx="20" cy="20" r="3" fill="#5BAED4" />
      <circle cx="28" cy="20" r="3" fill="#1B3A6B" />
      <path d="M4 20h4M32 20h4" stroke="#2B7AB5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/* Pastel backgrounds per feature */
const CARD_STYLES = {
  'mascot-ai': {
    bg: 'bg-blue-50/60',
    border: 'border-blue-100/80',
  },
  'quiz-game': {
    bg: 'bg-violet-50/60',
    border: 'border-violet-100/80',
  },
  'analytics': {
    bg: 'bg-teal-50/60',
    border: 'border-teal-100/80',
  },
  'hardware': {
    bg: 'bg-amber-50/60',
    border: 'border-amber-100/80',
  },
};

export default function FeatureBentoGrid() {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden" aria-label="Tính năng">
      <div className="orb orb-sky w-[400px] h-[400px] -top-20 right-0 opacity-40" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-10 -left-20 opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <Badge color="violet" className="mb-4">Tính năng</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Mọi thứ giáo viên cần,{' '}
              <span className="text-gradient">trong một nền tảng</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink/80 font-medium">
              Từ mascot AI đến phần cứng IoT — Mascoteach là hệ sinh thái toàn diện cho lớp học thế hệ mới.
            </p>
          </div>
        </FadeInUp>

        {/* ── Bento grid: asymmetric layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-auto">
          {FEATURES.map((feature, idx) => {
            const styles = CARD_STYLES[feature.id];
            const colSpan = idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : idx === 2 ? 'md:col-span-5' : 'md:col-span-7';

            return (
              <motion.article
                key={feature.id}
                className={cn(
                  'group relative rounded-4xl border overflow-hidden',
                  'shadow-card-pastel hover:shadow-gamma-hover transition-all duration-400',
                  'hover:-translate-y-1.5 flex flex-col bg-white',
                  styles.border,
                  colSpan,
                )}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Visual area */}
                <div className={cn(
                  'relative flex items-center justify-center overflow-hidden',
                  idx === 0 || idx === 3 ? 'h-52' : 'h-44',
                  styles.bg,
                )}>
                  {/* Decorative circles */}
                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-4 left-6 w-20 h-20 rounded-full bg-white/50 animate-blob" />
                    <div className="absolute bottom-2 right-8 w-12 h-12 rounded-full bg-white/40" />
                    <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-white/60" />
                  </div>

                  {/* Icon in floating pill */}
                  <motion.div
                    className={cn(
                      'relative z-10 w-20 h-20 rounded-3xl bg-white shadow-gamma-card flex items-center justify-center',
                      'group-hover:shadow-gamma-hover transition-shadow duration-300'
                    )}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                  >
                    {FEATURE_ICONS[feature.id]}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-7 md:p-8 flex flex-col flex-1">
                  <Badge color={feature.badgeColor} className="mb-3 self-start">
                    {feature.badge}
                  </Badge>
                  <h3 className="text-xl font-bold text-ink mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-body-md text-ink/75 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
