import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FadeInUp from '@/components/animations/FadeInUp';
import { SHOWCASE_INSIGHT } from '@/lib/constants';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 64 : -64,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction) => ({
    x: direction > 0 ? -64 : 64,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  }),
};

function SurveyMetric({ label, value }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl border border-sky-100/0 bg-sky-50/70 px-4 py-3.5 text-left transition-colors duration-200 hover:border-sky-200"
      whileHover={shouldReduceMotion ? undefined : { y: -3, boxShadow: '0 14px 34px rgba(56, 139, 200, 0.12)' }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-2xl font-black leading-none text-sky-500 tabular-nums">{value}</p>
      <p className="mt-2 text-xs font-semibold leading-snug text-ink/60 md:text-[13px]">{label}</p>
    </motion.div>
  );
}

function QuoteChip({ children, index }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.16 + index * 0.08, duration: 0.45 }}
      className="rounded-full bg-white px-4 py-2 text-xs font-medium leading-relaxed text-ink/66 shadow-[0_10px_30px_rgba(43,88,118,0.06)] md:text-[13px]"
    >
      {children}
    </motion.li>
  );
}

function QuestionSlide({ question }) {
  return (
    <div>
      <p className="text-xl font-semibold text-ink-muted/70">({question.id})</p>
      <h3 className="mt-4 max-w-3xl text-2xl font-bold leading-tight text-ink md:text-3xl">
        {question.title}
      </h3>
      <p className="mt-3 max-w-4xl text-[15px] font-medium leading-7 text-ink/62 md:text-base">
        {question.subtitle}
      </p>

      <ul className="mt-6 flex flex-wrap gap-3">
        {question.chips.map((chip, chipIndex) => (
          <QuoteChip key={chip} index={chipIndex}>
            {chip}
          </QuoteChip>
        ))}
      </ul>

      {question.note && (
        <p className="mt-5 max-w-4xl text-[15px] font-semibold leading-7 text-sky-600/90 md:text-base">
          {question.note}
        </p>
      )}
    </div>
  );
}

function InsightPillar({ pillar, index }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={{ delay: shouldReduceMotion ? 0 : 0.22 + index * 0.1, duration: 0.48 }}
      className="relative rounded-[1.2rem] bg-white p-3.5 shadow-[0_20px_60px_rgba(38,119,171,0.08)] md:p-4"
    >
      <p className="w-fit rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-500">
        {pillar.label}
      </p>
      <h4 className="mt-2.5 text-base font-bold text-sky-500 md:text-lg">{pillar.title}</h4>
      <p className="mt-2 text-sm font-medium leading-6 text-ink/72 md:text-[15px]">
        {pillar.description}
      </p>
      <p className="mt-2.5 text-xs font-semibold leading-5 text-ink/50 md:text-[13px]">
        {pillar.evidence}
      </p>
    </motion.article>
  );
}

function ValuesSlide({ insight }) {
  return (
    <div>
      <p className="text-2xl font-black text-sky-400">*</p>
      <h3 className="mt-4 max-w-5xl text-2xl font-bold leading-snug text-sky-500 md:text-3xl">
        {insight.title}
      </h3>
      <p className="mt-3 max-w-4xl text-[15px] font-medium leading-7 text-ink/62 md:text-base">
        {insight.body}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insight.pillars.map((pillar, index) => (
          <InsightPillar key={pillar.title} pillar={pillar} index={index} />
        ))}
      </div>
    </div>
  );
}

export default function InteractiveShowcase() {
  const { eyebrow, title, subtitle, meta, questions, insight } = SHOWCASE_INSIGHT;
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const slides = useMemo(() => [
    { id: 'q1', label: 'Vấn đề', eyebrow: 'Câu hỏi 1', type: 'question', question: questions[0] },
    { id: 'q2', label: 'Niềm tin', eyebrow: 'Câu hỏi 2', type: 'question', question: questions[1] },
    { id: 'values', label: 'Giá trị', eyebrow: 'Đúc kết', type: 'values', insight },
  ], [questions, insight]);

  const goToSlide = (nextIndex) => {
    if (nextIndex === activeSlide) return;
    setDirection(nextIndex > activeSlide ? 1 : -1);
    setActiveSlide(nextIndex);
  };

  const moveSlide = (step) => {
    const nextIndex = (activeSlide + step + slides.length) % slides.length;
    setDirection(step > 0 ? 1 : -1);
    setActiveSlide(nextIndex);
  };

  const currentSlide = slides[activeSlide];

  return (
    <section
      id="showcase"
      className="relative overflow-hidden bg-white py-16 md:py-24"
      aria-label="Insight khảo sát người dùng"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-sky-50/0 via-sky-50/70 to-sky-100/70" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <FadeInUp>
          <div className="mx-auto max-w-5xl">
            <p className="text-[15px] font-semibold text-sky-400 md:text-base">{eyebrow}</p>
            <div className="mt-5 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="max-w-4xl text-3xl font-bold leading-tight text-ink md:text-4xl lg:text-5xl">
                  {title}
                </h2>
                <p className="mt-4 max-w-3xl text-[15px] font-medium leading-7 text-ink/66 md:text-base">
                  {subtitle}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 md:w-[360px] md:grid-cols-1">
                {meta.map((item) => (
                  <SurveyMetric key={item.label} {...item} />
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50/85 shadow-[0_28px_90px_rgba(15,23,42,0.055)] md:mt-12"
        >
          <div className="flex flex-col gap-3 border-b border-white/80 bg-white/58 px-5 py-3.5 backdrop-blur md:flex-row md:items-center md:justify-between md:px-7">
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
              {slides.map((slide, index) => {
                const isActive = index === activeSlide;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={[
                      'relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-300 md:text-sm',
                      isActive
                        ? 'bg-sky-500 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)]'
                        : 'bg-white text-ink/48 hover:bg-sky-50 hover:text-sky-500',
                    ].join(' ')}
                  >
                    <span className="mr-2 text-[11px] opacity-75 md:text-xs">{slide.eyebrow}</span>
                    {slide.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-sky-100">
                <motion.div
                  className="h-full rounded-full bg-sky-500"
                  initial={false}
                  animate={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
                  transition={{ duration: 0.42, ease: [0.25, 0.4, 0.25, 1] }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => moveSlide(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:bg-sky-50 hover:text-sky-500 active:scale-95"
                  aria-label="Xem slide trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSlide(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm transition-all duration-300 hover:translate-x-0.5 hover:bg-sky-50 hover:text-sky-500 active:scale-95"
                  aria-label="Xem slide tiếp theo"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-50 via-white to-sky-50/70 p-6 md:min-h-[480px] md:p-7">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide.id}
                custom={direction}
                variants={shouldReduceMotion ? undefined : slideVariants}
                initial={shouldReduceMotion ? false : 'enter'}
                animate={shouldReduceMotion ? undefined : 'center'}
                exit={shouldReduceMotion ? undefined : 'exit'}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                {currentSlide.type === 'question' ? (
                  <QuestionSlide question={currentSlide.question} />
                ) : (
                  <ValuesSlide insight={currentSlide.insight} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
