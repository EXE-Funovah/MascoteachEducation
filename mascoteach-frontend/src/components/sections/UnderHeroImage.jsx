import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const RIGHT_PREVIEWS = [
  {
    title: 'Nhắc lại đúng lúc',
    image: '/references/mascoteach/right_underhero1.webp',
    alt: 'Sumadi nhắc học sinh quay lại phần kiến thức vừa bỏ lỡ',
  },
  {
    title: 'Phản hồi theo tiến độ',
    image: '/references/mascoteach/right_underhero2.webp',
    alt: 'Sumadi hiển thị tiến độ học tập và câu cần xem lại',
  },
  {
    title: 'Học như đang chơi',
    image: '/references/mascoteach/right_underhero3.webp',
    alt: 'Sumadi tạo cảm giác học như đang chơi với điểm số và huy hiệu',
  },
];

const sectionBackground =
  'radial-gradient(circle at left center, rgba(120, 170, 255, 0.08), transparent 42%), radial-gradient(circle at right center, rgba(120, 170, 255, 0.07), transparent 42%), linear-gradient(180deg, #F7FAFF 0%, #F4F8FF 100%)';

export default function UnderHeroImage() {
  const shouldReduceMotion = useReducedMotion();
  const reveal = shouldReduceMotion
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 22, scale: 0.98 };
  const visible = { opacity: 1, y: 0, scale: 1 };

  return (
    <section
      className="relative z-20 px-3 pb-20 text-ink sm:px-5 md:pb-24 lg:px-8 lg:pb-28 xl:pb-32"
      aria-labelledby="sumadi-intro-title"
      style={{ background: sectionBackground }}
    >
      <motion.div
        className="mx-auto w-[96%] max-w-[1520px] rounded-[20px] border border-[#78AAFF]/[0.16] bg-[#FBFDFF] p-[clamp(32px,4vw,64px)] shadow-[0_14px_44px_rgba(30,60,120,0.055)] sm:w-[94%] sm:rounded-[28px] lg:rounded-[32px]"
        initial={reveal}
        whileInView={visible}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.59fr)_minmax(440px,0.41fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/82 px-4 py-2.5 text-base font-semibold text-sky-400 shadow-[0_12px_34px_rgba(30,60,120,0.06)] md:text-lg">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Nền tảng game hóa bài học
            </div>

            <h2
              id="sumadi-intro-title"
              className="mt-5 max-w-[820px] text-4xl font-bold leading-tight text-ink md:text-[42px] lg:text-5xl"
            >
              Biến tài liệu học tập thành{' '}
              <span className="text-sky-500">trò chơi tương tác</span> cùng Sumadi
            </h2>

            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-ink/70 md:text-lg">
              Mascoteach giúp giáo viên tạo câu hỏi, quiz và hoạt động học tập từ giáo án,
              slide hoặc tài liệu có sẵn. Lớp học trở nên thú vị hơn, nhưng vẫn bám sát kiến thức chính.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-sky-500 px-8 py-3 text-base font-semibold text-white shadow-[0_12px_28px_rgba(14,165,233,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-600 active:scale-[0.98] md:text-lg"
              >
                Bắt đầu miễn phí
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/#how-it-works"
                className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-sky-200 bg-white px-8 py-3 text-base font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 active:scale-[0.98] md:text-lg"
              >
                Xem cách hoạt động
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <motion.article
              className="mt-6 grid max-w-[620px] grid-cols-[112px_1fr] items-center gap-4 rounded-[22px] border border-[#BBDCFB] bg-[#FBFDFF] p-4 md:grid-cols-[140px_1fr] md:p-5"
              initial={reveal}
              whileInView={visible}
              viewport={{ once: true, amount: 0.32 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.58, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex h-28 w-28 shrink-0 items-center justify-center md:h-36 md:w-36">
                <img
              src="/images/Sumadi_Exciting.webp"
                  alt="Sumadi, mascot học tập của Mascoteach."
                  className="h-[118%] w-[118%] object-contain object-center drop-shadow-[0_14px_24px_rgba(43,122,181,0.16)]"
                  draggable="false"
                />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-snug text-sky-500 md:text-lg">
                  Xin chào! Mình là Sumadi
                </h3>
                <p className="mt-2 text-base font-medium leading-8 text-ink/72 md:text-lg">
                  Mình là mascot học tập của Mascoteach, xuất hiện trong câu hỏi và trò chơi tương tác
                  để đồng hành cùng học sinh trên mỗi bài học.
                </p>
              </div>
            </motion.article>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:gap-6">
            {RIGHT_PREVIEWS.map((item, index) => (
              <motion.figure
                key={item.title}
                className="overflow-hidden rounded-[24px] border border-[#78AAFF]/[0.14] bg-white shadow-[0_12px_32px_rgba(30,60,120,0.06)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_40px_rgba(30,60,120,0.09)] md:rounded-[28px]"
                initial={reveal}
                whileInView={visible}
                viewport={{ once: true, amount: 0.26 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.56,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="block h-auto w-full object-contain"
                  draggable="false"
                />
              </motion.figure>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
