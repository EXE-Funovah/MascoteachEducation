import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Ban, Loader2 } from 'lucide-react';
import { cancelPaymentOrder } from '@/services/billingService';

const CHECKOUT_PLAN_STORAGE_KEY = 'mascoteach_checkout_plan';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const planParam = searchParams.get('plan') || window.sessionStorage.getItem(CHECKOUT_PLAN_STORAGE_KEY) || 'monthly';
  const nextCheckoutPath = `/checkout?plan=${planParam === 'yearly' ? 'yearly' : 'monthly'}`;
  const isCancelled = searchParams.get('cancel') === 'true';
  const isHandled = searchParams.get('cancel') === 'handled';
  const status = searchParams.get('status');
  const shouldCancel = useMemo(
    () => Boolean(isCancelled && status === 'CANCELLED' && orderCode && !isHandled),
    [isCancelled, isHandled, orderCode, status]
  );
  const [state, setState] = useState(shouldCancel ? 'cancelling' : 'done');
  const [error, setError] = useState('');
  const hasCancelInfo = shouldCancel || isHandled;
  const isCancelling = state === 'cancelling';
  const isInvalidCancel = !hasCancelInfo && !error;
  const title = isCancelling
    ? 'Đang hủy mã thanh toán'
    : isInvalidCancel
      ? 'Không tìm thấy đơn cần hủy'
      : 'Thanh toán đã được hủy';
  const description = isCancelling
    ? 'Mascoteach đang gửi yêu cầu hủy đơn chờ thanh toán sang PayOS.'
    : isInvalidCancel
      ? 'Đường dẫn này thiếu thông tin đơn hàng hoặc trạng thái hủy không hợp lệ.'
      : 'Mã QR này không còn hiệu lực. Gói Pro chưa được kích hoạt và bạn có thể tạo mã mới bất cứ lúc nào.';

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
    <main className="min-h-[100dvh] bg-gradient-subtle px-5 py-10 text-ink">
      <section className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[760px] items-center">
        <article className="w-full overflow-hidden rounded-[20px] border border-brand-light/60 bg-white shadow-[0_24px_70px_rgba(27,58,107,0.14)]">
          <header className="flex flex-col gap-4 border-b border-[#E8EEF5] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <img src="/images/Logo_Redesign_Text.webp" alt="Mascoteach" className="h-10 w-fit object-contain" />
            <span className="w-fit rounded-full border border-[#CAD2DC] bg-[#F8FBFE] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
              Thanh toán PayOS
            </span>
          </header>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-12 w-12 flex-none place-items-center rounded-[14px] bg-[#FFF1F3] text-rose-600">
                {isCancelling ? <Loader2 className="h-6 w-6 animate-spin" /> : <Ban className="h-6 w-6" />}
              </div>

              <div className="min-w-0">
                <h1 className="text-[28px] font-black leading-tight tracking-[-0.01em] text-[#22272E]">
                  {title}
                </h1>
                <p className="mt-3 max-w-[560px] text-sm font-semibold leading-6 text-[#5D6572]">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-7 rounded-[14px] border border-[#E5EAF1] bg-[#F8FBFE] p-4">
              {orderCode ? (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-[#64748B]">Mã đơn hàng</span>
                  <span className="break-all text-sm font-black text-brand-navy">{orderCode}</span>
                </div>
              ) : (
                <p className="text-sm font-semibold leading-6 text-[#64748B]">
                  Nếu bạn vừa đóng cổng thanh toán PayOS, hãy quay lại bảng giá để tạo mã mới.
                </p>
              )}
            </div>

            {error && (
              <p className="mt-5 rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={nextCheckoutPath} className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white transition hover:bg-brand-navy active:translate-y-px">
                Tạo mã mới
              </Link>
              <Link to="/teacher/billing" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#CAD2DC] bg-white px-5 text-sm font-black text-[#1E293B] transition hover:bg-[#F5F8FC] active:translate-y-px">
                Xem thanh toán
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
