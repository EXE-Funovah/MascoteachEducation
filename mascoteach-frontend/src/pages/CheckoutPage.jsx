import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock3,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BILLING_PLAN_CODES,
  BILLING_PLAN_FALLBACKS,
  cancelPaymentOrder,
  createPaymentLink,
  getBillingPlans,
  getMyBillingOrders,
  normalizePlan,
} from '@/services/billingService';
import {
  formatBillingCurrency,
  getLatestPendingOrder,
  getPlanCodeFromPlanId,
  getPlanIdFromPlanCode,
  getPlanLabel,
} from '@/lib/billingUi';
import { cn } from '@/lib/utils';

const PAYOS_ELEMENT_ID = 'payos-embedded-checkout';
const PAYOS_HOSTED_PAGE_ORIGIN = 'https://pay.payos.vn';
const CHECKOUT_PLAN_STORAGE_KEY = 'mascoteach_checkout_plan';
const paymentLinkRequests = new Map();

const PRO_BENEFITS = [
  'Tạo bộ câu hỏi và trò chơi lớp học nhanh hơn.',
  'Mở khóa trải nghiệm Pro cho thư viện nội dung.',
  'Quản lý tiến độ và hoạt động lớp học thuận tiện hơn.',
  'Ưu tiên luồng sử dụng ổn định cho giáo viên trên Mascoteach.',
];

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
  if (backendReturnUrl) return backendReturnUrl;

  const configuredReturnUrl = import.meta.env.VITE_PAYOS_RETURN_URL?.trim();
  if (configuredReturnUrl) return configuredReturnUrl;

  return `${window.location.origin}/checkout`;
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
      label: 'Pro Yearly',
      eyebrow: 'Gói năm',
      description: 'Phù hợp khi bạn muốn chốt gói dài hạn cho cả năm học.',
      priceLabel: formatBillingCurrency(yearlyMonthlyEquivalent, fallback.currency),
      unit: '/ tháng',
      totalLabel: formatBillingCurrency(fallback.amount, fallback.currency),
      totalUnit: 'Thanh toán / năm',
      detail: '365 ngày sử dụng Pro',
      badge: 'Tiết kiệm hơn',
    };
  }

  return {
    ...fallback,
    id: 'monthly',
    label: 'Pro Monthly',
    eyebrow: 'Gói tháng',
    description: 'Linh hoạt khi bạn muốn nâng cấp và gia hạn theo từng tháng.',
    priceLabel: formatBillingCurrency(fallback.amount, fallback.currency),
    unit: '/ tháng',
    totalLabel: formatBillingCurrency(fallback.amount, fallback.currency),
    totalUnit: 'Thanh toán / tháng',
    detail: '30 ngày sử dụng Pro',
    badge: 'Linh hoạt',
  };
}

function extractRetryAfterSeconds(error) {
  const value = error?.data?.retryAfterSeconds ?? error?.data?.RetryAfterSeconds;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizePaymentLinkResponse(response, fallbackPlanCode) {
  const checkoutUrl = normalizePayOsCheckoutUrl(response?.checkoutUrl);
  const orderCode = response?.orderCode;

  if (!checkoutUrl || !orderCode) {
    throw new Error('Không thể tạo đơn thanh toán. Vui lòng thử lại.');
  }

  return {
    ...response,
    checkoutUrl,
    orderCode,
    planCode: response?.planCode || fallbackPlanCode,
    amount: response?.amount ?? null,
    expiresAt: response?.expiresAt ?? null,
  };
}

function buildPendingOrderFromPaymentLink(paymentLink, previousOrder) {
  return {
    id: previousOrder?.id ?? paymentLink.orderCode,
    orderCode: paymentLink.orderCode,
    planCode: paymentLink.planCode,
    amount: paymentLink.amount ?? previousOrder?.amount ?? 0,
    currency: previousOrder?.currency ?? 'VND',
    status: 'Pending',
    provider: previousOrder?.provider ?? 'PayOS',
    checkoutUrl: paymentLink.checkoutUrl,
    createdAt: previousOrder?.createdAt ?? new Date().toISOString(),
  };
}

const PayOsEmbeddedCheckout = memo(function PayOsEmbeddedCheckout({
  checkoutUrl,
  orderCode,
  planId,
  returnUrl,
  onExit,
}) {
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
      navigate(`/checkout/cancel?cancel=true&status=CANCELLED&orderCode=${orderCode}&plan=${planId}`, { replace: true });
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
  }, [checkoutUrl, exit, open]);

  return (
    <div
      id={PAYOS_ELEMENT_ID}
      className="mx-auto h-[500px] w-full overflow-hidden rounded-[18px] border border-[#DCE6F2] bg-white shadow-[0_12px_28px_rgba(27,58,107,0.08)] [&_iframe]:block [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
    />
  );
});

