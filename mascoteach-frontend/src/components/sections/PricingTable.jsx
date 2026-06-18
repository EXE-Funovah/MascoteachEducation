import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PRICING_PLANS } from '@/lib/pricingData';
import {
  BILLING_PLAN_CODES,
  BILLING_PLAN_FALLBACKS,
  getBillingPlans,
  normalizePlan,
} from '@/services/billingService';
import { cn } from '@/lib/utils';

const cardTone = {
  free: {
    card: 'border border-[#BFD8FA] bg-white',
    glow: 'shadow-[0_24px_70px_rgba(93,156,236,0.10)]',
    text: 'text-[#1E293B]',
    muted: 'text-[#64748B]',
    border: 'border-[#1E293B]',
    badgeBg: 'bg-[#F0F7FF]',
    divider: 'border-brand-light/50',
    check: 'bg-[#1E293B] text-white',
    cta: 'bg-[#1E293B] text-white shadow-[0_14px_34px_rgba(30,41,59,0.22)] hover:bg-[#0F172A]',
    note: 'text-[#0B6FB8]',
  },
  pro: {
    card: 'border border-brand-light/80 bg-surface-blue',
    glow: 'shadow-[0_28px_82px_rgba(43,122,181,0.16)]',
    text: 'text-[#1E293B]',
    muted: 'text-[#52657D]',
    border: 'border-brand-blue',
    badgeBg: 'bg-white/62',
    divider: 'border-brand-light/70',
    check: 'bg-brand-blue text-white',
    cta: 'bg-brand-blue text-white shadow-[0_16px_36px_rgba(43,122,181,0.26)] hover:bg-brand-navy',
    note: 'text-brand-blue',
  },
};

function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function BillingToggle({ billing, setBilling }) {
  const yearly = billing === 'yearly';

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex items-center gap-4 text-[15px] font-bold text-[#1E293B]">
        <button
          type="button"
          className={cn('transition-colors', !yearly ? 'text-[#1E293B]' : 'text-[#64748B]')}
          onClick={() => setBilling('monthly')}
        >
          Theo tháng
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Chuyển chu kỳ thanh toán"
          className="relative h-7 w-14 rounded-full bg-brand-blue p-1 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12),0_8px_18px_rgba(43,122,181,0.24)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
          onClick={() => setBilling(yearly ? 'monthly' : 'yearly')}
        >
          <span
            className={cn(
              'block h-5 w-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] transition-transform duration-300',
              yearly ? 'translate-x-7' : 'translate-x-0'
            )}
          />
        </button>

        <button
          type="button"
          className={cn('transition-colors', yearly ? 'text-[#1E293B]' : 'text-[#64748B]')}
          onClick={() => setBilling('yearly')}
        >
          Theo năm
        </button>
      </div>
    </div>
  );
}

