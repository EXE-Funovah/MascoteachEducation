import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usePayOS } from '@payos/payos-checkout';
import { ArrowLeft, CheckCircle2, Loader2, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
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

function getPlanMeta(planCode) {
  const fallback = normalizePlan(
    planCode === BILLING_PLAN_CODES.yearly
      ? BILLING_PLAN_FALLBACKS.PRO_YEARLY
      : BILLING_PLAN_FALLBACKS.PRO_MONTHLY
  );

  return {
    ...fallback,
    label: planCode === BILLING_PLAN_CODES.yearly ? 'Pro năm' : 'Pro tháng',
    note: planCode === BILLING_PLAN_CODES.yearly
      ? '365 ngày sử dụng Pro'
      : '30 ngày sử dụng Pro',
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
      className="min-h-[640px] overflow-hidden rounded-[16px] border border-[#CAD2DC] bg-white"
    />
  );
}

export default function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const planCode = useMemo(() => getPlanCode(searchParams.get('plan')), [searchParams]);
  const plan = useMemo(() => getPlanMeta(planCode), [planCode]);
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
          throw new Error('Backend chưa trả đủ checkoutUrl/orderCode cho đơn thanh toán.');
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

  function changePlan(nextPlan) {
    setSearchParams({ plan: nextPlan });
  }

  return (
    <main className="min-h-[100dvh] bg-gradient-subtle px-4 py-7 text-ink sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100dvh-56px)] w-full max-w-[1480px] grid-cols-1 overflow-hidden rounded-[18px] border border-brand-light/55 bg-[#fbfdff] shadow-[0_34px_100px_rgba(27,58,107,0.14)] lg:grid-cols-[420px_1fr]">
        <aside className="flex flex-col border-b border-[#E4EAF1] bg-white px-7 py-8 sm:px-10 lg:border-b-0 lg:border-r">
          <Link to="/" className="inline-flex w-fit items-center gap-3" aria-label="Mascoteach">
            <img src="/images/Logo.png" alt="Mascoteach" className="h-9 w-auto object-contain" />
          </Link>

          <Link to="/pricing" className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#64748B] transition hover:text-brand-blue">
            <ArrowLeft className="h-4 w-4" />
            Quay lại bảng giá
          </Link>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded-[7px] border border-brand-light bg-brand-light/25 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
              <QrCode className="h-4 w-4" />
              PayOS embedded
            </div>
            <h1 className="mt-5 font-display text-[34px] font-black leading-[1.04] tracking-[-0.02em] text-brand-navy">
              Thanh toán Mascoteach Pro
            </h1>
            <p className="mt-4 text-sm font-semibold leading-6 text-[#64748B]">
              QR và giao diện thanh toán được nhúng trực tiếp từ PayOS. Mascoteach không tự cấp Pro ở bước này.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-[14px] bg-[#E8EBEF] p-1">
            {[
              { key: 'monthly', label: 'Tháng' },
              { key: 'yearly', label: 'Năm' },
            ].map((item) => {
              const active = getPlanCode(item.key) === planCode;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={cn(
                    'h-12 rounded-[11px] text-sm font-black transition duration-200 active:translate-y-px',
                    active ? 'bg-white text-brand-navy shadow-[0_8px_18px_rgba(27,58,107,0.10)]' : 'text-[#6B7280] hover:text-brand-navy'
                  )}
                  onClick={() => changePlan(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <dl className="mt-8 grid gap-3 text-sm">
            <div className="rounded-[13px] border border-brand-light/60 bg-surface-blue px-4 py-4">
              <dt className="font-bold text-[#64748B]">Gói đã chọn</dt>
              <dd className="mt-1 text-xl font-black text-brand-navy">{plan.label}</dd>
            </div>
            <div className="rounded-[13px] border border-brand-light/60 bg-surface-blue px-4 py-4">
              <dt className="font-bold text-[#64748B]">Tổng thanh toán</dt>
              <dd className="mt-1 text-2xl font-black text-brand-navy">{formatCurrency(plan.amount, plan.currency)}</dd>
              <dd className="mt-1 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">{plan.note}</dd>
            </div>
            <div className="rounded-[13px] border border-brand-light/60 bg-surface-blue px-4 py-4">
              <dt className="font-bold text-[#64748B]">Người thanh toán</dt>
              <dd className="mt-1 truncate text-base font-black text-brand-navy">{user?.fullName || user?.email || 'Tài khoản Mascoteach'}</dd>
            </div>
          </dl>

          {paymentLink?.orderCode && (
            <div className="mt-5 rounded-[13px] bg-brand-light/20 px-4 py-3 text-sm font-semibold text-brand-blue">
              Mã đơn hàng: <span className="font-black">{paymentLink.orderCode}</span>
            </div>
          )}

          <p className="mt-auto flex items-start gap-3 pt-8 text-sm font-semibold leading-6 text-[#5D6572]">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-brand-blue" />
            Pro chỉ được kích hoạt khi webhook PayOS xử lý thành công ở backend.
          </p>
        </aside>

        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10">
          {loading && (
            <div className="grid min-h-[640px] place-items-center rounded-[16px] border border-dashed border-brand-light bg-white">
              <div className="text-center">
                <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-blue" />
                <p className="mt-4 text-sm font-black text-brand-navy">Đang tạo đơn thanh toán PayOS</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="grid min-h-[640px] place-items-center rounded-[16px] border border-rose-200 bg-rose-50 px-6 text-center">
              <div>
                <p className="text-lg font-black text-rose-700">{error}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  <RefreshCw className="h-4 w-4" />
                  Tạo lại link
                </button>
              </div>
            </div>
          )}

          {!loading && !error && paymentLink?.checkoutUrl && (
            <>
              {frameClosed && (
                <div className="mb-4 flex items-center justify-between gap-4 rounded-[12px] border border-brand-light/60 bg-white px-4 py-3 text-sm font-semibold text-[#64748B]">
                  <span>Bạn đã đóng khung thanh toán. Có thể tạo lại link mới nếu cần.</span>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-[9px] bg-brand-blue px-4 text-sm font-black text-white hover:bg-brand-navy"
                    onClick={() => setReloadKey((key) => key + 1)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Tạo lại
                  </button>
                </div>
              )}

              {!frameClosed && (
                <PayOsEmbeddedCheckout
                  key={`${paymentLink.orderCode}-${paymentLink.checkoutUrl}`}
                  checkoutUrl={paymentLink.checkoutUrl}
                  orderCode={paymentLink.orderCode}
                  onExit={() => setFrameClosed(true)}
                />
              )}

              <div className="mt-4 flex items-start gap-3 rounded-[12px] bg-white px-4 py-3 text-sm font-semibold leading-6 text-[#64748B]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#24A148]" />
                Sau khi thanh toán, trang thành công sẽ chỉ refresh trạng thái từ backend. Nếu webhook chưa xong, hệ thống sẽ chờ và thử lại vài lần.
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
