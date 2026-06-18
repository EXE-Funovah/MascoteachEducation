import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock3, QrCode, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'monthly',
    label: 'Gói tháng',
    description: 'Phù hợp khi lớp học cần dùng linh hoạt.',
    price: '119.000đ',
    unit: '/ tháng',
    note: 'Gia hạn theo tháng',
  },
  {
    id: 'yearly',
    label: 'Gói năm',
    description: 'Thanh toán một lần, tiết kiệm hơn cho cả năm học.',
    price: '99.000đ',
    unit: '/ tháng',
    note: 'Thanh toán 1.188.000đ/năm',
  },
];

const methods = [
  {
    id: 'momo',
    label: 'Momo',
    accent: '#A50064',
    bg: 'bg-[#FFF0F8]',
    border: 'border-[#A50064]',
    text: 'text-[#A50064]',
    account: 'MASCOTEACH MOMO',
    content: 'MASCOTEACH PRO',
  },
  {
    id: 'payos',
    label: 'PayOS',
    accent: '#0B63B6',
    bg: 'bg-[#EEF7FF]',
    border: 'border-[#0B63B6]',
    text: 'text-[#0B63B6]',
    account: 'MASCOTEACH PAYOS',
    content: 'MT PRO 2026',
  },
];

const qrCells = [
  1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1,
  0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0,
  1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1,
  0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0,
  0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1,
  1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1,
  1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
  1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1,
  1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
];

