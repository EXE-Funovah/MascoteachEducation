import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import { ArrowLeft, Clock3, Loader2, QrCode, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BILLING_PLAN_CODES,
  BILLING_PLAN_FALLBACKS,
  cancelPaymentOrder,
  createPaymentLink,
  getBillingPlans,
  normalizePlan,
} from '@/services/billingService';
import { cn } from '@/lib/utils';

const PAYOS_ELEMENT_ID = 'payos-embedded-checkout';
const PAYOS_HOSTED_PAGE_ORIGIN = 'https://pay.payos.vn';
const PAYMENT_LINK_REFRESH_GRACE_MS = 3000;
const paymentLinkRequests = new Map();

function getPaymentLink(planCode) {
  const existingRequest = paymentLinkRequests.get(planCode);
  if (existingRequest) return existingRequest;

  const request = createPaymentLink(planCode).finally(() => {
    paymentLinkRequests.delete(planCode);
  });
  paymentLinkRequests.set(planCode, request);
  return request;
}

function getPayOsReturnUrl(returnUrl) {
  const backendReturnUrl = returnUrl?.trim();
  if (backendReturnUrl) {
    return backendReturnUrl;
  }

  const configuredReturnUrl = import.meta.env.VITE_PAYOS_RETURN_URL?.trim();
  if (configuredReturnUrl) {
    return configuredReturnUrl;
  }

  return `${window.location.origin}/checkout`;
}

function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function normalizePayOsCheckoutUrl(value) {
  if (!value) return '';

  const rawUrl = String(value).trim();
  if (!rawUrl) return '';

  try {
    const parsedUrl = new URL(rawUrl);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const paymentLinkId = pathParts[pathParts.length - 1];

    if (parsedUrl.hostname === 'pay.payos.vn' || parsedUrl.hostname.endsWith('.pay.payos.vn')) {
      return parsedUrl.href;
    }

    if (paymentLinkId) {
      return `${PAYOS_HOSTED_PAGE_ORIGIN}/web/${paymentLinkId}`;
    }
  } catch {
    // Fall through and treat plain values as a PayOS payment link id.
  }

  const paymentLinkId = rawUrl.replace(/^\/+/, '').split('?')[0].split('/').filter(Boolean).pop();
  return `${PAYOS_HOSTED_PAGE_ORIGIN}/web/${paymentLinkId || rawUrl}`;
}

function getPlanCode(planParam) {
  if (planParam === 'yearly' || planParam === BILLING_PLAN_CODES.yearly) return BILLING_PLAN_CODES.yearly;
  return BILLING_PLAN_CODES.monthly;
}

