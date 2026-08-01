import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function PasswordLockModal() {
  const { 
    isPasswordModalOpen, 
    setIsPasswordModalOpen, 
    targetLockCategory, 
    unlockCategory,
    setActiveCategoryId 
  } = useBookmarks();

  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isPasswordModalOpen || !targetLockCategory) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const success = unlockCategory(targetLockCategory.id, password);
    if (success) {
      setActiveCategoryId(targetLockCategory.id);
      setIsPasswordModalOpen(false);
      setPassword('');
    } else {
      setErrorMsg('密碼或 PIN 碼錯誤，請重新輸入。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-700/80 relative text-center">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsPasswordModalOpen(false);
            setPassword('');
            setErrorMsg('');
          }}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Header */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-100 mb-1">
          進入受保護分類
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          分頁「<span className="text-amber-400 font-semibold">{targetLockCategory.name}</span>」設定了安全防護密碼
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入解鎖密碼 (預設: 1234)"
              className="w-full px-4 py-3 rounded-xl glass-input text-center text-lg tracking-widest placeholder:text-slate-500 placeholder:tracking-normal placeholder:text-xs"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 text-left">
            <span className="text-amber-400 font-medium">💡 解鎖與修改提示：</span> 預設解鎖密碼為 <code className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">1234</code>。成功解鎖後，點擊頁面上的「管理此分類分頁」即可隨時更改自訂密碼！
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              驗證解鎖
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
