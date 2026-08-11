import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

let openConfirmDialog = null;

export function confirmAction({
  title = 'Xác nhận thao tác',
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'danger',
}) {
  return new Promise((resolve) => {
    if (!openConfirmDialog) {
      resolve(false);
      return;
    }

    openConfirmDialog({
      title,
      message,
      confirmLabel,
      cancelLabel,
      tone,
      resolve,
    });
  });
}

export default function GlobalConfirmDialog() {
  const [request, setRequest] = useState(null);
  const requestRef = useRef(null);

  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  useEffect(() => {
    openConfirmDialog = (nextRequest) => {
      requestRef.current?.resolve(false);
      setRequest(nextRequest);
    };

    return () => {
      openConfirmDialog = null;
      requestRef.current?.resolve(false);
    };
  }, []);

  const close = useCallback((confirmed) => {
    const current = requestRef.current;
    if (!current) return;

    requestRef.current = null;
    setRequest(null);
    current.resolve(confirmed);
  }, []);

  useEffect(() => {
    if (!request) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, request]);

  if (!request) return null;

  const isDanger = request.tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close(false);
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="global-confirm-title"
        aria-describedby="global-confirm-message"
        className="w-full max-w-md rounded-[24px] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
      >
        <div className="flex items-start gap-4">
          <span className={`grid h-12 w-12 flex-none place-items-center rounded-2xl ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="global-confirm-title" className="text-xl font-black text-slate-950">
              {request.title}
            </h2>
            <p id="global-confirm-message" className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {request.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => close(false)}
            className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Đóng hộp thoại"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => close(false)}
            autoFocus
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            {request.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            className={`h-11 rounded-xl text-sm font-black text-white transition ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-navy hover:bg-slate-800'}`}
          >
            {request.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
