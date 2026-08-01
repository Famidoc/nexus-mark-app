import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider, useBookmarks } from './context/BookmarkContext';
import Navbar from './components/Navbar';
import CategoryTabs from './components/CategoryTabs';
import BookmarkCard from './components/BookmarkCard';
import BookmarkList from './components/BookmarkList';
import InAppBrowserModal from './components/InAppBrowserModal';
import BookmarkModal from './components/BookmarkModal';
import PasswordLockModal from './components/PasswordLockModal';
import AuthModal from './components/AuthModal';
import CategoryModal from './components/CategoryModal';

import { 
  Bookmark, 
  Plus, 
  Search, 
  Lock, 
  Sparkles, 
  FolderOpen, 
  ShieldCheck, 
  Compass 
} from 'lucide-react';

function MainApp() {
  const { 
    filteredBookmarks, 
    categories, 
    activeCategoryId, 
    checkCategoryAccess, 
    searchQuery,
    viewMode,
    setIsBookmarkModalOpen,
    setEditingBookmark,
    setTargetLockCategory,
    setIsPasswordModalOpen
  } = useBookmarks();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
  const isAccessAllowed = checkCategoryAccess(activeCategoryId);

  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCategoryModal={handleOpenCategoryModal}
      />

      {/* Category Tabs Bar */}
      <CategoryTabs onOpenCategoryModal={handleOpenCategoryModal} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 mt-2">
        
        {/* Category Header & Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span>{activeCategory?.name}</span>
                {activeCategory?.isProtected && (
                  <Lock className="w-5 h-5 text-amber-400 inline" />
                )}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                {filteredBookmarks.length} 個網址
              </span>
            </div>
            {searchQuery && (
              <p className="text-xs text-indigo-400 mt-1">
                🔍 即時搜尋關鍵字：「<span className="font-semibold">{searchQuery}</span>」
              </p>
            )}
          </div>

          {/* Category Manage Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenCategoryModal(activeCategory)}
              className="px-3 py-1.5 rounded-xl glass-card text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-all"
            >
              <span>管理此分類分頁</span>
            </button>
          </div>
        </div>

        {/* Content Display: Access Control Gate */}
        {!isAccessAllowed ? (
          /* Protected Tab Locked Banner (Requirement 3) */
          <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto my-12 border border-amber-500/30">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-5 shadow-xl shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              此分頁已被密碼防護鎖定
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              「<span className="text-amber-300 font-semibold">{activeCategory.name}</span>」為隱密分類，請驗證密碼後讀取裡面的網址書籤。
            </p>
            <button
              onClick={() => {
                setTargetLockCategory(activeCategory);
                setIsPasswordModalOpen(true);
              }}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              輸入密碼解鎖此分頁
            </button>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-800">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">
              {searchQuery ? '沒有找到相符的網址書籤' : '此分類尚無網址書籤'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {searchQuery 
                ? '請嘗試更換搜尋關鍵字或搜尋其他分類分頁。' 
                : '點擊下方按鈕新增第一個網址連結，App 將自動抓取 Favicon 與標題！'}
            </p>
            <button
              onClick={() => {
                setEditingBookmark(null);
                setIsBookmarkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>立即新增網址</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBookmarks.map(bookmark => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-3">
            {filteredBookmarks.map(bookmark => (
              <BookmarkList key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Nexus Mark App — 跨電腦與手機網址同步管家</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 加密防護</span>
            <span className="flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-indigo-400" /> PWA 支持</span>
          </div>
        </div>
      </footer>

      {/* All Modals */}
      <InAppBrowserModal />
      <BookmarkModal />
      <PasswordLockModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        initialData={editingCategory} 
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <MainApp />
      </BookmarkProvider>
    </AuthProvider>
  );
}