function getPlanMeta(planCode, billingPlan = null) {
  const fallback = billingPlan || normalizePlan(
    planCode === BILLING_PLAN_CODES.yearly
      ? BILLING_PLAN_FALLBACKS.PRO_YEARLY
      : BILLING_PLAN_FALLBACKS.PRO_MONTHLY
  );
  const yearlyMonthlyEquivalent = Math.round(fallback.amount / 12);

  if (planCode === BILLING_PLAN_CODES.yearly) {
    return {
      ...fallback,
      id: 'yearly',
      label: 'Gói năm',
      description: 'Thanh toán một lần, tiết kiệm hơn cho cả năm học.',
      priceLabel: formatCurrency(yearlyMonthlyEquivalent, fallback.currency),
      unit: '/ tháng',
      totalLabel: formatCurrency(fallback.amount, fallback.currency),
      totalUnit: '/ năm',
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
    totalLabel: formatCurrency(fallback.amount, fallback.currency),
    totalUnit: '/ tháng',
    note: 'Gia hạn theo tháng',
    totalNote: '30 ngày sử dụng Pro',
  };
}

function PayOsEmbeddedCheckout({ checkoutUrl, orderCode, returnUrl, onExit }) {
  const navigate = useNavigate();
  const payOsReturnUrl = getPayOsReturnUrl(returnUrl);
  const { open, exit } = usePayOS({
    RETURN_URL: payOsReturnUrl,
    ELEMENT_ID: PAYOS_ELEMENT_ID,
    CHECKOUT_URL: checkoutUrl,
    embedded: true,
    onSuccess: () => {
      navigate(`/payment/success?orderCode=${orderCode}`, { replace: true });
    },
    onCancel: () => {
      navigate(`/checkout/cancel?cancel=true&status=CANCELLED&orderCode=${orderCode}`, { replace: true });
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
  }, [checkoutUrl]);

  return (
    <div
      id={PAYOS_ELEMENT_ID}
      className="mx-auto h-[460px] w-full max-w-[520px] overflow-hidden rounded-[14px] border border-[#D7E0EA] bg-white shadow-[0_16px_36px_rgba(27,58,107,0.07)] [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
    />
  );
}

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planParam = searchParams.get('plan');
  const payOsOrderCode = searchParams.get('orderCode');
  const payOsStatus = searchParams.get('status');
  const payOsCancel = searchParams.get('cancel');
  const isPayOsReturn = Boolean(payOsOrderCode && !planParam);
  const planCode = useMemo(() => getPlanCode(planParam), [planParam]);
  const [billingPlans, setBillingPlans] = useState(() => ({
    [BILLING_PLAN_CODES.monthly]: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_MONTHLY),
    [BILLING_PLAN_CODES.yearly]: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_YEARLY),
  }));
  const selectedPlan = useMemo(() => getPlanMeta(planCode, billingPlans[planCode]), [billingPlans, planCode]);
  const plans = useMemo(
    () => [
      getPlanMeta(BILLING_PLAN_CODES.monthly, billingPlans[BILLING_PLAN_CODES.monthly]),
      getPlanMeta(BILLING_PLAN_CODES.yearly, billingPlans[BILLING_PLAN_CODES.yearly]),
    ],
    [billingPlans]
  );
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [frameClosed, setFrameClosed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [paymentLinkRemainingMs, setPaymentLinkRemainingMs] = useState(0);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const lastAutoRefreshKeyRef = useRef('');

  useEffect(() => {
    if (!isPayOsReturn) return;

    const query = searchParams.toString();
    const targetPath = payOsCancel === 'true' || payOsStatus === 'CANCELLED'
      ? '/checkout/cancel'
      : '/payment/success';

    navigate(`${targetPath}${query ? `?${query}` : ''}`, { replace: true });
  }, [isPayOsReturn, navigate, payOsCancel, payOsStatus, searchParams]);

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
        // Keep local fallback prices if plan lookup is unavailable.
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPayOsReturn) return undefined;

    let cancelled = false;

    async function loadPaymentLink() {
      setLoading(true);
      setError('');
      setFrameClosed(false);
      setPaymentLink((current) => (current?.planCode === planCode ? current : null));

      try {
        const response = await getPaymentLink(planCode);
        const checkoutUrl = normalizePayOsCheckoutUrl(response?.checkoutUrl ?? response?.CheckoutUrl);
        const orderCode = response?.orderCode ?? response?.OrderCode;
        const amount = response?.amount ?? response?.Amount;
        const responsePlanCode = response?.planCode ?? response?.PlanCode;
        const returnUrl = response?.returnUrl ?? response?.ReturnUrl;
        const cancelUrl = response?.cancelUrl ?? response?.CancelUrl;
        const expiresAt = response?.expiresAt ?? response?.ExpiresAt;

        if (!checkoutUrl || !orderCode) {
          throw new Error('Không thể tạo đơn thanh toán. Vui lòng thử lại.');
        }

        if (!cancelled) {
          setPaymentLink({
            ...response,
            checkoutUrl,
            orderCode,
            amount,
            planCode: responsePlanCode || planCode,
            returnUrl,
            cancelUrl,
            expiresAt,
          });
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
  }, [isPayOsReturn, planCode, reloadKey]);

  useEffect(() => {
    const expiresAt = paymentLink?.expiresAt ? new Date(paymentLink.expiresAt).getTime() : null;
    if (!expiresAt || Number.isNaN(expiresAt) || loading || error) {
      setPaymentLinkRemainingMs(0);
      return undefined;
    }

    let refreshTimerId;
    const autoRefreshKey = `${paymentLink.orderCode}-${paymentLink.expiresAt}`;

    function tick() {
      const nextRemainingMs = Math.max(0, expiresAt - Date.now());
      setPaymentLinkRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && lastAutoRefreshKeyRef.current !== autoRefreshKey) {
        lastAutoRefreshKeyRef.current = autoRefreshKey;
        refreshTimerId = window.setTimeout(() => {
          setReloadKey((key) => key + 1);
        }, PAYMENT_LINK_REFRESH_GRACE_MS);
      }
    }

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(timerId);
      if (refreshTimerId) window.clearTimeout(refreshTimerId);
    };
  }, [error, loading, paymentLink?.expiresAt, paymentLink?.orderCode]);

  function selectPlan(planId) {
    setSearchParams({ plan: planId });
  }

  async function cancelCurrentPayment() {
    if (!paymentLink?.orderCode || cancelLoading) return;

    setCancelLoading(true);
    setCancelError('');

    try {
      await cancelPaymentOrder(paymentLink.orderCode);
      navigate(`/checkout/cancel?cancel=handled&status=CANCELLED&orderCode=${paymentLink.orderCode}`, { replace: true });
    } catch (err) {
      setCancelError(err.message || 'Không thể hủy đơn thanh toán. Vui lòng thử lại.');
      setCancelLoading(false);
    }
  }

  const payableAmount = paymentLink?.planCode === planCode && paymentLink?.amount
    ? paymentLink.amount
    : selectedPlan.amount;
  const totalLabel = formatCurrency(payableAmount, selectedPlan.currency);
  const paymentExpiryLabel = paymentLink?.expiresAt
    ? `Mã QR còn hiệu lực ${formatCountdown(paymentLinkRemainingMs)}`
    : selectedPlan.totalNote;
  const hasVisiblePaymentLink = Boolean(paymentLink?.checkoutUrl);

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

            <div className="mt-6 rounded-[18px] border border-[#CAD2DC] bg-white p-4 sm:p-5">
              {loading && !hasVisiblePaymentLink && (
                <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-dashed border-brand-light bg-white">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" />
                    <p className="mt-4 text-sm font-black text-brand-navy">Đang tạo mã thanh toán PayOS</p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-rose-200 bg-rose-50 px-6 text-center">
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

              {!error && hasVisiblePaymentLink && (
                <>
                  {frameClosed ? (
                    <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-brand-light bg-surface-blue px-6 text-center">
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
                      returnUrl={paymentLink.returnUrl}
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
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#64748B]" aria-live="polite">
                  <Clock3 className="h-4 w-4" />
                  {loading && paymentLink?.expiresAt ? 'Đang làm mới mã QR...' : paymentExpiryLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#24282E]">{totalLabel}</p>
                <p className="text-sm font-semibold text-[#64748B]">{selectedPlan.totalUnit}</p>
              </div>
            </div>

            {paymentLink?.orderCode && (
              <div className="mt-4 flex flex-col gap-3 rounded-[11px] bg-brand-light/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-brand-blue">
                  Mã đơn hàng: {paymentLink.orderCode}
                </p>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[9px] border border-rose-200 bg-white px-3 text-sm font-black text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={cancelCurrentPayment}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  {cancelLoading ? 'Đang hủy' : 'Hủy thanh toán'}
                </button>
              </div>
            )}

            {cancelError && (
              <p className="mt-3 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {cancelError}
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