function PageSkeleton() {
  return (
    <main className="min-h-[100dvh] bg-gradient-subtle px-4 py-7 text-[#24282E] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-[1180px] rounded-[28px] border border-white/80 bg-[#F9FCFF] p-8 shadow-[0_34px_100px_rgba(27,58,107,0.18)] sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="h-5 w-28 rounded-full bg-brand-light/35" />
            <div className="h-14 w-full max-w-[520px] rounded-[18px] bg-brand-light/30" />
            <div className="h-6 w-full max-w-[430px] rounded-full bg-brand-light/20" />
            <div className="mt-8 grid gap-4">
              <div className="h-[170px] rounded-[22px] bg-white shadow-[0_12px_24px_rgba(27,58,107,0.05)]" />
              <div className="h-[170px] rounded-[22px] bg-white shadow-[0_12px_24px_rgba(27,58,107,0.05)]" />
            </div>
          </div>
          <div className="h-[560px] rounded-[24px] bg-white shadow-[0_12px_24px_rgba(27,58,107,0.05)]" />
        </div>
      </section>
    </main>
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
  const [selectedPlanId, setSelectedPlanId] = useState(() => getPlanIdFromPlanCode(getPlanCode(planParam)));
  const selectedPlanCode = useMemo(() => getPlanCodeFromPlanId(selectedPlanId), [selectedPlanId]);
  const [billingPlans, setBillingPlans] = useState(() => ({
    [BILLING_PLAN_CODES.monthly]: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_MONTHLY),
    [BILLING_PLAN_CODES.yearly]: normalizePlan(BILLING_PLAN_FALLBACKS.PRO_YEARLY),
  }));
  const selectedPlan = useMemo(() => getPlanMeta(selectedPlanCode, billingPlans[selectedPlanCode]), [billingPlans, selectedPlanCode]);
  const plans = useMemo(
    () => [
      getPlanMeta(BILLING_PLAN_CODES.monthly, billingPlans[BILLING_PLAN_CODES.monthly]),
      getPlanMeta(BILLING_PLAN_CODES.yearly, billingPlans[BILLING_PLAN_CODES.yearly]),
    ],
    [billingPlans]
  );
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);
  const [error, setError] = useState('');
  const [frameClosed, setFrameClosed] = useState(false);
  const [paymentLinkRemainingMs, setPaymentLinkRemainingMs] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmSwitchPlanOpen, setConfirmSwitchPlanOpen] = useState(false);
  const [retryAfterUntilMs, setRetryAfterUntilMs] = useState(0);
  const [retryAfterRemainingMs, setRetryAfterRemainingMs] = useState(0);
  const mountedRef = useRef(true);
  const expiredOrderSyncRef = useRef('');
  const searchParamsRef = useRef(searchParams);

  const handlePaymentExit = useCallback(() => {
    setFrameClosed(true);
  }, []);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    if (!isPayOsReturn) return;

    const query = searchParams.toString();
    const targetPath = payOsCancel === 'true' || payOsStatus === 'CANCELLED'
      ? '/checkout/cancel'
      : '/payment/success';

    navigate(`${targetPath}${query ? `?${query}` : ''}`, { replace: true });
  }, [isPayOsReturn, navigate, payOsCancel, payOsStatus, searchParams]);

  useEffect(() => {
    if (isPayOsReturn) return;
    window.sessionStorage.setItem(CHECKOUT_PLAN_STORAGE_KEY, selectedPlanId);
  }, [isPayOsReturn, selectedPlanId]);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const plansResponse = await getBillingPlans();
        if (cancelled || plansResponse.length === 0) return;

        setBillingPlans((current) => {
          const next = { ...current };
          plansResponse.forEach((plan) => {
            if (plan.planCode) next[plan.planCode] = plan;
          });
          return next;
        });
      } catch {
        // Keep fallback pricing if plan lookup is unavailable.
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSelectedPlan = useCallback((nextPlanId, options = {}) => {
    setSelectedPlanId(nextPlanId);

    if (!isPayOsReturn) {
      window.sessionStorage.setItem(CHECKOUT_PLAN_STORAGE_KEY, nextPlanId);
    }

    const currentSearchParams = searchParamsRef.current;
    const currentPlanId = getPlanIdFromPlanCode(getPlanCode(currentSearchParams.get('plan')));
    if (currentPlanId === nextPlanId) {
      return;
    }

    const nextSearchParams = new URLSearchParams(currentSearchParams);
    nextSearchParams.set('plan', nextPlanId);
    setSearchParams(nextSearchParams, { replace: options.replace ?? false });
  }, [isPayOsReturn, setSearchParams]);

  async function openPaymentLinkForPlan(planCode) {
    setPaymentModalOpen(true);
    setPaymentLinkLoading(true);
    setError('');
    setFrameClosed(false);
    setConfirmSwitchPlanOpen(false);

    try {
      const nextPaymentLink = normalizePaymentLinkResponse(await getPaymentLink(planCode), planCode);
      if (!mountedRef.current) return null;

      const expiresAtMs = nextPaymentLink.expiresAt ? new Date(nextPaymentLink.expiresAt).getTime() : NaN;
      expiredOrderSyncRef.current = '';
      setPaymentLink(nextPaymentLink);
      setPendingOrder((current) => buildPendingOrderFromPaymentLink(nextPaymentLink, current));
      setPaymentLinkRemainingMs(Number.isNaN(expiresAtMs) ? 0 : Math.max(0, expiresAtMs - Date.now()));
      setRetryAfterUntilMs(0);
      setRetryAfterRemainingMs(0);
      return nextPaymentLink;
    } catch (err) {
      if (!mountedRef.current) return null;

      const retryAfterSeconds = extractRetryAfterSeconds(err);
      if (retryAfterSeconds > 0) {
        const nextRetryUntilMs = Date.now() + (retryAfterSeconds * 1000);
        setRetryAfterUntilMs(nextRetryUntilMs);
        setRetryAfterRemainingMs(retryAfterSeconds * 1000);
      }

      setError(err.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
      return null;
    } finally {
      if (mountedRef.current) {
        setPaymentLinkLoading(false);
      }
    }
  }

  async function refreshOrdersState(options = {}) {
    const {
      showMainLoader = false,
      clearError = false,
      syncSelectedPlanWithPending = false,
    } = options;

    if (showMainLoader) {
      setLoading(true);
    } else {
      setRefreshingOrders(true);
    }

    if (clearError) {
      setError('');
    }

    try {
      const orders = await getMyBillingOrders();
      if (!mountedRef.current) return null;

      const latestPendingOrder = getLatestPendingOrder(orders);
      setPendingOrder(latestPendingOrder);

      if (!latestPendingOrder && paymentLink?.orderCode === expiredOrderSyncRef.current) {
        setPaymentLink(null);
      }

      if (latestPendingOrder?.planCode && syncSelectedPlanWithPending) {
        const pendingPlanId = getPlanIdFromPlanCode(latestPendingOrder.planCode);
        updateSelectedPlan(pendingPlanId, { replace: true });
      }

      return latestPendingOrder;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Không thể tải thông tin thanh toán. Vui lòng thử lại.');
      }
      return null;
    } finally {
      if (!mountedRef.current) return;

      if (showMainLoader) {
        setLoading(false);
      } else {
        setRefreshingOrders(false);
      }
    }
  }

  useEffect(() => {
    if (isPayOsReturn) return undefined;

    let cancelled = false;

    async function bootstrapCheckout() {
      setLoading(true);
      setError('');

      try {
        const orders = await getMyBillingOrders();
        if (cancelled || !mountedRef.current) return;

        const latestPendingOrder = getLatestPendingOrder(orders);
        setPendingOrder(latestPendingOrder);

        if (latestPendingOrder?.planCode) {
          const pendingPlanId = getPlanIdFromPlanCode(latestPendingOrder.planCode);
          updateSelectedPlan(pendingPlanId, { replace: true });
        }
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          setError(err.message || 'Không thể tải thông tin thanh toán. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
        }
      }
    }

    bootstrapCheckout();
    return () => {
      cancelled = true;
    };
  }, [isPayOsReturn, updateSelectedPlan]);

  useEffect(() => {
    if (!retryAfterUntilMs || retryAfterUntilMs <= Date.now()) {
      setRetryAfterRemainingMs(0);
      return undefined;
    }

    function tick() {
      const nextRemainingMs = Math.max(0, retryAfterUntilMs - Date.now());
      setRetryAfterRemainingMs(nextRemainingMs);
      if (nextRemainingMs === 0) {
        setRetryAfterUntilMs(0);
      }
    }

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [retryAfterUntilMs]);

  useEffect(() => {
    const expiresAtMs = paymentLink?.expiresAt ? new Date(paymentLink.expiresAt).getTime() : NaN;
    if (!paymentLink?.orderCode || Number.isNaN(expiresAtMs)) {
      setPaymentLinkRemainingMs(0);
      expiredOrderSyncRef.current = '';
      return undefined;
    }

    function tick() {
      const nextRemainingMs = Math.max(0, expiresAtMs - Date.now());
      setPaymentLinkRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && expiredOrderSyncRef.current !== paymentLink.orderCode) {
        expiredOrderSyncRef.current = paymentLink.orderCode;
        refreshOrdersState();
      }
    }

    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, [paymentLink?.expiresAt, paymentLink?.orderCode]);

  const hasPendingOrder = Boolean(pendingOrder?.orderCode);
  const hasDifferentPlanPending = hasPendingOrder && pendingOrder.planCode !== selectedPlanCode;
  const hasSamePlanPending = hasPendingOrder && pendingOrder.planCode === selectedPlanCode;
  const paymentLinkMatchesSelection = paymentLink?.planCode === selectedPlanCode;
  const paymentLinkExpired = paymentLinkMatchesSelection && Boolean(paymentLink?.expiresAt) && paymentLinkRemainingMs === 0;
  const hasVisiblePaymentLink = Boolean(paymentLink?.checkoutUrl) && paymentLinkMatchesSelection;
  const showPaymentFrame = hasVisiblePaymentLink && !frameClosed && !paymentLinkExpired;
  const controlsDisabled = loading || paymentLinkLoading || cancelLoading;
  const payableAmount = paymentLinkMatchesSelection && paymentLink?.amount
    ? paymentLink.amount
    : selectedPlan.amount;
  const totalLabel = formatBillingCurrency(payableAmount, selectedPlan.currency);
  const pendingOrderCode = paymentLinkMatchesSelection ? paymentLink?.orderCode : pendingOrder?.orderCode;
  const pendingOrderLabel = pendingOrder?.planCode ? getPlanLabel(pendingOrder.planCode) : null;
  const payButtonLabel = paymentLinkExpired
    ? 'Tạo mã mới'
    : hasSamePlanPending
      ? 'Tiếp tục thanh toán'
      : 'Thanh toán';

  async function handleCreateOrReusePayment() {
    if (controlsDisabled || retryAfterRemainingMs > 0) return;

    if (hasDifferentPlanPending) {
      setConfirmSwitchPlanOpen(true);
      return;
    }

    await openPaymentLinkForPlan(selectedPlanCode);
  }

  async function handleConfirmSwitchPlan() {
    if (!pendingOrder?.orderCode || controlsDisabled) return;

    setCancelLoading(true);
    setError('');
    setConfirmSwitchPlanOpen(false);
    setPaymentModalOpen(true);

    try {
      await cancelPaymentOrder(pendingOrder.orderCode);
      if (!mountedRef.current) return;

      setPendingOrder(null);
      if (paymentLink?.orderCode === pendingOrder.orderCode) {
        setPaymentLink(null);
      }

      await openPaymentLinkForPlan(selectedPlanCode);
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Không thể huỷ order cũ để tạo thanh toán mới.');
      }
    } finally {
      if (mountedRef.current) {
        setCancelLoading(false);
      }
    }
  }

  async function cancelCurrentPayment() {
    const orderCode = paymentLink?.orderCode || pendingOrder?.orderCode;
    if (!orderCode || cancelLoading) return;

    setCancelLoading(true);
    setError('');
    setConfirmCancelOpen(false);

    try {
      await cancelPaymentOrder(orderCode);
      navigate(`/checkout/cancel?cancel=handled&status=CANCELLED&orderCode=${orderCode}&plan=${selectedPlan.id}`, { replace: true });
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Không thể huỷ đơn thanh toán. Vui lòng thử lại.');
      }
      setCancelLoading(false);
    }
  }

  function closePaymentModal() {
    if (paymentLinkLoading || cancelLoading) return;
    setPaymentModalOpen(false);
  }

  function renderPaymentModalBody() {
    if (paymentLinkLoading || cancelLoading) {
      return (
        <div className="grid h-[500px] place-items-center rounded-[18px] border border-dashed border-brand-light bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-blue" />
            <p className="mt-4 text-base font-medium text-brand-navy">
              {cancelLoading ? 'Đang xử lý order cũ' : 'Đang chuẩn bị QR PayOS'}
            </p>
          </div>
        </div>
      );
    }

    if (showPaymentFrame) {
      return (
        <PayOsEmbeddedCheckout
          key={`${paymentLink.orderCode}-${paymentLink.checkoutUrl}`}
          checkoutUrl={paymentLink.checkoutUrl}
          orderCode={paymentLink.orderCode}
          planId={selectedPlan.id}
          returnUrl={paymentLink.returnUrl}
          onExit={handlePaymentExit}
        />
      );
    }

    if (frameClosed && hasVisiblePaymentLink && !paymentLinkExpired) {
      return (
        <div className="grid h-[500px] place-items-center rounded-[18px] border border-brand-light bg-surface-blue px-6 text-center">
          <div>
            <QrCode className="mx-auto h-10 w-10 text-brand-blue" />
            <p className="mt-4 text-lg font-medium text-brand-navy">Khung thanh toán đã đóng</p>
            <p className="mt-2 text-sm font-normal leading-6 text-[#64748B]">
              QR vẫn còn hiệu lực, bạn có thể mở lại để tiếp tục thanh toán.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[999px] bg-brand-blue px-5 text-sm font-medium text-white transition hover:bg-brand-navy"
              onClick={() => setFrameClosed(false)}
            >
              <RefreshCw className="h-4 w-4" />
              Mở lại QR
            </button>
          </div>
        </div>
      );
    }

    if (paymentLinkExpired) {
      return (
        <div className="grid h-[500px] place-items-center rounded-[18px] border border-rose-200 bg-rose-50 px-6 text-center">
          <div>
            <Clock3 className="mx-auto h-10 w-10 text-rose-600" />
            <p className="mt-4 text-lg font-medium text-rose-700">Mã QR đã hết hạn</p>
            <p className="mt-2 text-sm font-normal leading-6 text-rose-700">
              Bấm tạo mã mới nếu bạn muốn thanh toán lại cho đơn này.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[999px] bg-brand-blue px-5 text-sm font-medium text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCreateOrReusePayment}
              disabled={retryAfterRemainingMs > 0}
            >
              <RefreshCw className="h-4 w-4" />
              {retryAfterRemainingMs > 0 ? `Chờ ${formatCountdown(retryAfterRemainingMs)}` : 'Tạo mã mới'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid h-[500px] place-items-center rounded-[18px] border border-dashed border-brand-light bg-white px-6 text-center">
        <div>
          <AlertCircle className="mx-auto h-10 w-10 text-brand-blue" />
          <p className="mt-4 text-lg font-medium text-brand-navy">Chưa có mã thanh toán</p>
          <p className="mt-2 text-sm font-normal leading-6 text-[#64748B]">
            Hãy quay lại và bấm thanh toán để tạo QR PayOS.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <main className="min-h-[100dvh] bg-[#E9EDF5] px-4 py-7 text-[#24282E] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] border border-white/80 bg-[#F6F9FD] shadow-[0_34px_100px_rgba(27,58,107,0.18)]">
        <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
          <div className="border-b border-white/80 bg-[#F1F5FA] px-7 py-8 sm:px-10 lg:border-b-0 lg:border-r lg:border-r-white/80 lg:px-12 lg:py-12">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-[#52657D] transition hover:text-brand-blue">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-[#D9E3EE] bg-white text-[#52657D]">
                <ArrowLeft className="h-4 w-4" />
              </span>
              Back to pricing
            </Link>

            <div className="mt-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7B8CA3]">
                Product Information and Review
              </p>
              <p className="mt-2 max-w-[520px] text-sm font-normal leading-6 text-[#748499]">
                Chọn giữa gói tháng hoặc gói năm cho Mascoteach Pro. Sau khi bấm thanh toán, hệ thống mới tạo QR PayOS trong modal.
              </p>
            </div>

            <div className="mt-7 grid gap-4">
              {plans.map((plan) => {
                const active = plan.id === selectedPlan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    className={cn(
                      'rounded-[22px] border bg-white p-5 text-left transition duration-200',
                      active
                        ? 'border-brand-mid/70 shadow-[0_18px_42px_rgba(27,58,107,0.08)]'
                        : 'border-white/90 hover:border-brand-light/80 hover:shadow-[0_14px_30px_rgba(27,58,107,0.05)]'
                    )}
                    onClick={() => updateSelectedPlan(plan.id)}
                    disabled={paymentLinkLoading || cancelLoading}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className={cn(
                          'grid h-16 w-16 flex-none place-items-center rounded-[18px] border',
                          active ? 'border-brand-light bg-brand-light/25 text-brand-blue' : 'border-[#E6EDF5] bg-[#F7FAFD] text-[#8AA0BB]'
                        )}>
                          <ShieldCheck className="h-7 w-7" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-medium text-[#1F2A37]">{plan.label}</p>
                            <span className="rounded-full bg-brand-light/20 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-blue">
                              {plan.badge}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-normal leading-6 text-[#748499]">
                            {plan.description}
                          </p>
                          <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-[#8DA2BC]">
                            {plan.detail}
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-2xl font-medium text-[#1F2A37]">{plan.priceLabel}</p>
                        <p className="mt-1 text-sm font-normal text-[#748499]">{plan.unit}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 border-t border-[#EEF3F8] pt-5">
                      {PRO_BENEFITS.map((benefit) => (
                        <div key={`${plan.id}-${benefit}`} className="flex items-start gap-3 text-sm font-normal leading-6 text-[#52657D]">
                          <span className={cn(
                            'mt-1 grid h-5 w-5 flex-none place-items-center rounded-full border',
                            active ? 'border-brand-blue bg-brand-blue text-white' : 'border-[#D4DFEB] bg-white text-[#7B8CA3]'
                          )}>
                            <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                          </span>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {hasDifferentPlanPending && (
              <div className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Bạn có một order chưa thanh toán.</p>
                    <p className="mt-1 text-sm font-normal leading-6 text-amber-800">
                      Nếu tạo order mới cho gói <span className="font-medium">{selectedPlan.eyebrow}</span>, order cũ
                      {pendingOrderLabel ? ` (${pendingOrderLabel})` : ''} sẽ bị huỷ trước.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {hasSamePlanPending && (
              <div className="mt-6 rounded-[20px] border border-brand-light/70 bg-brand-light/15 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-5 w-5 flex-none text-brand-blue" />
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Bạn đang có một giao dịch pending cho gói này.</p>
                    <p className="mt-1 text-sm font-normal leading-6 text-[#52657D]">
                      Bấm thanh toán để lấy lại QR còn hiệu lực cho order <span className="font-medium">{pendingOrderCode}</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white px-7 py-8 sm:px-10 lg:px-12 lg:py-12">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7B8CA3]">
              Payment Details
            </p>
            <p className="mt-2 max-w-[420px] text-sm font-normal leading-6 text-[#748499]">
              Hoàn tất thanh toán cho gói Pro bằng PayOS. Sau khi bấm thanh toán, Mascoteach sẽ mở modal chứa QR và thông tin chuyển khoản.
            </p>

            <div className="mt-8">
              <label className="text-sm font-medium text-[#1F2A37]">Selected Product</label>
              <div className="mt-3 rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-[#1F2A37]">{selectedPlan.label}</p>
                    <p className="mt-1 text-sm font-normal leading-6 text-[#748499]">
                      {selectedPlan.description}
                    </p>
                  </div>
                  <span className="text-base font-medium text-[#1F2A37]">{selectedPlan.totalLabel}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-[#1F2A37]">Select Payment Method</label>
              <div className="mt-3 rounded-[18px] border border-[#1F2A37] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-brand-light bg-brand-light/15 text-brand-blue">
                    <WalletCards className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#1F2A37]">PayOS</p>
                    <p className="mt-1 text-sm font-normal leading-6 text-[#748499]">
                      Hệ thống chỉ hỗ trợ thanh toán qua PayOS ở bước này.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-[#1F2A37]">Customer Information</label>
              <div className="mt-3 grid gap-3">
                <div className="rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Name</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">
                    {user?.fullName || 'Giáo viên Mascoteach'}
                  </p>
                </div>
                <div className="rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Email</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">
                    {user?.email || 'Không có email'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#EEF3F8] pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 text-[#52657D]">
                  <span className="font-normal">Sub Total</span>
                  <span className="font-medium text-[#1F2A37]">{selectedPlan.totalLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#52657D]">
                  <span className="font-normal">Payment Method</span>
                  <span className="font-medium text-[#1F2A37]">PayOS</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#1F2A37]">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-base font-medium">{totalLabel}</span>
                </div>
              </div>

              {retryAfterRemainingMs > 0 && (
                <div className="mt-5 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-normal leading-6 text-rose-700">
                  Bạn đã chạm giới hạn tạo QR. Vui lòng chờ {formatCountdown(retryAfterRemainingMs)} rồi thử lại.
                </div>
              )}

              {error && !paymentModalOpen && (
                <div className="mt-5 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-normal leading-6 text-rose-700">
                  {error}
                </div>
              )}

              {pendingOrderCode && (
                <div className="mt-5 rounded-[18px] border border-brand-light/70 bg-brand-light/15 px-4 py-4">
                  <p className="text-sm font-medium text-brand-navy">Mã đơn hiện tại</p>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-normal text-[#52657D]">{pendingOrderCode}</p>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[999px] border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => setConfirmCancelOpen(true)}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      {cancelLoading ? 'Đang huỷ' : 'Huỷ thanh toán'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[999px] bg-[#1E293B] px-5 text-sm font-medium text-white transition hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreateOrReusePayment}
                disabled={controlsDisabled || retryAfterRemainingMs > 0}
              >
                {(paymentLinkLoading || cancelLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {payButtonLabel}
              </button>

              <p className="mt-5 flex items-start gap-3 text-sm font-normal leading-6 text-[#748499]">
                <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-brand-blue" />
                Thanh toán được xử lý an toàn qua PayOS. Mascoteach chỉ nâng cấp Pro sau khi backend webhook xác nhận thành công.
              </p>
            </div>
          </div>
        </div>
      </section>

      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/52 px-4 py-6 backdrop-blur-[6px]" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
          <div className="w-full max-w-[1120px] overflow-hidden rounded-[28px] border border-white/70 bg-[#F7FAFD] shadow-[0_34px_100px_rgba(27,58,107,0.24)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E6EDF5] px-6 py-5 sm:px-8">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#7B8CA3]">
                  Payment Details
                </p>
                <h2 id="payment-modal-title" className="mt-2 text-2xl font-medium text-[#1F2A37]">
                  {selectedPlan.label}
                </h2>
                <p className="mt-2 max-w-[520px] text-sm font-normal leading-6 text-[#748499]">
                  QR và thông tin thanh toán chỉ xuất hiện ở modal này sau khi bạn bấm thanh toán ở trang checkout.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D7E0EA] bg-white text-[#52657D] transition hover:bg-[#F8FBFE] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={closePaymentModal}
                disabled={paymentLinkLoading || cancelLoading}
                aria-label="Đóng modal thanh toán"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[320px_1fr]">
              <aside className="rounded-[22px] border border-[#DCE6F2] bg-white p-5 shadow-[0_14px_36px_rgba(27,58,107,0.08)]">
                <div className="rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Plan</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">{selectedPlan.eyebrow}</p>
                </div>

                <div className="mt-3 rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Customer</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">{user?.fullName || 'Giáo viên Mascoteach'}</p>
                  <p className="mt-1 text-sm font-normal text-[#748499]">{user?.email || 'Không có email'}</p>
                </div>

                <div className="mt-3 rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Order</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">{pendingOrderCode || 'Đang tạo'}</p>
                </div>

                <div className="mt-3 rounded-[18px] border border-[#E6EDF5] bg-[#FAFCFE] px-4 py-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8DA2BC]">Total</p>
                  <p className="mt-2 text-base font-medium text-[#1F2A37]">{totalLabel}</p>
                  <p className="mt-1 text-sm font-normal text-[#748499]">Thanh toán qua PayOS</p>
                </div>

                <div className="mt-4 rounded-[18px] border border-brand-light/70 bg-brand-light/15 px-4 py-4">
                  <p className="text-sm font-medium text-brand-navy">
                    {paymentLinkExpired
                      ? 'Mã QR đã hết hạn'
                      : showPaymentFrame && paymentLink?.expiresAt
                        ? `QR còn hiệu lực ${formatCountdown(paymentLinkRemainingMs)}`
                        : retryAfterRemainingMs > 0
                          ? `Đang chờ tạo lại ${formatCountdown(retryAfterRemainingMs)}`
                          : 'QR sẽ xuất hiện ở khung bên phải'}
                  </p>
                  <p className="mt-2 text-sm font-normal leading-6 text-[#52657D]">
                    Không xác nhận Pro ở frontend. Hệ thống chỉ nâng cấp sau khi webhook từ PayOS được backend xử lý xong.
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-normal leading-6 text-rose-700">
                    {error}
                  </div>
                )}

                {pendingOrderCode && (
                  <button
                    type="button"
                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[999px] border border-rose-200 bg-white px-5 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => setConfirmCancelOpen(true)}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    {cancelLoading ? 'Đang huỷ' : 'Huỷ thanh toán'}
                  </button>
                )}
              </aside>

              <div className="rounded-[22px] border border-[#DCE6F2] bg-white p-5 shadow-[0_14px_36px_rgba(27,58,107,0.08)]">
                {renderPaymentModalBody()}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmSwitchPlanOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101828]/45 px-4 backdrop-blur-[6px]" role="dialog" aria-modal="true" aria-labelledby="switch-plan-title">
          <div className="w-full max-w-[520px] rounded-[22px] border border-[#E5D9C7] bg-white shadow-[0_26px_80px_rgba(27,58,107,0.22)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-[12px] bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8A94A6]">
                    Order đang chờ thanh toán
                  </p>
                  <h2 id="switch-plan-title" className="mt-2 text-xl font-medium text-[#22272E]">
                    Tạo order mới cho gói này?
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-normal leading-6 text-[#5D6572]">
                Bạn có một order chưa thanh toán. Nếu tạo order mới cho <span className="font-medium">{selectedPlan.eyebrow}</span>, order cũ
                {pendingOrderLabel ? ` (${pendingOrderLabel})` : ''} sẽ bị huỷ trước.
              </p>

              <div className="mt-4 grid gap-2 rounded-[16px] border border-[#E5EAF1] bg-[#F8FBFE] px-4 py-3 text-sm">
                {pendingOrder?.orderCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-normal text-[#64748B]">Mã đơn cũ</span>
                    <span className="font-medium text-[#24282E]">{pendingOrder.orderCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="font-normal text-[#64748B]">Gói mới</span>
                  <span className="font-medium text-[#24282E]">{selectedPlan.eyebrow}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[999px] border border-[#CAD2DC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F5F8FC]"
                onClick={() => setConfirmSwitchPlanOpen(false)}
                disabled={cancelLoading || paymentLinkLoading}
              >
                Giữ order cũ
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[999px] bg-[#D97706] px-5 text-sm font-medium text-white transition hover:bg-[#B45309] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleConfirmSwitchPlan}
                disabled={cancelLoading || paymentLinkLoading}
              >
                {(cancelLoading || paymentLinkLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                Huỷ order cũ và tạo mới
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCancelOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#101828]/45 px-4 backdrop-blur-[6px]" role="dialog" aria-modal="true" aria-labelledby="cancel-payment-title">
          <div className="w-full max-w-[480px] rounded-[22px] border border-[#E5D1D7] bg-white shadow-[0_26px_80px_rgba(27,58,107,0.22)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-[12px] bg-[#FFF1F3] text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#8A94A6]">
                    Đơn đang chờ thanh toán
                  </p>
                  <h2 id="cancel-payment-title" className="mt-2 text-xl font-medium text-[#22272E]">
                    Huỷ mã thanh toán này?
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-normal leading-6 text-[#5D6572]">
                Mã QR hiện tại sẽ không còn dùng được. Bạn có thể tạo lại mã mới bất cứ lúc nào nếu muốn thanh toán lại.
              </p>

              <div className="mt-4 grid gap-2 rounded-[16px] border border-[#E5EAF1] bg-[#F8FBFE] px-4 py-3 text-sm">
                {pendingOrderCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-normal text-[#64748B]">Mã đơn</span>
                    <span className="font-medium text-[#24282E]">{pendingOrderCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="font-normal text-[#64748B]">Số tiền</span>
                  <span className="font-medium text-[#24282E]">{totalLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[999px] border border-[#CAD2DC] bg-white px-5 text-sm font-medium text-[#1E293B] transition hover:bg-[#F5F8FC]"
                onClick={() => setConfirmCancelOpen(false)}
                disabled={cancelLoading}
              >
                Tiếp tục thanh toán
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[999px] bg-[#D92D4B] px-5 text-sm font-medium text-white transition hover:bg-[#BE2440] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={cancelCurrentPayment}
                disabled={cancelLoading}
              >
                {cancelLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Huỷ thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
