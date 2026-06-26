import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import FadeInUp from '@/components/animations/FadeInUp';

export default function CTASection() {
  return (
    <section className="relative z-10 bg-[#EAF4FF] px-4 pt-24 md:pt-28" aria-label="Dang ky nhan tin Mascoteach">
      <FadeInUp>
        <div className="relative mx-auto -mb-28 grid max-w-6xl overflow-hidden rounded-[22px] border-2 border-[#A8D8EA] bg-[#F8FCFF] px-7 py-10 text-[#173154] shadow-[0_30px_76px_rgba(27,58,107,0.16)] md:grid-cols-[0.94fr_1.06fr] md:px-14 md:py-12 lg:px-16 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(168,216,234,0.72),transparent_26%),radial-gradient(circle_at_86%_18%,rgba(43,122,181,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(240,249,255,0.86))]" />

          <div className="relative hidden min-h-[340px] items-end justify-center md:flex">
            <span className="absolute bottom-6 h-44 w-80 rounded-full bg-[#2B7AB5]/14 blur-2xl" aria-hidden="true" />
            <img
              src="/images/Sumadi_Waves.webp"
              alt="Sumadi vay tay"
              className="relative z-10 max-h-[410px] w-auto object-contain drop-shadow-[0_22px_28px_rgba(16,38,84,0.20)]"
            />
          </div>

          <div className="relative flex flex-col justify-center md:pl-8">
            <h2 className="max-w-2xl text-4xl font-bold leading-tight text-[#173154] md:text-[42px] lg:text-5xl">
              Nhận bản tin để cập nhật những hoạt động học tập mới nhất
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-ink/72 md:text-lg">
              Mascoteach gửi mẹo tạo quiz, mini game và tài nguyên lớp học ngắn gọn cho giáo viên.
            </p>

            <form
              className="mt-7 flex w-full max-w-[520px] flex-col gap-3 rounded-[26px] border border-[#A8D8EA] bg-white p-1.5 shadow-[0_14px_34px_rgba(27,58,107,0.08)] sm:flex-row sm:rounded-full"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="sr-only" htmlFor="newsletter-email">Email</label>
              <div className="flex min-h-12 flex-1 items-center gap-2 rounded-full px-4 text-[#173154]">
                <Mail className="h-5 w-5 flex-none text-[#2B7AB5]" strokeWidth={2.2} />
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email của bạn"
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#173154] placeholder:text-[#64748B] focus:outline-none md:text-lg"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#2B7AB5] px-7 text-base font-semibold text-white shadow-[0_12px_26px_rgba(43,122,181,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#1B3A6B] active:translate-y-0 md:text-lg"
              >
                Đăng ký
              </button>
            </form>

            <p className="mt-5 max-w-[520px] text-[15px] font-medium leading-7 text-ink/62 md:text-base">
              Bạn có thể hủy đăng ký bất cứ lúc nào. Xem{' '}
              <Link to="/privacy" className="font-semibold text-[#2B7AB5] underline underline-offset-4">
                chính sách bảo mật
              </Link>
              .
            </p>
          </div>
        </div>
      </FadeInUp>
    </section>
  );
}
