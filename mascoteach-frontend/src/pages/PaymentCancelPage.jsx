import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Ban, Loader2 } from 'lucide-react';
import { cancelPaymentOrder } from '@/services/billingService';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const isCancelled = searchParams.get('cancel') === 'true';
  const isHandled = searchParams.get('cancel') === 'handled';
  const status = searchParams.get('status');
  const shouldCancel = useMemo(
    () => Boolean(isCancelled && status === 'CANCELLED' && orderCode && !isHandled),
    [isCancelled, isHandled, orderCode, status]
  );
  const [state, setState] = useState(shouldCancel ? 'cancelling' : 'done');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function cancelOrder() {
      if (!shouldCancel) return;

      try {
        await cancelPaymentOrder(orderCode);
        if (!cancelled) setState('done');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể cập nhật trạng thái hủy thanh toán.');
          setState('error');
        }
      }
    }

    cancelOrder();
    return () => {
      cancelled = true;
    };
  }, [orderCode, shouldCancel]);

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-gradient-subtle px-5 py-10 text-ink">
      <section className="w-full max-w-[560px] rounded-[18px] border border-brand-light/60 bg-white p-7 text-center shadow-[0_24px_70px_rgba(27,58,107,0.14)]">
        <img src="/images/Logo.png" alt="Mascoteach" className="mx-auto h-12 w-auto object-contain" />
        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
          {state === 'cancelling' ? <Loader2 className="h-7 w-7 animate-spin" /> : <Ban className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.01em]">
          {state === 'cancelling' ? 'Đang cập nhật đơn hủy' : 'Bạn đã hủy thanh toán'}
        </h1>
        <p className="mx-auto mt-3 max-w-[460px] text-sm font-semibold leading-6 text-[#64748B]">
          {shouldCancel || isHandled
            ? 'Đơn thanh toán PayOS của bạn đã được ghi nhận là đã hủy.'
            : 'Không có thông tin hủy hợp lệ trong đường dẫn PayOS.'}
        </p>

        {orderCode && (
          <p className="mt-4 rounded-[10px] bg-[#F5F8FC] px-4 py-3 text-sm font-bold text-[#64748B]">
            Mã đơn hàng: {orderCode}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/pricing" className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white hover:bg-brand-navy">
            Chọn lại gói
          </Link>
          <Link to="/teacher/billing" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B]">
            Xem billing
          </Link>
        </div>
      </section>
    </main>
  );
}
