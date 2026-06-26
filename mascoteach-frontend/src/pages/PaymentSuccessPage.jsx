import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMyBilling } from '@/services/billingService';

const MAX_ATTEMPTS = 8;
const POLL_DELAY_MS = 2500;

function formatDate(value) {
  if (!value) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function PaymentSuccessPage() {
  const { refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const [billing, setBilling] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timerId;

    async function checkBillingStatus(nextAttempt) {
      try {
        setError('');
        const status = await getMyBilling();
        if (cancelled) return;

        setBilling(status);
        setAttempts(nextAttempt);

        if (status?.isPremiumActive) {
          refreshUser().catch(() => {});
        }

        if (!status?.isPremiumActive && nextAttempt < MAX_ATTEMPTS) {
          timerId = window.setTimeout(() => checkBillingStatus(nextAttempt + 1), POLL_DELAY_MS);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể kiểm tra trạng thái thanh toán.');
          setAttempts(nextAttempt);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkBillingStatus(1);
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const isPremium = billing?.isPremiumActive;
  const stillChecking = !isPremium && attempts > 0 && attempts < MAX_ATTEMPTS && !error;

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-gradient-subtle px-5 py-10 text-ink">
      <section className="w-full max-w-[620px] rounded-[18px] border border-brand-light/60 bg-white p-7 text-center shadow-[0_24px_70px_rgba(27,58,107,0.14)]">
        <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="mx-auto h-12 w-auto object-contain" />

        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-brand-light/25 text-brand-blue">
          {isPremium ? <CheckCircle2 className="h-8 w-8 text-[#24A148]" /> : <Clock3 className="h-7 w-7" />}
        </div>

        <h1 className="mt-5 text-2xl font-black tracking-[-0.01em]">
          {isPremium ? 'Thanh toán đã được xác nhận' : 'Đang xác nhận thanh toán'}
        </h1>
        <p className="mx-auto mt-3 max-w-[500px] text-sm font-semibold leading-6 text-[#64748B]">
          {isPremium
            ? 'Tài khoản Pro của bạn đang hoạt động.'
            : 'Mascoteach đang cập nhật trạng thái thanh toán. Vui lòng chờ trong giây lát.'}
        </p>

        {orderCode && (
          <p className="mt-4 rounded-[10px] bg-brand-light/20 px-4 py-3 text-sm font-bold text-brand-blue">
            Mã đơn hàng: {orderCode}
          </p>
        )}

        {loading || stillChecking ? (
          <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-[#F5F8FC] px-4 py-2 text-sm font-black text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang kiểm tra {Math.max(attempts, 1)}/{MAX_ATTEMPTS}
          </div>
        ) : null}

        {billing && (
          <dl className="mt-6 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-[12px] bg-surface-blue px-4 py-3">
              <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Gói</dt>
              <dd className="mt-1 text-base font-black">{billing.subscriptionTier}</dd>
            </div>
            <div className="rounded-[12px] bg-surface-blue px-4 py-3">
              <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Hết hạn</dt>
              <dd className="mt-1 text-base font-black">{formatDate(billing.premiumExpiresAt)}</dd>
            </div>
            <div className="rounded-[12px] bg-surface-blue px-4 py-3">
              <dt className="text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Còn lại</dt>
              <dd className="mt-1 text-base font-black">{billing.daysRemaining} ngày</dd>
            </div>
          </dl>
        )}

        {error && (
          <p className="mt-5 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        {!isPremium && attempts >= MAX_ATTEMPTS && !error && (
          <p className="mt-5 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Nếu gói Pro chưa cập nhật, vui lòng kiểm tra lại sau ít phút hoặc liên hệ hỗ trợ.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/teacher/billing" className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white hover:bg-brand-navy">
            Xem thanh toán
          </Link>
          <Link
            to="/teacher"
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B]"
          >
            Vào trang giáo viên
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B]"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Kiểm tra lại
          </button>
        </div>
      </section>
    </main>
  );
}
