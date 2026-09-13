import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function Toast() {
  const { toast, hideToast } = useBookmarks();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <aside
      aria-label="系統告示"
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-sm sm:max-w-md w-[90%] sm:w-auto transition-all"
    >
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border ${
          isSuccess 
            ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/60' 
            : isError
            ? 'bg-slate-900/95 border-rose-500/50 text-rose-300 shadow-rose-950/60'
            : isWarning
            ? 'bg-slate-900/95 border-amber-500/50 text-amber-300 shadow-amber-950/60'
            : 'bg-slate-900/95 border-indigo-500/50 text-indigo-300 shadow-indigo-950/60'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {isWarning && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
        {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}

        <div className="text-xs sm:text-sm font-semibold text-slate-100 flex-1 pr-1">
          {toast.message}
        </div>

        <button
          type="button"
          onClick={hideToast}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0"
          title="關閉告示"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
