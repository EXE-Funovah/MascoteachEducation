import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { PRICING_PLANS } from '@/lib/pricingData';
import { cn } from '@/lib/utils';

function CheckIcon({ included }) {
  if (included) {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
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
          {PRICING_PLANS.map((plan, idx) => (
            <motion.article
              key={plan.id}
              className={cn(
                'relative rounded-4xl flex flex-col transition-all duration-400',
                plan.popular
                  ? 'gradient-border-pro bg-white md:scale-[1.04] md:-my-4 z-10 shadow-gamma-float'
                  : 'bg-white border border-slate-100/80 shadow-gamma-card hover:shadow-gamma-hover hover:-translate-y-2',
              )}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.25, 0.4, 0.25, 1] }}
              whileHover={!plan.popular ? { y: -6 } : {}}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className={cn(
                    'px-5 py-2 rounded-full text-xs font-bold text-white whitespace-nowrap shadow-lg',
                    plan.popular
                      ? 'bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700'
                  )}>
                    {plan.popular && (
                      <span className="mr-1.5">✦</span>
                    )}
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Card body */}
              <div className={cn(
                'p-7 md:p-8 flex flex-col flex-1',
                plan.popular && 'pt-10',
              )}>
                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-display-sm font-extrabold text-ink">
                    {plan.priceLabel}
                  </span>
                  {plan.priceUnit && (
                    <span className="text-body-md text-ink-muted ml-1">{plan.priceUnit}</span>
                  )}
                </div>

                {/* CTA */}
                <Button
                  variant={plan.popular ? 'outline' : 'secondary'}
                  size="lg"
                  className={cn(
                    'w-full mb-8'
                  )}
                  href="/signup"
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-3.5 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckIcon included={feat.included} />
                      <span className={cn(
                        'text-sm leading-relaxed',
                        feat.included ? 'text-ink-secondary' : 'text-ink-light',
                      )}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Trust box */}
                {plan.trustBox && (
                  <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-sky-50/60 border border-blue-100/60">
                    <h4 className="text-sm font-semibold text-brand-navy mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {plan.trustBox.title}
                    </h4>
                    <ul className="space-y-2">
                      {plan.trustBox.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-brand-blue">
                          <span className="mt-0.5 text-brand-mid flex-shrink-0">✦</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
