import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Globe, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function InAppBrowserModal() {
  const { activePreviewUrl, setActivePreviewUrl } = useBookmarks();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!activePreviewUrl) return null;

  let domain = 'web-view';
  try {
    domain = new URL(activePreviewUrl).hostname;
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className={`glass-panel w-full rounded-2xl flex flex-col shadow-2xl border border-slate-700/80 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'h-full max-w-full rounded-none' : 'h-[85vh] max-w-6xl'
      }`}>
        
        {/* Top Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-300">App 內瀏覽器</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  {domain}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                {activePreviewUrl}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh */}
            <button
              onClick={() => setIframeKey(prev => prev + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="重新載入"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title={isFullscreen ? '退出全螢幕' : '全螢幕預覽'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Open in New Tab */}
            <a
              href={activePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">新視窗開啟</span>
            </a>

            {/* Close */}
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="關閉預覽"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Security / X-Frame-Options Banner */}
        <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>提示：若頁面顯示空白，代表目標網站 (如 Google, GitHub) 啟用安全防護阻擋 iframe 內嵌。</span>
          </div>
          <a
            href={activePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline font-medium shrink-0 ml-2"
          >
            直接以瀏覽器開啟 &rarr;
          </a>
        </div>

        {/* Embedded Web View */}
        <div className="flex-1 bg-white relative overflow-hidden">
          <iframe
            key={iframeKey}
            src={activePreviewUrl}
            title="In-App Web Preview"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>

      </div>
    </div>
  );
}
