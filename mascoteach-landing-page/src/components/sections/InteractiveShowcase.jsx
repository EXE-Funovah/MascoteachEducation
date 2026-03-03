import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { SHOWCASE_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* Decorative blob colors per item */
const BLOB_COLORS = [
  'bg-brand-mid/20',
  'bg-brand-blue/18',
  'bg-brand-light/25',
];

const ITEM_EMOJIS = ['📝', '🎓', '🔧'];

export default function InteractiveShowcase() {
  return (
    <section id="showcase" className="py-24 md:py-32 relative overflow-hidden" aria-label="Giải pháp">
      <div className="orb orb-teal w-[350px] h-[350px] top-20 -left-32 opacity-30" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-20 -right-20 opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <Badge color="teal" className="mb-4">Giải pháp</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Xem Mascoteach{' '}
              <span className="text-gradient">trong hành động</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink/80 font-medium">
              Ba trụ cột tạo nên trải nghiệm lớp học khác biệt.
            </p>
          </div>
        </FadeInUp>

        {/* ── Zig-zag alternating layout ── */}
        <div className="space-y-20 md:space-y-28">
          {SHOWCASE_ITEMS.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <div className={cn(
                  'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center',
                )}>
                  {/* Text side */}
                  <div className={cn(
                    'space-y-6',
                    !isEven && 'lg:order-2',
                  )}>
                    <Badge color={item.badgeColor}>{item.badge}</Badge>
                    <h3 className="text-display-sm md:text-display-md">{item.title}</h3>
                    <p className="text-body-lg text-ink/75 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    <ul className="space-y-4 pt-2">
                      {item.features.map((feat, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.12 }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-body-md text-ink/70 font-medium">{feat}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual side with decorative blob */}
                  <div className={cn(!isEven && 'lg:order-1', 'relative')}>
                    {/* Background blob */}
                    <motion.div
                      className={cn(
                        'absolute -inset-6 rounded-[3rem] opacity-60',
                        BLOB_COLORS[idx],
                      )}
                      style={{ filter: 'blur(40px)' }}
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Geometric accent shapes */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-mid/15 rotate-12"
                      animate={{ rotate: [12, 20, 12] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute -bottom-3 -left-5 w-12 h-12 rounded-full bg-gradient-to-br from-brand-light/25 to-brand-mid/15"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />

                    {/* Video / media mockup */}
                    <div className="relative rounded-4xl bg-white border border-slate-100/80 shadow-gamma-float overflow-hidden">
                      <div className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid" />
                      <div className="p-8 md:p-10 min-h-[300px] lg:min-h-[360px] bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 flex items-center justify-center">
                        <div className="text-center space-y-5">
                          <motion.div
                            className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-brand-navy/10 to-brand-blue/15 flex items-center justify-center"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-gamma-card flex items-center justify-center">
                              <span className="text-3xl">
                                {ITEM_EMOJIS[idx]}
                              </span>
                            </div>
                          </motion.div>
                          <p className="text-sm text-ink-muted font-medium">
                            {item.visual === 'lesson-builder' ? 'Content Studio Preview' : item.visual === 'live-class' ? 'Live Class Dashboard' : 'Hardware Ecosystem'}
                          </p>
                          <div className="flex justify-center gap-2 mt-3">
                            <div className="h-2.5 w-20 rounded-full bg-brand-navy/12" />
                            <div className="h-2.5 w-16 rounded-full bg-brand-blue/12" />
                            <div className="h-2.5 w-12 rounded-full bg-brand-mid/15" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
