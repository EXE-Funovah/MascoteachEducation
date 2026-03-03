import { useRef } from 'react';
import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { TESTIMONIALS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* Pastel accent per card for variety */
const CARD_ACCENTS = [
  'border-blue-100/80 hover:border-blue-200',
  'border-sky-100/80 hover:border-sky-200',
  'border-teal-100/80 hover:border-teal-200',
  'border-blue-100/80 hover:border-blue-200',
  'border-amber-100/80 hover:border-amber-200',
  'border-emerald-100/80 hover:border-emerald-200',
];

const AVATAR_GRADIENTS = [
  'from-brand-navy to-brand-blue',
  'from-brand-blue to-brand-mid',
  'from-brand-mid to-brand-light',
  'from-sky-400 to-blue-500',
  'from-amber-300 to-orange-400',
  'from-emerald-300 to-teal-400',
];

export default function Testimonials() {
  const scrollRef = useRef(null);

  return (
    <section id="testimonials" className="py-24 md:py-32 mesh-testimonials relative overflow-hidden" aria-label="Đánh giá">
      <div className="orb orb-lavender w-[350px] h-[350px] top-10 -right-20 opacity-25" />
      <div className="orb orb-peach w-[250px] h-[250px] bottom-20 -left-16 opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <Badge color="orange" className="mb-4">Đánh giá</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Được yêu thích bởi{' '}
              <span className="text-gradient">giáo viên thực thụ</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Đây là những câu chuyện thật từ các trường đang sử dụng Mascoteach.
            </p>
          </div>
        </FadeInUp>

        {/* Scroll hint */}
        <div className="flex items-center justify-center gap-2 mb-6 md:hidden">
          <span className="text-xs text-ink-muted">Vuốt để xem thêm</span>
          <svg className="w-4 h-4 text-ink-muted animate-scroll-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden">
          <div ref={scrollRef} className="testimonial-scroll px-1">
            {TESTIMONIALS.map((testimonial, idx) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} idx={idx} />
            ))}
          </div>
        </div>

        {/* Desktop: staggered masonry */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {[0, 1, 2].map((colIdx) => (
            <div key={colIdx} className={cn('space-y-6', colIdx === 1 && 'mt-8')}>
              {TESTIMONIALS.filter((_, i) => i % 3 === colIdx).map((testimonial, idx) => (
                <FadeInUp key={testimonial.id} delay={(colIdx * 0.1) + (idx * 0.15)}>
                  <TestimonialCard testimonial={testimonial} idx={TESTIMONIALS.indexOf(testimonial)} />
                </FadeInUp>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, idx }) {
  return (
    <motion.div
      className={cn(
        'bg-white/90 backdrop-blur-sm rounded-3xl border p-6 md:p-7',
        'shadow-card-pastel hover:shadow-gamma-hover transition-all duration-300',
        'hover:-translate-y-1 w-[300px] md:w-auto',
        CARD_ACCENTS[idx % CARD_ACCENTS.length],
      )}
      whileHover={{ scale: 1.01 }}
    >
      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(star => (
          <svg key={star} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="text-body-md text-ink-secondary leading-relaxed mb-5">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
          AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
        )}>
          <span className="text-sm font-bold text-white">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
          <p className="text-xs text-ink-muted">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
}
