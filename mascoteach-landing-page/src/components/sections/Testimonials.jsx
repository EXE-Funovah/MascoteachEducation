import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { TESTIMONIALS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function Testimonials() {
  const col1 = TESTIMONIALS.filter((_, i) => i % 3 === 0);
  const col2 = TESTIMONIALS.filter((_, i) => i % 3 === 1);
  const col3 = TESTIMONIALS.filter((_, i) => i % 3 === 2);
  const columns = [col1, col2, col3];

  return (
    <section id="testimonials" className="py-32 mesh-testimonials relative overflow-hidden">
      <div className="orb orb-teal w-[300px] h-[300px] top-10 -right-20 opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="space-y-6">
              {col.map((testimonial, idx) => (
                <FadeInUp key={testimonial.id} delay={(colIdx * 0.1) + (idx * 0.15)}>
                  <div className={cn(
                    'bg-white rounded-3xl border border-slate-100 p-7',
                    'shadow-gamma-soft hover:shadow-gamma-card transition-all duration-300',
                    'hover:-translate-y-0.5'
                  )}>
                    <p className="text-body-md text-ink-secondary italic leading-relaxed mb-5">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-navy/20 to-brand-blue/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-brand-blue">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">{testimonial.name}</p>
                        <p className="text-xs text-ink-muted">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
