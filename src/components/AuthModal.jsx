import React, { useState } from 'react';
import { X, Cloud, Lock, Mail, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    isGuest, 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    logout, 
    enableGuestMode 
  } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Google 登入失敗，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || '登入失敗，請檢查帳號密碼。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700/80 relative">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/10">
            <Cloud className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">
            {currentUser ? '跨裝置帳號狀態' : '登入同步雲端資料庫'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser 
              ? `已登入：${currentUser.email}` 
              : '登入後可於手機與電腦端自動秒級同步所有網址書籤與分類'}
          </p>
        </div>

        {/* If user is already logged in */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <UserCheck className="w-5 h-5 shrink-0" />
              <span>雲端同步運作中！您在電腦或手機上的任何修改皆已自動儲存。</span>
            </div>

            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 transition-all"
            >
              登出帳號
            </button>
          </div>
        ) : (
          /* Login Form */
          <div className="space-y-4">
            
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl glass-card hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 border border-slate-700 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>使用 Google 一鍵登入</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-3 text-[11px] text-slate-500 font-medium">或 Email 登入</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密碼"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isRegisterMode ? '註冊帳號' : '登入並同步'}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-indigo-400 hover:underline"
              >
                {isRegisterMode ? '已有帳號？返回登入' : '還沒有帳號？立即免費註冊'}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  enableGuestMode();
                  onClose();
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                暫不登入，使用「本機訪客模式」續用
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
