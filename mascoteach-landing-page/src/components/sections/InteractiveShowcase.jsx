import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeInUp from '@/components/animations/FadeInUp';
import Badge from '@/components/common/Badge';
import { SHOWCASE_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const current = SHOWCASE_ITEMS[activeTab];

  return (
    <section id="showcase" className="py-32 bg-surface relative overflow-hidden">
      <div className="orb orb-teal w-[350px] h-[350px] top-20 -left-32 opacity-40" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-20 -right-20 opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeInUp>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge color="teal" className="mb-4">Giải pháp</Badge>
            <h2 className="text-display-md md:text-display-lg">
              Xem Mascoteach{' '}
              <span className="text-gradient">trong hành động</span>
            </h2>
            <p className="mt-6 text-body-lg text-ink-secondary">
              Ba trụ cột tạo nên trải nghiệm lớp học khác biệt.
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {SHOWCASE_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                  idx === activeTab
                    ? 'bg-ink text-white shadow-gamma-card'
                    : 'bg-white text-ink-secondary border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                {item.badge}
              </button>
            ))}
          </div>
        </FadeInUp>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className={cn('space-y-6', activeTab % 2 !== 0 && 'lg:order-2')}>
                <Badge color={current.badgeColor}>{current.badge}</Badge>
                <h3 className="text-display-sm md:text-display-md">{current.title}</h3>
                <p className="text-body-lg text-ink-secondary leading-relaxed">{current.description}</p>
                <ul className="space-y-3 pt-4">
                  {current.features.map((feat, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-body-md text-ink-secondary">{feat}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className={cn(activeTab % 2 !== 0 && 'lg:order-1')}>
                <div className="relative rounded-4xl bg-white border border-slate-100 shadow-gamma-float overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-brand-navy via-brand-blue to-brand-mid" />
                  <div className="p-10 min-h-[350px] bg-gradient-to-br from-[#EBF5FB] via-white to-[#E0F0FA] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <motion.div
                        className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-brand-navy/10 to-brand-blue/15 flex items-center justify-center"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-gamma-card flex items-center justify-center">
                          <span className="text-2xl">
                            {activeTab === 0 ? String.fromCodePoint(0x1F4DD) : activeTab === 1 ? String.fromCodePoint(0x1F393) : String.fromCodePoint(0x1F527)}
                          </span>
                        </div>
                      </motion.div>
                      <p className="text-sm text-ink-muted font-medium">
                        {current.visual === 'lesson-builder' ? 'Content Studio Preview' : current.visual === 'live-class' ? 'Live Class Dashboard' : 'Hardware Ecosystem'}
                      </p>
                      <div className="flex justify-center gap-2 mt-2">
                        <div className="h-2 w-20 rounded-full bg-brand-navy/15" />
                        <div className="h-2 w-14 rounded-full bg-brand-blue/15" />
                        <div className="h-2 w-10 rounded-full bg-brand-mid/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
