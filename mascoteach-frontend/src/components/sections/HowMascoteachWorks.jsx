import { motion, useReducedMotion } from 'framer-motion';
import { Sprout } from 'lucide-react';

const STEPS = [
  {
    number: '1',
    title: 'Tải tài liệu lên',
    description: 'Giáo viên tải giáo án, slide hoặc nội dung bài học vào Mascoteach.',
    image: '/references/mascoteach/mascoteach1.webp',
    alt: 'Giao diện tải tài liệu học tập lên Mascoteach.',
  },
  {
    number: '2',
    title: 'Tạo hoạt động tương tác',
    description: 'Mascoteach gợi ý câu hỏi, quiz hoặc mini game ngắn phù hợp với mục tiêu bài học.',
    image: '/references/mascoteach/mascoteach2.webp',
    alt: 'Mascoteach phân tích tài liệu và tạo câu hỏi, quiz, mini game.',
  },
  {
    number: '3',
    title: 'Học sinh tham gia cùng Sumadi',
    description: 'Học sinh trả lời, nhận phản hồi và quay lại đúng phần kiến thức cần học.',
    image: '/references/mascoteach/mascoteach3.webp',
    alt: 'Học sinh tham gia hoạt động học tập cùng Sumadi.',
  },
];

export default function HowMascoteachWorks() {
  const shouldReduceMotion = useReducedMotion();
  const hidden = shouldReduceMotion ? false : { opacity: 0, y: 26, scale: 0.98 };
  const show = { opacity: 1, y: 0, scale: 1 };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F7FAFF_0%,#FFFFFF_48%,#F6FAFF_100%)] px-4 py-20 text-[#173154] md:py-24 lg:py-28"
      aria-labelledby="how-mascoteach-works-title"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(219,236,255,0.52)_100%)]" />

      <div className="relative z-10 mx-auto max-w-[1520px]">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          initial={hidden}
          whileInView={show}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-[#BBDCFB] bg-white/82 px-5 py-3 text-base font-extrabold text-[#2F72E8] shadow-[0_12px_34px_rgba(30,60,120,0.06)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF4FF]">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </span>
            Đơn giản · Nhanh chóng · Hiệu quả
          </div>

          <h2
            id="how-mascoteach-works-title"
            className="mt-8 text-[clamp(2.4rem,5.2vw,5.4rem)] font-black leading-[1.05] tracking-normal text-[#173154]"
          >
            Cách <span className="text-[#2F72E8]">Mascoteach</span> hoạt động
          </h2>

          <p className="mx-auto mt-6 max-w-4xl text-lg font-medium leading-8 text-[#2F3D52]/78 md:text-[22px] md:leading-9">
            Chỉ với 3 bước, giáo viên có thể biến tài liệu học tập thành hoạt động tương tác cùng Sumadi.
          </p>
        </motion.div>

        <div className="relative mt-14 grid gap-6 lg:mt-20 lg:grid-cols-3 lg:gap-10">
          <div
            className="pointer-events-none absolute left-[31.5%] top-[172px] hidden h-0 w-[7%] border-t-4 border-dashed border-[#8DBEF2] opacity-75 lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-[31.5%] top-[172px] hidden h-0 w-[7%] border-t-4 border-dashed border-[#8DBEF2] opacity-75 lg:block"
            aria-hidden="true"
          />

          {STEPS.map((step, index) => (
            <motion.article
              key={step.number}
              className="relative overflow-hidden rounded-[30px] border border-[#D5E8FF] bg-white p-7 shadow-[0_18px_58px_rgba(30,60,120,0.075)] md:p-8 lg:min-h-[610px]"
              initial={hidden}
              whileInView={show}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.62,
                delay: shouldReduceMotion ? 0 : index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6DA6E8_0%,#2F72E8_100%)] text-3xl font-black text-white shadow-[0_14px_30px_rgba(47,114,232,0.24)]">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-2xl font-black leading-tight text-[#10284A] md:text-[28px]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base font-medium leading-7 text-[#2F3D52] md:text-lg">
                    {step.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-[24px] bg-[#F7FAFF]">
                <img
                  src={step.image}
                  alt={step.alt}
                  className="block h-auto w-full"
                  draggable="false"
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
