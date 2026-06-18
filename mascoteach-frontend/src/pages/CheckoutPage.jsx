import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import { ArrowLeft, Check, Clock3, Loader2, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BILLING_PLAN_CODES,
  BILLING_PLAN_FALLBACKS,
  createPaymentLink,
  normalizePlan,
} from '@/services/billingService';
import { cn } from '@/lib/utils';

const PAYOS_ELEMENT_ID = 'payos-embedded-checkout';

function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getPlanCode(planParam) {
  if (planParam === 'yearly' || planParam === BILLING_PLAN_CODES.yearly) return BILLING_PLAN_CODES.yearly;
  return BILLING_PLAN_CODES.monthly;
}

function getPlanKey(planCode) {
  return planCode === BILLING_PLAN_CODES.yearly ? 'yearly' : 'monthly';
}

function getPlanMeta(planCode) {
  const fallback = normalizePlan(
    planCode === BILLING_PLAN_CODES.yearly
      ? BILLING_PLAN_FALLBACKS.PRO_YEARLY
      : BILLING_PLAN_FALLBACKS.PRO_MONTHLY
  );

  if (planCode === BILLING_PLAN_CODES.yearly) {
    return {
      ...fallback,
      id: 'yearly',
      label: 'Gói năm',
      description: 'Thanh toán một lần, tiết kiệm hơn cho cả năm học.',
      priceLabel: formatCurrency(99000),
      unit: '/ tháng',
      note: `Thanh toán ${formatCurrency(fallback.amount, fallback.currency)}/năm`,
      totalNote: '365 ngày sử dụng Pro',
    };
  }

  return {
    ...fallback,
    id: 'monthly',
    label: 'Gói tháng',
    description: 'Phù hợp khi lớp học cần dùng linh hoạt.',
    priceLabel: formatCurrency(fallback.amount, fallback.currency),
    unit: '/ tháng',
    note: 'Gia hạn theo tháng',
    totalNote: '30 ngày sử dụng Pro',
  };
}