function PricingCard({ plan, billing, index, billingPlans, onUpgrade }) {
  const tone = cardTone[plan.tone] || cardTone.free;
  const selectedPlanCode = billing === 'yearly' ? BILLING_PLAN_CODES.yearly : BILLING_PLAN_CODES.monthly;
  const selectedBillingPlan = billingPlans[selectedPlanCode];
  const price = plan.id === 'pro' && selectedBillingPlan
    ? formatCurrency(billing === 'yearly' ? Math.round(selectedBillingPlan.amount / 12) : selectedBillingPlan.amount, selectedBillingPlan.currency)
    : billing === 'yearly' ? plan.yearlyPriceLabel : plan.monthlyPriceLabel;
  const unit = billing === 'yearly' ? plan.yearlyUnit : plan.monthlyUnit;
  const billingNote = plan.id === 'pro' && selectedBillingPlan && billing === 'yearly'
    ? `Thanh toán ${formatCurrency(selectedBillingPlan.amount, selectedBillingPlan.currency)}/năm`
    : billing === 'yearly' ? plan.yearlyBillingNote : plan.monthlyBillingNote;

  return (
    <motion.article
      className={cn(
        'grid min-h-[320px] overflow-hidden rounded-[18px] p-7 md:grid-cols-[1.08fr_1fr] md:p-8',
        tone.card,
        tone.text,
        tone.glow
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.52, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex min-w-0 flex-col">
        <div className={cn('inline-flex h-10 w-fit items-center rounded-[5px] border px-4 text-sm font-extrabold uppercase tracking-[0.08em]', tone.border, tone.badgeBg)}>
          {plan.name}
        </div>

        <p className={cn('mt-4 max-w-[260px] text-sm font-semibold', tone.muted)}>
          {plan.eyebrow}
        </p>

        <div className="mt-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${plan.id}-${billing}-price`}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={cn('font-display text-[46px] font-black leading-none tracking-[-0.03em] md:text-[50px]', tone.text)}>
                {price}
              </div>
              <div className="mt-4 text-base font-semibold text-[#1E293B]/82">
                {unit}
              </div>
              {billingNote && (
                <div className={cn('mt-2 text-xs font-bold uppercase tracking-[0.06em]', tone.note)}>
                  {billingNote}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className={cn('mt-4 max-w-[320px] text-sm leading-6', tone.muted)}>
          {plan.description}
        </p>
      </div>

      <div className={cn('mt-8 flex min-w-0 flex-col border-t pt-7 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0', tone.divider)}>
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[#1E293B]/86">
              <span className={cn('mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full', tone.check)}>
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {plan.id === 'pro' ? (
          <button
            type="button"
            className={cn('mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-[7px] px-5 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35', tone.cta)}
            onClick={() => onUpgrade(selectedPlanCode)}
          >
            {plan.cta}
          </button>
        ) : (
          <Link
            to={plan.href}
            className={cn('mt-auto inline-flex h-12 w-full items-center justify-center rounded-[7px] px-5 text-sm font-extrabold transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/35', tone.cta)}
          >
            {plan.cta}
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export default function PricingTable() {
  const [billing, setBilling] = useState('yearly');
  const [billingPlans, setBillingPlans] = useState(() => ({
    PRO_MONTHLY: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_MONTHLY),
    PRO_YEARLY: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_YEARLY),
  }));
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const plans = await getBillingPlans();
        if (cancelled || plans.length === 0) return;

        setBillingPlans((current) => {
          const next = { ...current };
          plans.forEach((plan) => {
            if (plan.planCode) next[plan.planCode] = plan;
          });
          return next;
        });
      } catch {
        // Pricing is public; unauthenticated visitors use the local fallback prices.
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleUpgrade(planCode) {
    const plan = planCode === BILLING_PLAN_CODES.yearly ? 'yearly' : 'monthly';
    const checkoutPath = `/checkout?plan=${plan}`;

    if (!loading && !isLoggedIn) {
      navigate('/signin', { state: { from: { pathname: checkoutPath } } });
      return;
    }

    navigate(checkoutPath);
  }

  return (
    <section id="pricing" className="relative overflow-hidden bg-surface-blue pb-20 pt-14 text-[#1E293B] md:pb-24 md:pt-16" aria-label="Bảng giá">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <motion.div
          className="mx-auto max-w-[760px] text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-[5px] border border-[#1E293B] bg-white px-4 py-2 text-sm font-extrabold uppercase tracking-[0.08em] shadow-[0_8px_24px_rgba(30,41,59,0.06)]">
            <Sparkle className="h-4 w-4" fill="currentColor" />
            Bảng giá
          </div>

          <h1 className="mt-6 text-balance font-display text-[42px] font-black leading-[0.98] tracking-[-0.03em] text-[#1E293B] sm:text-[56px] md:text-[64px]">
            Chọn gói học phù hợp cho lớp của bạn
          </h1>

          <p className="mx-auto mt-5 max-w-[590px] text-base font-medium leading-7 text-[#64748B] md:text-lg">
            Giá đơn giản, minh bạch. Bắt đầu miễn phí và nâng cấp khi lớp học cần nhiều công cụ hơn.
          </p>

          <BillingToggle billing={billing} setBilling={setBilling} />
        </motion.div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {PRICING_PLANS.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              index={index}
              billingPlans={billingPlans}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>

        <div className="mx-auto mt-7 flex max-w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#64748B]">
          <ShieldCheck className="h-4 w-4 text-brand-blue" />
          Gói Pro sẽ được cập nhật tự động sau khi thanh toán được xác nhận.
        </div>
      </div>
    </section>
  );
}
