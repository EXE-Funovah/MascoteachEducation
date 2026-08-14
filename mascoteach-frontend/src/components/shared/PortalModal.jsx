import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function PortalModal({
    open,
    title,
    description,
    onClose,
    children,
    icon: Icon,
    maxWidth = 'max-w-xl',
    closeDisabled = false,
}) {
    const titleId = useId();
    const descriptionId = useId();
    const panelRef = useRef(null);
    const returnFocusRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const closeDisabledRef = useRef(closeDisabled);
    const reduceMotion = useReducedMotion();

    onCloseRef.current = onClose;
    closeDisabledRef.current = closeDisabled;

    useEffect(() => {
        if (!open) return undefined;

        returnFocusRef.current = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const focusFrame = window.requestAnimationFrame(() => {
            const panel = panelRef.current;
            const preferredTarget = panel?.querySelector('[autofocus]');
            const firstTarget = panel?.querySelector(FOCUSABLE_SELECTOR);
            (preferredTarget || firstTarget || panel)?.focus();
        });

        function handleKeyDown(event) {
            if (event.key === 'Escape' && !closeDisabledRef.current) {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab') return;
            const focusableItems = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []);
            if (!focusableItems.length) {
                event.preventDefault();
                panelRef.current?.focus();
                return;
            }

            const firstItem = focusableItems[0];
            const lastItem = focusableItems[focusableItems.length - 1];
            if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.cancelAnimationFrame(focusFrame);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
            returnFocusRef.current?.focus?.();
        };
    }, [open]);

    const motionTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.2, ease: [0.22, 1, 0.36, 1] };

    return (
        <AnimatePresence initial={false}>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/20 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={motionTransition}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !closeDisabledRef.current) {
                            onCloseRef.current?.();
                        }
                    }}
                >
                    <motion.section
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={description ? descriptionId : undefined}
                        tabIndex={-1}
                        className={`relative max-h-[85dvh] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl outline-none ${maxWidth}`}
                        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.99 }}
                        transition={motionTransition}
                    >
                        <header className="flex items-start justify-between gap-4 border-b border-slate-100/60 px-6 py-5 sm:px-8">
                            <div className="flex min-w-0 items-start gap-3">
                                {Icon && (
                                    <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-sky-50 text-sky-500">
                                        <Icon className="h-[18px] w-[18px]" />
                                    </span>
                                )}
                                <div className="min-w-0">
                                    <h2 id={titleId} className="text-lg font-black tracking-tight text-slate-900">{title}</h2>
                                    {description && <p id={descriptionId} className="mt-1 text-sm font-semibold leading-5 text-slate-500">{description}</p>}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => onCloseRef.current?.()}
                                disabled={closeDisabled}
                                className="grid h-9 w-9 flex-none place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light/30 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Đóng hộp thoại"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </header>
                        <div className="max-h-[calc(85dvh-5rem)] overflow-y-auto px-6 py-6 sm:px-8">
                            {children}
                        </div>
                    </motion.section>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
