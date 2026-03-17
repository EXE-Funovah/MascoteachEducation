import { motion } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { SHOWCASE_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/* Decorative blob colors per item */
const BLOB_COLORS = [
  'bg-brand-mid/20',
  'bg-brand-blue/18',
];

const ITEM_EMOJIS = ['📝', '🎓'];

export default function InteractiveShowcase() {
  return (
    <section id="showcase" className="py-20 md:py-28 relative overflow-hidden" aria-label="Giải pháp">
      <div className="orb orb-teal w-[350px] h-[350px] top-20 -left-32 opacity-30" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-20 -right-20 opacity-25" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
            <Badge color="teal" className="mb-3">Giải pháp cốt lõi</Badge>
            <h2 className="text-display-sm md:text-display-md">
              Trải nghiệm Mascoteach trong hành động
            </h2>
            <p className="mt-4 text-body-md text-ink/80 font-medium">
              Hai công cụ mạnh mẽ giúp giáo viên dạy ít hơn — nhưng truyền cảm hứng nhiều hơn.
            </p>
          </div>
        </FadeInUp>

        {/* ── Zig-zag alternating layout — only 2 core blocks ── */}
        <div className="space-y-16 md:space-y-24">
          {SHOWCASE_ITEMS.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
              >
                <div className={cn(
                  'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center',
                )}>
                  {/* Text side */}
                  <div className={cn(
                    'space-y-5',
                    !isEven && 'lg:order-2',
                  )}>
                    <Badge color={item.badgeColor}>{item.badge}</Badge>
                    <h3 className="text-display-sm md:text-display-md leading-tight">{item.title}</h3>
                    <p className="text-body-md text-ink/75 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    <ul className="space-y-3 pt-1">
                      {item.features.map((feat, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.12 }}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-body-sm text-ink/70 font-medium">{feat}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual side with decorative blob — slightly enlarged */}
                  <div className={cn(!isEven && 'lg:order-1', 'relative')}>
                    {/* Background blob */}
                    <motion.div
                      className={cn(
                        'absolute -inset-5 rounded-[2.5rem] opacity-60',
                        BLOB_COLORS[idx],
                      )}
                      style={{ filter: 'blur(40px)' }}
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Geometric accent shapes */}
                    <motion.div
                      className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue/15 to-brand-mid/15 rotate-12"
                      animate={{ rotate: [12, 20, 12] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute -bottom-2 -left-4 w-10 h-10 rounded-full bg-gradient-to-br from-brand-light/25 to-brand-mid/15"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />

                    {/* Video / media mockup — enlarged for 2-item layout */}
                    <div className="relative rounded-3xl bg-white border border-slate-100/80 shadow-gamma-float overflow-hidden">
                      <div className="h-1.5 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid" />
                      <div className="p-8 md:p-10 min-h-[280px] lg:min-h-[340px] bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <motion.div
                            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-navy/10 to-brand-blue/15 flex items-center justify-center"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                          >
                            <div className="w-14 h-14 rounded-xl bg-white shadow-gamma-card flex items-center justify-center">
                              <span className="text-2xl">
                                {ITEM_EMOJIS[idx]}
                              </span>
                            </div>
                          </motion.div>
                          <p className="text-xs text-ink-muted font-medium">
                            {item.visual === 'lesson-builder' ? 'Content Studio Preview' : 'Live Class Dashboard'}
                          </p>
                          <div className="flex justify-center gap-2 mt-2">
                            <div className="h-2 w-16 rounded-full bg-brand-navy/12" />
                            <div className="h-2 w-12 rounded-full bg-brand-blue/12" />
                            <div className="h-2 w-10 rounded-full bg-brand-mid/15" />
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
