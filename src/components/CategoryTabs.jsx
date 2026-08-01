import React from 'react';
import { 
  Folder, 
  Lock, 
  Unlock, 
  Plus, 
  Globe, 
  Briefcase, 
  BookOpen, 
  ShieldCheck,
  Settings,
  Trash2,
  Key
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function CategoryTabs({ onOpenCategoryModal }) {
  const { 
    categories, 
    activeCategoryId, 
    setActiveCategoryId, 
    checkCategoryAccess,
    setTargetLockCategory,
    setIsPasswordModalOpen,
    deleteCategory
  } = useBookmarks();

  const handleTabClick = (category) => {
    if (category.isProtected && !checkCategoryAccess(category.id)) {
      setTargetLockCategory(category);
      setIsPasswordModalOpen(true);
    } else {
      setActiveCategoryId(category.id);
    }
  };

  const handleToggleLock = (e, category) => {
    e.stopPropagation();
    setTargetLockCategory(category);
    setIsPasswordModalOpen(true);
  };

  const getCategoryIcon = (iconName, isProtected, isUnlocked) => {
    if (isProtected) {
      return isUnlocked ? (
        <Unlock className="w-4 h-4 text-emerald-400" />
      ) : (
        <Lock className="w-4 h-4 text-amber-400" />
      );
    }
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6 mb-4">
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
        
        {/* Category Tab Buttons */}
        <div className="flex items-center gap-2.5 flex-nowrap">
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            const isUnlocked = checkCategoryAccess(cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => handleTabClick(cat)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 font-semibold ring-1 ring-white/20'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                }`}
              >
                {/* Icon */}
                {getCategoryIcon(cat.icon, cat.isProtected, isUnlocked)}

                {/* Name */}
                <span className="text-sm whitespace-nowrap">{cat.name}</span>

                {/* Protected indicator */}
                {cat.isProtected && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isUnlocked ? '解鎖' : '加密'}
                  </span>
                )}

                {/* Quick actions on tab hover (for custom categories) */}
                {categories.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`確定要刪除分類「${cat.name}」及其下的所有書籤嗎？`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity ml-1"
                    title="刪除分類"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Category Button */}
          <button
            onClick={() => onOpenCategoryModal(null)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl glass-card text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border-dashed border-indigo-500/40 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>新增分類</span>
          </button>
        </div>

      </div>
    </div>
  );
}
