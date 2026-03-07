import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import PixelTransition from '@/components/animations/PixelTransition';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { PRICING_PLANS } from '@/lib/pricingData';
import { cn } from '@/lib/utils';

/* ── accent map for each plan ── */
const ACCENT = {
  starter: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    ring: 'ring-slate-200',
    icon: 'text-slate-500',
    pixel: '#cbd5e1',
    label: 'text-slate-700',
  },
  pro: {
    bg: 'bg-gradient-to-br from-blue-50 to-sky-100',
    ring: 'ring-brand-blue/30',
    icon: 'text-brand-blue',
    pixel: '#2b7ab5',
    label: 'text-brand-navy',
  },
  school: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
    ring: 'ring-violet-300/30',
    icon: 'text-violet-600',
    pixel: '#7c3aed',
    label: 'text-violet-700',
  },
};

function CheckIcon({ included }) {
  if (included) {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </div>
  );
}

/* ── Front face: just the plan name, big & bold ── */
function PlanFront({ plan, accent }) {
  return (
    <div className={cn(
      'w-full h-full flex flex-col items-center justify-center gap-4 p-8',
      accent.bg,
    )}>
      {plan.badge && (
        <span className={cn(
          'px-4 py-1.5 rounded-full text-[11px] font-bold text-white shadow-md',
          plan.popular
            ? 'bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid'
            : 'bg-gradient-to-r from-slate-500 to-slate-600',
        )}>
          {plan.popular && <span className="mr-1">✦</span>}
          {plan.badge}
        </span>
      )}
      <h3 className={cn('text-4xl md:text-5xl font-extrabold tracking-tight', accent.label)}>
        {plan.name}
      </h3>
      <p className="text-sm text-ink-muted text-center max-w-[200px]">{plan.description}</p>
    </div>
  );
}

/* ── Back face: price + features + CTA ── */
function PlanBack({ plan, accent }) {
  const topFeatures = plan.features.filter(f => f.included).slice(0, 5);

  return (
    <div className={cn(
      'w-full h-full flex flex-col p-7 md:p-8 overflow-y-auto',
      accent.bg,
    )}>
      {/* Price */}
      <div className="mb-5">
        <span className="text-4xl md:text-5xl font-extrabold text-ink">{plan.priceLabel}</span>
        {plan.priceUnit && (
          <span className="text-base text-ink-muted ml-1.5">{plan.priceUnit}</span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {topFeatures.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckIcon included={feat.included} />
            <span className="text-sm md:text-base leading-relaxed text-ink-secondary">{feat.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={plan.popular ? 'primary' : 'secondary'}
        size="lg"
        className="w-full mt-5 text-base"
        href="/signup"
      >
        {plan.cta}
      </Button>
    </div>
  );
}

export default function PricingTable() {
  return (
    <section id="pricing" className="py-24 md:py-32 mesh-pricing relative overflow-hidden" aria-label="Bảng giá">
      <div className="orb orb-violet w-[450px] h-[450px] -top-32 left-1/2 -translate-x-1/2 opacity-30" />
      <div className="orb orb-peach w-[300px] h-[300px] bottom-0 right-0 opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge color="pink" className="mb-4">Bảng giá</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Chọn gói phù hợp cho bạn
            </h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Bắt đầu miễn phí, mở rộng khi cần — không ràng buộc hợp đồng.
            </p>
          </div>
        </FadeInUp>

        {/* ── Pricing cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {PRICING_PLANS.map((plan, idx) => {
            const accent = ACCENT[plan.id] || ACCENT.starter;

            return (
              <motion.div
                key={plan.id}
                className={cn(
                  'relative',
                  plan.popular && 'md:scale-[1.04] md:-my-4 z-10',
                )}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <PixelTransition
                  firstContent={<PlanFront plan={plan} accent={accent} />}
                  secondContent={<PlanBack plan={plan} accent={accent} />}
                  gridSize={8}
                  pixelColor={accent.pixel}
                  animationStepDuration={0.2}
                  className={cn(
                    'rounded-4xl ring-1 bg-white',
                    accent.ring,
                    plan.popular
                      ? 'shadow-gamma-float'
                      : 'shadow-gamma-card hover:shadow-gamma-hover',
                  )}
                  style={{ borderRadius: '2rem' }}
                  aspectRatio="140%"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