function PayOsEmbeddedCheckout({ checkoutUrl, orderCode, onExit }) {
  const navigate = useNavigate();
  const returnUrl = `${window.location.origin}/payment/success`;
  const { open, exit } = usePayOS({
    RETURN_URL: returnUrl,
    ELEMENT_ID: PAYOS_ELEMENT_ID,
    CHECKOUT_URL: checkoutUrl,
    embedded: true,
    onSuccess: () => {
      navigate(`/payment/success?orderCode=${orderCode}`, { replace: true });
    },
    onCancel: () => {
      navigate(`/payment/cancel?cancel=true&status=CANCELLED&orderCode=${orderCode}`, { replace: true });
    },
    onExit,
  });

  useEffect(() => {
    const host = document.getElementById(PAYOS_ELEMENT_ID);
    if (host) host.innerHTML = '';
    open();

    return () => {
      const currentHost = document.getElementById(PAYOS_ELEMENT_ID);
      if (currentHost?.querySelector('iframe')) {
        exit();
      }
    };
  }, [checkoutUrl, open, exit]);

  return (
    <div
      id={PAYOS_ELEMENT_ID}
      className="h-[520px] overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(27,58,107,0.08)]"
    />
  );
}

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const planCode = useMemo(() => getPlanCode(searchParams.get('plan')), [searchParams]);
  const selectedPlan = useMemo(() => getPlanMeta(planCode), [planCode]);
  const plans = useMemo(
    () => [getPlanMeta(BILLING_PLAN_CODES.monthly), getPlanMeta(BILLING_PLAN_CODES.yearly)],
    []
  );
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [frameClosed, setFrameClosed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPaymentLink() {
      setLoading(true);
      setError('');
      setFrameClosed(false);
      setPaymentLink(null);

      try {
        const response = await createPaymentLink(planCode);
        const checkoutUrl = response?.checkoutUrl ?? response?.CheckoutUrl;
        const orderCode = response?.orderCode ?? response?.OrderCode;

        if (!checkoutUrl || !orderCode) {
          throw new Error('Không thể tạo đơn thanh toán. Vui lòng thử lại.');
        }

        if (!cancelled) {
          setPaymentLink({ ...response, checkoutUrl, orderCode });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPaymentLink();
    return () => {
      cancelled = true;
    };
  }, [planCode, reloadKey]);

  function selectPlan(planId) {
    setSearchParams({ plan: planId });
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-subtle px-4 py-7 text-[#24282E] sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100dvh-56px)] w-full max-w-[1540px] grid-cols-1 overflow-hidden bg-[#F9FCFF] shadow-[0_34px_100px_rgba(27,58,107,0.18)] lg:grid-cols-[1fr_0.92fr]">
        <div className="flex flex-col px-7 py-8 sm:px-12 lg:px-24 lg:py-20">
          <Link to="/" className="inline-flex w-fit items-center gap-3" aria-label="Về trang chủ Mascoteach">
            <img src="/images/Logo.png" alt="Mascoteach" className="h-9 w-auto object-contain" />
          </Link>

          <div className="mt-12 lg:mt-16">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-bold text-[#64748B] transition hover:text-brand-blue">
              <ArrowLeft className="h-4 w-4" />
              Quay lại bảng giá
            </Link>

            <h1 className="mt-7 max-w-[620px] font-display text-[36px] font-black leading-[1.03] tracking-[-0.02em] text-brand-navy sm:text-[48px] lg:text-[56px]">
              Kích hoạt Mascoteach Pro
            </h1>
            <p className="mt-4 max-w-[520px] text-base font-medium leading-7 text-[#5D6572]">
              Mở khóa công cụ tạo câu hỏi, trò chơi lớp học và báo cáo tiến độ chỉ trong vài phút.
            </p>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-black tracking-[-0.01em] text-[#22272E]">Chọn gói Pro</h2>
            <div className="mt-7 grid gap-4">
              {plans.map((plan) => {
                const active = plan.id === selectedPlan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={cn(
                      'grid min-h-[126px] grid-cols-[42px_1fr] items-center gap-4 rounded-[16px] border bg-white px-5 text-left transition duration-200 active:translate-y-px sm:grid-cols-[48px_1fr_auto] sm:px-7',
                      active
                        ? 'border-brand-blue shadow-[0_18px_45px_rgba(43,122,181,0.14)]'
                        : 'border-[#CAD2DC] hover:border-brand-mid'
                    )}
                    onClick={() => selectPlan(plan.id)}
                    aria-pressed={active}
                  >
                    <span className={cn('grid h-9 w-9 place-items-center rounded-full border-2', active ? 'border-brand-blue bg-brand-blue' : 'border-[#CAD2DC] bg-white')}>
                      {active && <span className="h-3.5 w-3.5 rounded-full bg-white" />}
                    </span>

                    <span>
                      <span className="block text-lg font-black text-[#24282E]">{plan.label}</span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-[#5D6572]">{plan.description}</span>
                      <span className="mt-1 block text-xs font-black uppercase tracking-[0.08em] text-brand-blue">{plan.note}</span>
                    </span>

                    <span className="col-start-2 text-left sm:col-start-auto sm:text-right">
                      <span className="block text-2xl font-black text-[#24282E]">{plan.priceLabel}</span>
                      <span className="block text-sm font-semibold text-[#5D6572]">{plan.unit}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-[#E4EAF1] px-7 py-8 sm:px-12 lg:border-l lg:border-t-0 lg:px-16 lg:py-20">
          <div className="rounded-[14px] bg-[#E8EBEF] p-1">
            <div className="grid h-14 place-items-center rounded-[11px] bg-white text-base font-black text-[#22272E] shadow-[0_8px_18px_rgba(15,23,42,0.10)]">
              QR PayOS
            </div>
          </div>

          <div className="mt-9">
            <label className="text-base font-black text-[#3F4650]" htmlFor="billed-to">
              Người thanh toán
            </label>
            <input
              id="billed-to"
              value={user?.fullName || user?.email || 'Giáo viên Mascoteach'}
              readOnly
              className="mt-3 h-14 w-full rounded-[13px] border border-[#CAD2DC] bg-[#F9FCFF] px-5 text-base font-bold text-[#24282E] outline-none"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black tracking-[-0.01em] text-[#22272E]">Thanh toán bằng QR</h2>

            <div className="mt-6 rounded-[18px] border border-[#CAD2DC] bg-white p-5 sm:p-6">
              {loading && (
                <div className="grid h-[520px] place-items-center rounded-[14px] border border-dashed border-brand-light bg-white">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" />
                    <p className="mt-4 text-sm font-black text-brand-navy">Đang tạo mã thanh toán PayOS</p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="grid h-[520px] place-items-center rounded-[14px] border border-rose-200 bg-rose-50 px-6 text-center">
                  <div>
                    <p className="text-lg font-black text-rose-700">{error}</p>
                    <button
                      type="button"
                      className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy"
                      onClick={() => setReloadKey((key) => key + 1)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tạo lại mã
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && paymentLink?.checkoutUrl && (
                <>
                  {frameClosed ? (
                    <div className="grid h-[520px] place-items-center rounded-[14px] border border-brand-light bg-surface-blue px-6 text-center">
                      <div>
                        <QrCode className="mx-auto h-10 w-10 text-brand-blue" />
                        <p className="mt-4 text-base font-black text-brand-navy">Khung thanh toán đã đóng</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">
                          Bạn có thể tạo lại mã thanh toán để tiếp tục.
                        </p>
                        <button
                          type="button"
                          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy"
                          onClick={() => setReloadKey((key) => key + 1)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Tạo lại mã
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PayOsEmbeddedCheckout
                      key={`${paymentLink.orderCode}-${paymentLink.checkoutUrl}`}
                      checkoutUrl={paymentLink.checkoutUrl}
                      orderCode={paymentLink.orderCode}
                      onExit={() => setFrameClosed(true)}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-2xl font-black text-[#22272E]">Tổng cộng</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
                  <Clock3 className="h-4 w-4" />
                  {selectedPlan.totalNote}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#24282E]">{selectedPlan.priceLabel}</p>
                <p className="text-sm font-semibold text-[#64748B]">{selectedPlan.unit}</p>
              </div>
            </div>

            {paymentLink?.orderCode && (
              <p className="mt-4 rounded-[11px] bg-brand-light/20 px-4 py-3 text-sm font-bold text-brand-blue">
                Mã đơn hàng: {paymentLink.orderCode}
              </p>
            )}

            <p className="mt-5 flex items-start gap-3 text-sm font-semibold leading-6 text-[#5D6572]">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-brand-blue" />
              Giao dịch được xử lý bảo mật qua PayOS. Gói Pro sẽ được cập nhật tự động sau khi thanh toán được xác nhận.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
