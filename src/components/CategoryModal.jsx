import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Lock, Shield, Check } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function CategoryModal({ isOpen, onClose, initialData = null }) {
  const { addCategory, updateCategory } = useBookmarks();

  const [name, setName] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setIsProtected(!!initialData.isProtected);
      setPassword(initialData.passwordHash || '');
    } else {
      setName('');
      setIsProtected(false);
      setPassword('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialData) {
      updateCategory(initialData.id, {
        name: name.trim(),
        isProtected,
        passwordHash: isProtected ? (password || '1234') : '',
        icon: isProtected ? 'Lock' : 'Folder'
      });
    } else {
      addCategory(name.trim(), isProtected, isProtected ? (password || '1234') : '');
    }

    onClose();
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

        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-5">
          <FolderPlus className="w-5 h-5 text-indigo-400" />
          <span>{initialData ? '編輯分類分頁' : '新增分類分頁'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              分類名稱 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: 影音娛樂, 金融投資"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Password Protection Toggle (Requirement 3) */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className={`w-4 h-4 ${isProtected ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-200">啟用密碼鎖防護</span>
              </div>
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
              />
            </div>

            {isProtected && (
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                  設定此分頁的解鎖 PIN / 密碼
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="留空預設為 1234"
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs placeholder:text-slate-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{initialData ? '更新分類' : '建立分類'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
