import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import { AlertTriangle, ArrowLeft, Clock3, Loader2, QrCode, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
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
      priceLabel: formatBillingCurrency(yearlyMonthlyEquivalent, fallback.currency),
      unit: '/ tháng',
      totalLabel: formatBillingCurrency(fallback.amount, fallback.currency),
      totalUnit: '/ năm',
      note: `Thanh toán ${formatBillingCurrency(fallback.amount, fallback.currency)}/năm`,
      totalNote: '365 ngày sử dụng Pro',
    };
  }

  return {
    ...fallback,
    id: 'monthly',
    label: 'Gói tháng',
    description: 'Phù hợp khi lớp học cần dùng linh hoạt.',
    priceLabel: formatBillingCurrency(fallback.amount, fallback.currency),
    unit: '/ tháng',
    totalLabel: formatBillingCurrency(fallback.amount, fallback.currency),
    totalUnit: '/ tháng',
    note: 'Gia hạn theo tháng',
    totalNote: '30 ngày sử dụng Pro',
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

function PayOsEmbeddedCheckout({ checkoutUrl, orderCode, planId, returnUrl, onExit }) {
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
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmSwitchPlanOpen, setConfirmSwitchPlanOpen] = useState(false);
  const [retryAfterUntilMs, setRetryAfterUntilMs] = useState(0);
  const [retryAfterRemainingMs, setRetryAfterRemainingMs] = useState(0);
  const mountedRef = useRef(true);
  const expiredOrderSyncRef = useRef('');

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

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
        // Keep local fallback prices if plan lookup is unavailable.
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateSelectedPlan(nextPlanId, options = {}) {
    setSelectedPlanId(nextPlanId);

    if (!isPayOsReturn) {
      window.sessionStorage.setItem(CHECKOUT_PLAN_STORAGE_KEY, nextPlanId);
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('plan', nextPlanId);
    setSearchParams(nextSearchParams, { replace: options.replace ?? false });
  }

  async function openPaymentLinkForPlan(planCode, options = {}) {
    const { clearVisibleFrame = true } = options;

    setPaymentLinkLoading(true);
    setError('');
    setConfirmSwitchPlanOpen(false);

    if (clearVisibleFrame) {
      setFrameClosed(false);
    }

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
      reopenPendingLink = false,
      syncSelectedPlanWithPending = false,
      showMainLoader = false,
      clearError = false,
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

      if (latestPendingOrder?.planCode && syncSelectedPlanWithPending) {
        const pendingPlanId = getPlanIdFromPlanCode(latestPendingOrder.planCode);
        setSelectedPlanId(pendingPlanId);

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set('plan', pendingPlanId);
        setSearchParams(nextSearchParams, { replace: true });
        window.sessionStorage.setItem(CHECKOUT_PLAN_STORAGE_KEY, pendingPlanId);
      }

      if (reopenPendingLink && latestPendingOrder?.planCode) {
        await openPaymentLinkForPlan(latestPendingOrder.planCode);
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
          setSelectedPlanId(pendingPlanId);

          const nextSearchParams = new URLSearchParams(searchParams);
          nextSearchParams.set('plan', pendingPlanId);
          setSearchParams(nextSearchParams, { replace: true });
          window.sessionStorage.setItem(CHECKOUT_PLAN_STORAGE_KEY, pendingPlanId);

          await openPaymentLinkForPlan(latestPendingOrder.planCode);
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
  }, [isPayOsReturn]);

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
  const pendingOrderCode = paymentLinkMatchesSelection
    ? paymentLink?.orderCode
    : pendingOrder?.orderCode;
  const pendingOrderLabel = pendingOrder?.planCode ? getPlanLabel(pendingOrder.planCode) : null;
  const createButtonLabel = paymentLinkExpired
    ? 'Tạo mã mới'
    : hasSamePlanPending
      ? 'Tiếp tục thanh toán'
      : 'Tiến tới thanh toán';

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
        setError(err.message || 'Không thể huỷ đơn cũ để tạo thanh toán mới.');
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

  function renderPaymentPanelBody() {
    if (loading) {
      return (
        <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-dashed border-brand-light bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" />
            <p className="mt-4 text-sm font-black text-brand-navy">Đang kiểm tra đơn thanh toán hiện có</p>
          </div>
        </div>
      );
    }

    if (paymentLinkLoading || cancelLoading) {
      return (
        <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-dashed border-brand-light bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" />
            <p className="mt-4 text-sm font-black text-brand-navy">
              {cancelLoading ? 'Đang xử lý đơn thanh toán cũ' : 'Đang chuẩn bị mã QR PayOS'}
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
          onExit={() => setFrameClosed(true)}
        />
      );
    }

    if (frameClosed && hasVisiblePaymentLink && !paymentLinkExpired) {
      return (
        <div className="mx-auto grid h-[460px] w-full max-w-[520px] place-items-center rounded-[14px] border border-brand-light bg-surface-blue px-6 text-center">
          <div>
            <QrCode className="mx-auto h-10 w-10 text-brand-blue" />
            <p className="mt-4 text-base font-black text-brand-navy">Khung thanh toán đã đóng</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#64748B]">
              Bấm tiếp tục thanh toán để mở lại QR còn hiệu lực của đơn hiện tại.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy"
              onClick={() => {
                setFrameClosed(false);
                setError('');
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Mở lại QR
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto flex h-[460px] w-full max-w-[520px] flex-col justify-between rounded-[14px] border border-[#D7E0EA] bg-white p-6 shadow-[0_16px_36px_rgba(27,58,107,0.07)]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-light/20 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
            <QrCode className="h-4 w-4" />
            Thông tin thanh toán
          </div>

          <h3 className="mt-5 text-2xl font-black tracking-[-0.01em] text-[#22272E]">
            {selectedPlan.label}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#5D6572]">
            {selectedPlan.description}
          </p>

          <div className="mt-6 grid gap-3 rounded-[14px] border border-[#E5EAF1] bg-[#F8FBFE] px-4 py-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-[#64748B]">Gói đã chọn</span>
              <span className="font-black text-[#24282E]">{selectedPlan.label}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-[#64748B]">Tổng thanh toán</span>
              <span className="font-black text-[#24282E]">{totalLabel}</span>
            </div>
          </div>

          {hasSamePlanPending && (
            <div className="mt-5 rounded-[14px] border border-brand-light/70 bg-brand-light/15 px-4 py-4">
              <p className="text-sm font-black text-brand-navy">Bạn đang có một đơn chờ thanh toán cho gói này.</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5D6572]">
                Bấm <span className="font-black">Tiếp tục thanh toán</span> để lấy lại QR còn hiệu lực, không tạo đơn mới.
              </p>
              {pendingOrderCode && (
                <p className="mt-3 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
                  Mã đơn: {pendingOrderCode}
                </p>
              )}
            </div>
          )}

          {hasDifferentPlanPending && (
            <div className="mt-5 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-amber-600" />
                <div>
                  <p className="text-sm font-black text-amber-900">Bạn có một order chưa thanh toán.</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
                    Nếu tạo order mới cho <span className="font-black">{selectedPlan.label}</span>, order cũ{' '}
                    {pendingOrderLabel ? `(${pendingOrderLabel}) ` : ''}
                    sẽ bị huỷ trước khi tạo QR mới.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentLinkExpired && (
            <div className="mt-5 rounded-[14px] border border-rose-200 bg-rose-50 px-4 py-4">
              <p className="text-sm font-black text-rose-700">Mã QR đã hết hạn.</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-rose-700">
                Mascoteach không tự tạo QR mới. Bấm <span className="font-black">Tạo mã mới</span> khi bạn sẵn sàng thanh toán lại.
              </p>
            </div>
          )}

          {!hasPendingOrder && !paymentLinkExpired && !error && (
            <p className="mt-5 text-sm font-semibold leading-6 text-[#64748B]">
              Chọn gói xong, bấm <span className="font-black text-[#24282E]">Tiến tới thanh toán</span> để tạo QR PayOS.
            </p>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleCreateOrReusePayment}
            disabled={controlsDisabled || retryAfterRemainingMs > 0}
          >
            {(paymentLinkLoading || cancelLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {retryAfterRemainingMs > 0 ? `Chờ ${formatCountdown(retryAfterRemainingMs)}` : createButtonLabel}
          </button>
        </div>
      </div>
    );
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
              Chọn gói trước, sau đó tiến tới thanh toán để tạo QR PayOS cho đúng gói bạn muốn chốt.
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
                      'grid min-h-[126px] grid-cols-[42px_1fr] items-center gap-4 rounded-[16px] border bg-white px-5 text-left transition duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:grid-cols-[48px_1fr_auto] sm:px-7',
                      active
                        ? 'border-brand-blue shadow-[0_18px_45px_rgba(43,122,181,0.14)]'
                        : 'border-[#CAD2DC] hover:border-brand-mid'
                    )}
                    onClick={() => updateSelectedPlan(plan.id)}
                    aria-pressed={active}
                    disabled={controlsDisabled}
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
              {renderPaymentPanelBody()}
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-2xl font-black text-[#22272E]">Tổng cộng</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#64748B]" aria-live="polite">
                  <Clock3 className="h-4 w-4" />
                  {showPaymentFrame && paymentLink?.expiresAt
                    ? `Mã QR còn hiệu lực ${formatCountdown(paymentLinkRemainingMs)}`
                    : paymentLinkExpired
                      ? 'Mã QR đã hết hạn'
                      : retryAfterRemainingMs > 0
                        ? `Đang chờ tạo QR mới ${formatCountdown(retryAfterRemainingMs)}`
                        : selectedPlan.totalNote}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#24282E]">{totalLabel}</p>
                <p className="text-sm font-semibold text-[#64748B]">{selectedPlan.totalUnit}</p>
              </div>
            </div>

            {pendingOrderCode && (
              <div className="mt-4 flex flex-col gap-3 rounded-[11px] bg-brand-light/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-brand-blue">
                  Mã đơn hàng: {pendingOrderCode}
                </p>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-[9px] border border-rose-200 bg-white px-3 text-sm font-black text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  {cancelLoading ? 'Đang huỷ' : 'Huỷ thanh toán'}
                </button>
              </div>
            )}

            {refreshingOrders && !loading && (
              <p className="mt-3 text-sm font-semibold text-[#64748B]">
                Đang đồng bộ trạng thái đơn hàng...
              </p>
            )}

            {error && (
              <div className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                <p>{error}</p>
                {!loading && (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-black text-rose-700 underline underline-offset-2"
                    onClick={() => refreshOrdersState({ showMainLoader: true, clearError: true, reopenPendingLink: hasSamePlanPending })}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tải lại trạng thái thanh toán
                  </button>
                )}
              </div>
            )}

            <p className="mt-5 flex items-start gap-3 text-sm font-semibold leading-6 text-[#5D6572]">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-brand-blue" />
              Giao dịch được xử lý bảo mật qua PayOS. Gói Pro sẽ được cập nhật tự động sau khi thanh toán được webhook xác nhận.
            </p>
          </div>
        </div>
      </section>

      {confirmSwitchPlanOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/45 px-4 backdrop-blur-[6px]" role="dialog" aria-modal="true" aria-labelledby="switch-plan-title">
          <div className="w-full max-w-[520px] rounded-[18px] border border-[#E5D9C7] bg-white shadow-[0_26px_80px_rgba(27,58,107,0.22)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-[12px] bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8A94A6]">
                    Order đang chờ thanh toán
                  </p>
                  <h2 id="switch-plan-title" className="mt-1 text-xl font-black text-[#22272E]">
                    Tạo order mới cho gói này?
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-semibold leading-6 text-[#5D6572]">
                Bạn có một order chưa thanh toán. Nếu tạo order mới cho <span className="font-black">{selectedPlan.label}</span>, order cũ
                {pendingOrderLabel ? ` (${pendingOrderLabel})` : ''} sẽ bị huỷ trước.
              </p>

              <div className="mt-4 grid gap-2 rounded-[13px] border border-[#E5EAF1] bg-[#F8FBFE] px-4 py-3 text-sm">
                {pendingOrder?.orderCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-[#64748B]">Mã đơn cũ</span>
                    <span className="font-black text-[#24282E]">{pendingOrder.orderCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#64748B]">Gói mới</span>
                  <span className="font-black text-[#24282E]">{selectedPlan.label}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B] transition hover:bg-[#F5F8FC] active:translate-y-px"
                onClick={() => setConfirmSwitchPlanOpen(false)}
                disabled={cancelLoading || paymentLinkLoading}
              >
                Giữ order cũ
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#D97706] px-5 text-sm font-black text-white transition hover:bg-[#B45309] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/45 px-4 backdrop-blur-[6px]" role="dialog" aria-modal="true" aria-labelledby="cancel-payment-title">
          <div className="w-full max-w-[480px] rounded-[18px] border border-[#E5D1D7] bg-white shadow-[0_26px_80px_rgba(27,58,107,0.22)]">
            <div className="border-b border-[#EEF2F6] px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-[12px] bg-[#FFF1F3] text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#8A94A6]">
                    Đơn đang chờ thanh toán
                  </p>
                  <h2 id="cancel-payment-title" className="mt-1 text-xl font-black text-[#22272E]">
                    Huỷ mã thanh toán này?
                  </h2>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm font-semibold leading-6 text-[#5D6572]">
                Mã QR hiện tại sẽ không còn dùng được. Gói Pro chưa được kích hoạt, và bạn có thể tạo mã mới nếu muốn thanh toán lại.
              </p>

              <div className="mt-4 grid gap-2 rounded-[13px] border border-[#E5EAF1] bg-[#F8FBFE] px-4 py-3 text-sm">
                {pendingOrderCode && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-[#64748B]">Mã đơn</span>
                    <span className="font-black text-[#24282E]">{pendingOrderCode}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#64748B]">Số tiền</span>
                  <span className="font-black text-[#24282E]">{totalLabel}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF2F6] px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B] transition hover:bg-[#F5F8FC] active:translate-y-px"
                onClick={() => setConfirmCancelOpen(false)}
                disabled={cancelLoading}
              >
                Tiếp tục thanh toán
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#D92D4B] px-5 text-sm font-black text-white transition hover:bg-[#BE2440] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
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
