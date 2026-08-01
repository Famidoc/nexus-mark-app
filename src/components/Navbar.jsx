import React from 'react';
import { 
  Bookmark, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Cloud, 
  CloudOff, 
  User, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';

export default function Navbar({ onOpenAuthModal, onOpenCategoryModal }) {
  const { currentUser, isGuest, logout } = useAuth();
  const { 
    searchQuery, 
    setSearchQuery, 
    viewMode, 
    setViewMode, 
    setIsBookmarkModalOpen, 
    setEditingBookmark 
  } = useBookmarks();

  const handleAddNew = () => {
    setEditingBookmark(null);
    setIsBookmarkModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
              <Bookmark className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight">
                Nexus Mark
              </h1>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                跨裝置網址管家 <Sparkles className="w-3 h-3 text-indigo-400 inline" />
              </p>
            </div>
          </div>

          {/* Sync Status Badge (Mobile view) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenAuthModal}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentUser 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {currentUser ? <Cloud className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
              {currentUser ? '雲端已同步' : '本機模式'}
            </button>
          </div>
        </div>

        {/* Search Bar (Requirement 5) */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋當前分頁的網址、標題或標籤..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
            >
              清除
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="卡片圖卡"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="條列清單"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sync Status Badge (Desktop) */}
          <button
            onClick={onOpenAuthModal}
            className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentUser 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {currentUser ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            <span>{currentUser ? `${currentUser.email?.split('@')[0]} (同步中)` : '本機模式 (點擊登入)'}</span>
          </button>

          {/* Add New Bookmark */}
          <button
            onClick={handleAddNew}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>新增網址</span>
          </button>
        </div>

      </div>
    </header>
  );
}