function QRPreview({ method }) {
  return (
    <div className="relative mx-auto grid h-[230px] w-[230px] grid-cols-[repeat(15,1fr)] gap-1 rounded-[18px] border border-[#D8DEE7] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      {qrCells.map((filled, index) => (
        <span
          key={`${method.id}-${index}`}
          className="rounded-[2px]"
          style={{ backgroundColor: filled ? method.accent : '#F5F7FA' }}
        />
      ))}
      <div className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[12px] border border-white bg-white shadow-[0_10px_24px_rgba(15,23,42,0.12)]">
        <QrCode className={cn('h-7 w-7', method.text)} strokeWidth={2.4} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedMethod, setSelectedMethod] = useState('momo');

  const plan = useMemo(() => plans.find((item) => item.id === selectedPlan), [selectedPlan]);
  const method = useMemo(() => methods.find((item) => item.id === selectedMethod), [selectedMethod]);

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_0%_10%,rgba(248,251,255,0.96),transparent_28%),linear-gradient(135deg,#EEF7FF_0%,#DCEBFA_36%,#6B6198_100%)] px-4 py-7 text-[#24282E] sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100dvh-56px)] w-full max-w-[1540px] grid-cols-1 overflow-hidden bg-[#F9FCFF] shadow-[0_34px_100px_rgba(38,45,72,0.24)] lg:grid-cols-[1fr_0.92fr]">
        <div className="flex flex-col px-7 py-8 sm:px-12 lg:px-24 lg:py-20">
          <Link to="/" className="inline-flex w-fit items-center gap-3" aria-label="Về trang chủ Mascoteach">
            <img src="/images/Logo.png" alt="Mascoteach" className="h-9 w-auto object-contain" />
          </Link>

          <div className="mt-12 lg:mt-16">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-bold text-[#64748B] transition hover:text-[#0B63B6]">
              <ArrowLeft className="h-4 w-4" />
              Quay lại bảng giá
            </Link>

            <h1 className="mt-7 max-w-[620px] font-display text-[36px] font-black leading-[1.03] tracking-[-0.02em] text-[#22272E] sm:text-[48px] lg:text-[56px]">
              Kích hoạt Mascoteach Pro
            </h1>
            <p className="mt-4 max-w-[520px] text-base font-medium leading-7 text-[#5D6572]">
              Mở khóa công cụ tạo câu hỏi, trò chơi lớp học và báo cáo tiến độ chỉ trong vài phút.
            </p>
          </div>

          <div className="mt-14">
            <h2 className="text-2xl font-black tracking-[-0.01em] text-[#22272E]">Chọn gói Pro</h2>
            <div className="mt-7 grid gap-4">
              {plans.map((item) => {
                const active = selectedPlan === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      'grid min-h-[126px] grid-cols-[42px_1fr] items-center gap-4 rounded-[16px] border bg-white px-5 text-left transition duration-200 active:translate-y-px sm:grid-cols-[48px_1fr_auto] sm:px-7',
                      active
                        ? 'border-[#5D46E8] shadow-[0_18px_45px_rgba(93,70,232,0.12)]'
                        : 'border-[#CAD2DC] hover:border-[#8CA8C9]'
                    )}
                    onClick={() => setSelectedPlan(item.id)}
                    aria-pressed={active}
                  >
                    <span className={cn('grid h-9 w-9 place-items-center rounded-full border-2', active ? 'border-[#5D46E8] bg-[#5D46E8]' : 'border-[#CAD2DC] bg-white')}>
                      {active && <span className="h-3.5 w-3.5 rounded-full bg-white" />}
                    </span>

                    <span>
                      <span className="block text-lg font-black text-[#24282E]">{item.label}</span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-[#5D6572]">{item.description}</span>
                      <span className="mt-1 block text-xs font-black uppercase tracking-[0.08em] text-[#0B63B6]">{item.note}</span>
                    </span>

                    <span className="col-start-2 text-left sm:col-start-auto sm:text-right">
                      <span className="block text-2xl font-black text-[#24282E]">{item.price}</span>
                      <span className="block text-sm font-semibold text-[#5D6572]">{item.unit}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col border-t border-[#E4EAF1] px-7 py-8 sm:px-12 lg:border-l lg:border-t-0 lg:px-16 lg:py-20">
          <div className="grid grid-cols-2 rounded-[14px] bg-[#E8EBEF] p-1">
            {methods.map((item) => {
              const active = selectedMethod === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'h-14 rounded-[11px] text-base font-black transition duration-200 active:translate-y-px',
                    active ? 'bg-white text-[#22272E] shadow-[0_8px_18px_rgba(15,23,42,0.10)]' : 'text-[#6B7280] hover:text-[#22272E]'
                  )}
                  onClick={() => setSelectedMethod(item.id)}
                  aria-pressed={active}
                >
                  QR {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-9">
            <label className="text-base font-black text-[#3F4650]" htmlFor="billed-to">
              Người thanh toán
            </label>
            <input
              id="billed-to"
              value="Giáo viên Mascoteach"
              readOnly
              className="mt-3 h-14 w-full rounded-[13px] border border-[#CAD2DC] bg-[#F9FCFF] px-5 text-base font-bold text-[#24282E] outline-none"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-black tracking-[-0.01em] text-[#22272E]">Thanh toán bằng QR</h2>

            <div className="mt-6 grid gap-5 rounded-[18px] border border-[#CAD2DC] bg-white p-5 sm:grid-cols-[260px_1fr] sm:p-6">
              <QRPreview method={method} />

              <div className="flex min-w-0 flex-col justify-center">
                <div className={cn('inline-flex w-fit items-center gap-2 rounded-[10px] px-3 py-2 text-sm font-black', method.bg, method.text)}>
                  <QrCode className="h-4 w-4" />
                  {method.label}
                </div>
                <p className="mt-5 text-sm font-semibold leading-6 text-[#5D6572]">
                  Mở ứng dụng {method.label}, quét mã QR và kiểm tra đúng nội dung thanh toán trước khi xác nhận.
                </p>

                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 rounded-[11px] bg-[#F5F8FC] px-4 py-3">
                    <dt className="font-bold text-[#64748B]">Tài khoản</dt>
                    <dd className="text-right font-black text-[#24282E]">{method.account}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-[11px] bg-[#F5F8FC] px-4 py-3">
                    <dt className="font-bold text-[#64748B]">Nội dung</dt>
                    <dd className="text-right font-black text-[#24282E]">{method.content}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-2xl font-black text-[#22272E]">Tổng cộng</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#64748B]">
                  <Clock3 className="h-4 w-4" />
                  QR có hiệu lực trong 15 phút
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-[#24282E]">{plan.price}</p>
                <p className="text-sm font-semibold text-[#64748B]">{plan.unit}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[13px] bg-[#5D46E8] px-6 text-base font-black text-white shadow-[0_18px_40px_rgba(93,70,232,0.27)] transition hover:bg-[#4C38D0] active:translate-y-px"
            >
              <Check className="h-5 w-5" />
              Tôi đã thanh toán
            </button>

            <p className="mt-5 flex items-start gap-3 text-sm font-semibold leading-6 text-[#5D6572]">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-[#0B63B6]" />
              Giao dịch được xác nhận tự động qua cổng thanh toán. Nếu cần hỗ trợ, đội ngũ Mascoteach sẽ kiểm tra theo nội dung chuyển khoản.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
