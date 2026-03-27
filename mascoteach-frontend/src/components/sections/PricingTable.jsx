import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import PixelTransition from '@/components/animations/PixelTransition';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { PRICING_PLANS } from '@/lib/pricingData';
import { cn } from '@/lib/utils';

const ACCENT = {
  starter: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    ring: 'ring-slate-200',
    pixel: '#cbd5e1',
    label: 'text-slate-700',
  },
  pro: {
    bg: 'bg-gradient-to-br from-blue-50 to-sky-100',
    ring: 'ring-brand-blue/30',
    pixel: '#2b7ab5',
    label: 'text-brand-navy',
  },
  school: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
    ring: 'ring-violet-300/30',
    pixel: '#7c3aed',
    label: 'text-violet-700',
  },
};

function CheckIcon({ included }) {
  if (included) {
    return (
      <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="h-3 w-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
      <svg className="h-3 w-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </div>
  );
}

function PlanFront({ plan, accent }) {
  return (
    <div className={cn('flex h-full w-full flex-col p-8 md:p-9', accent.bg)}>
      <div className="mx-auto flex w-full max-w-[240px] flex-1 flex-col items-center justify-center text-center">
        <div className="mb-5 flex min-h-[32px] items-center justify-center">
          {plan.badge ? (
            <span
              className={cn(
                'rounded-full px-4 py-1.5 text-[11px] font-bold text-white shadow-md',
                plan.popular
                  ? 'bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid'
                  : 'bg-gradient-to-r from-slate-500 to-slate-600'
              )}
            >
              {plan.popular && <span className="mr-1">✦</span>}
              {plan.badge}
            </span>
          ) : (
            <span className="invisible rounded-full px-4 py-1.5 text-[11px] font-bold">placeholder</span>
          )}
        </div>

        <div className="min-h-[120px] flex flex-col items-center justify-center">
          <h3 className={cn('text-center text-4xl font-extrabold tracking-tight md:text-5xl', accent.label)}>
            {plan.name}
          </h3>
          <p className="mt-4 max-w-[220px] text-center text-sm leading-relaxed text-ink-muted">
            {plan.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlanBack({ plan, accent }) {
  const topFeatures = plan.features.filter(f => f.included).slice(0, 5);

  return (
    <div className={cn('flex h-full w-full flex-col p-8 md:p-9', accent.bg)}>
      <div className="flex w-full flex-1 flex-col">
        <div className="min-h-[82px] text-left">
          <div className="text-4xl font-extrabold text-ink md:text-5xl">{plan.priceLabel}</div>
          {plan.priceUnit ? (
            <div className="mt-1 text-base text-ink-muted">{plan.priceUnit}</div>
          ) : null}
        </div>

        <ul className="space-y-3 text-left">
          {topFeatures.map((feat, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckIcon included={feat.included} />
              <span className="text-sm leading-relaxed text-ink-secondary md:text-base">{feat.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto w-full pt-6">
        <Button
          variant={plan.popular ? 'primary' : 'secondary'}
          size="lg"
          className="w-full text-base"
          href="/signup"
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}

export default function PricingTable() {
  return (
    <section id="pricing" className="mesh-pricing relative overflow-hidden py-24 md:py-32" aria-label="Bảng giá">
      <div className="orb orb-violet h-[450px] w-[450px] -top-32 left-1/2 -translate-x-1/2 opacity-30" />
      <div className="orb orb-peach h-[300px] w-[300px] bottom-0 right-0 opacity-25" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <FadeInUp>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge color="pink" className="mb-4">Bảng giá</Badge>
            <h2 className="text-display-md md:text-display-lg">Chọn gói phù hợp cho bạn</h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Bắt đầu miễn phí, mở rộng khi cần — không ràng buộc hợp đồng.
            </p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
          {PRICING_PLANS.map((plan, idx) => {
            const accent = ACCENT[plan.id] || ACCENT.starter;

            return (
              <motion.div
                key={plan.id}
                className={cn('relative', plan.popular && 'z-10 md:-my-4 md:scale-[1.04]')}
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
                    plan.popular ? 'shadow-gamma-float' : 'shadow-gamma-card hover:shadow-gamma-hover'
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

