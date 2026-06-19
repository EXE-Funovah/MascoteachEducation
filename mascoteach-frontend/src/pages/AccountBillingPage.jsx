import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Crown, Loader2, ReceiptText, RefreshCw } from 'lucide-react';
import { getMyBilling, getMyBillingOrders } from '@/services/billingService';
import { cn } from '@/lib/utils';

const statusTone = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  Expired: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

function formatDate(value) {
  if (!value) return 'Chưa có';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function planLabel(planCode) {
  if (planCode === 'PRO_YEARLY') return 'Pro năm';
  if (planCode === 'PRO_MONTHLY') return 'Pro tháng';
  return planCode || 'Không rõ';
}

export default function AccountBillingPage() {
  const [billing, setBilling] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadBilling() {
      setLoading(true);
      setError('');

      try {
        const [billingStatus, orderHistory] = await Promise.all([
          getMyBilling(),
          getMyBillingOrders(),
        ]);

        if (!cancelled) {
          setBilling(billingStatus);
          setOrders(orderHistory);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Không thể tải thông tin billing.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBilling();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const isPremium = billing?.isPremiumActive;

  return (
    <div className="min-h-full bg-[#fbfdff] text-ink">
      <div className="mx-auto w-full max-w-[1120px] px-5 py-8 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-[7px] border border-brand-light/70 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-brand-blue">
              <ReceiptText className="h-4 w-4" />
              Billing
            </div>
            <h1 className="mt-4 font-display text-[34px] font-black leading-tight tracking-[-0.02em]">
              Tài khoản và thanh toán
            </h1>
            <p className="mt-2 max-w-[620px] text-sm font-semibold leading-6 text-[#64748B]">
              Theo dõi gói hiện tại, ngày hết hạn và lịch sử thanh toán của bạn.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-brand-light/70 bg-white px-5 text-sm font-black text-brand-navy hover:bg-brand-light/15"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
            <Link to="/checkout?plan=yearly" className="inline-flex h-11 items-center justify-center rounded-[10px] bg-brand-blue px-5 text-sm font-black text-white hover:bg-brand-navy">
              Nâng cấp Pro
            </Link>
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid min-h-[320px] place-items-center rounded-[18px] border border-brand-light/60 bg-white">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
              <p className="mt-3 text-sm font-black text-[#64748B]">Đang tải billing</p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-[14px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                <Crown className={cn('h-7 w-7', isPremium ? 'text-[#F59E0B]' : 'text-[#94A3B8]')} />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Gói hiện tại</p>
                <p className="mt-1 text-2xl font-black">{isPremium ? 'Pro' : 'Free'}</p>
              </div>
              <div className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                <CalendarDays className="h-7 w-7 text-brand-blue" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Ngày hết hạn</p>
                <p className="mt-1 text-2xl font-black">{formatDate(billing?.premiumExpiresAt)}</p>
              </div>
              <div className="rounded-[18px] border border-brand-light/60 bg-white p-5 shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
                <CalendarDays className="h-7 w-7 text-[#24A148]" />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">Số ngày còn lại</p>
                <p className="mt-1 text-2xl font-black">{billing?.daysRemaining ?? 0} ngày</p>
              </div>
            </section>

            <section className="mt-8 overflow-hidden rounded-[18px] border border-brand-light/60 bg-white shadow-[0_18px_48px_rgba(43,122,181,0.08)]">
              <div className="border-b border-[#E4EAF1] px-5 py-4">
                <h2 className="text-lg font-black">Lịch sử thanh toán</h2>
              </div>

              {orders.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm font-semibold text-[#64748B]">
                  Chưa có đơn thanh toán nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-blue text-xs font-black uppercase tracking-[0.08em] text-[#64748B]">
                      <tr>
                        <th className="px-5 py-3">Mã đơn</th>
                        <th className="px-5 py-3">Gói</th>
                        <th className="px-5 py-3">Số tiền</th>
                        <th className="px-5 py-3">Trạng thái</th>
                        <th className="px-5 py-3">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4EAF1]">
                      {orders.map((order) => (
                        <tr key={order.id ?? order.orderCode} className="font-semibold text-[#1E293B]">
                          <td className="whitespace-nowrap px-5 py-4 font-black">{order.orderCode}</td>
                          <td className="whitespace-nowrap px-5 py-4">{planLabel(order.planCode)}</td>
                          <td className="whitespace-nowrap px-5 py-4">{formatCurrency(order.amount, order.currency)}</td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-black', statusTone[order.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                              {order.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-[#64748B]">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
