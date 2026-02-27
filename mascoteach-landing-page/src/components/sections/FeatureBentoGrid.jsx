import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { FEATURES } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* Icon map cho từng feature — brand blue palette */
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

export default function FeatureBentoGrid() {
  return (
    <section id="features" className="py-32 mesh-feature relative overflow-hidden">
      <div className="orb orb-sky w-[400px] h-[400px] -top-20 right-0 opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-20">
            <Badge color="violet" className="mb-4">Tính năng</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Mọi thứ giáo viên cần,{' '}
              <span className="text-gradient">trong một nền tảng</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Từ mascot AI đến phần cứng IoT — Mascoteach là hệ sinh thái toàn diện cho lớp học thế hệ mới.
            </p>
          </div>
        </FadeInUp>

        {/* Bento Grid: 2+1 / 1+2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-auto">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              className={cn(
                'group relative rounded-4xl border border-slate-100 bg-white overflow-hidden',
                'shadow-gamma-card hover:shadow-gamma-hover transition-all duration-300',
                'hover:-translate-y-1 flex flex-col',
                feature.span
              )}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Visual area */}
              <div className={cn(
                'relative flex items-center justify-center overflow-hidden',
                feature.span === 'md:col-span-2' ? 'h-52' : 'h-44',
                feature.bgColor
              )}>
                {/* Decorative circles */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-6 w-16 h-16 rounded-full bg-white/50" />
                  <div className="absolute bottom-2 right-8 w-10 h-10 rounded-full bg-white/40" />
                  <div className="absolute top-1/2 right-1/4 w-6 h-6 rounded-full bg-white/60" />
                </div>
                {/* Icon in floating card */}
                <motion.div
                  className="relative z-10 w-20 h-20 rounded-3xl bg-white shadow-gamma-card flex items-center justify-center"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                >
                  {FEATURE_ICONS[feature.id]}
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                <Badge color={feature.badgeColor} className="mb-3 self-start">
                  {feature.badge}
                </Badge>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-md text-ink-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
