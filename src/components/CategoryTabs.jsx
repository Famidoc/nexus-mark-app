import React, { useState, useRef, useEffect } from 'react';
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
  Key,
  Edit2,
  Check,
  X,
  GripVertical
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
    deleteCategory,
    reorderCategories,
    renameCategory
  } = useBookmarks();

  // Inline Editing States
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const editInputRef = useRef(null);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Mobile Touch Drag & Long Press States
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const isTouchDraggingRef = useRef(false);
  const touchActiveIndexRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const tabsContainerRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCatId]);

  const handleTabClick = (category) => {
    if (editingCatId === category.id) return;
    if (category.isProtected && !checkCategoryAccess(category.id)) {
      setTargetLockCategory(category);
      setIsPasswordModalOpen(true);
    } else {
      setActiveCategoryId(category.id);
    }
  };

  // Start Inline Editing
  const startEditing = (e, category) => {
    if (e) e.stopPropagation();
    setEditingCatId(category.id);
    setEditingName(category.name);
  };

  // Save Inline Editing
  const saveEditing = () => {
    if (editingCatId && editingName.trim()) {
      renameCategory(editingCatId, editingName.trim());
    }
    setEditingCatId(null);
    setEditingName('');
  };

  // Cancel Inline Editing
  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingCatId(null);
    setEditingName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // HTML5 Drag and Drop Handlers (Desktop)
  const handleDragStart = (e, index) => {
    if (editingCatId !== null) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e, index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      reorderCategories(sourceIndex, targetIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mobile Touch Handlers
  const handleTouchStart = (e, index, category) => {
    if (editingCatId !== null) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    touchActiveIndexRef.current = index;
    isTouchDraggingRef.current = false;

    // Long press detection for renaming (500ms)
    longPressTimerRef.current = setTimeout(() => {
      if (!isTouchDraggingRef.current) {
        startEditing(null, category);
      }
    }, 500);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

    if (dx > 10 || dy > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (dx > 15 && touchActiveIndexRef.current !== null && editingCatId === null) {
      isTouchDraggingRef.current = true;
      setDraggedIndex(touchActiveIndexRef.current);

      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const tabElement = element?.closest('[data-category-index]');
      if (tabElement) {
        const overIdx = parseInt(tabElement.getAttribute('data-category-index'), 10);
        if (!isNaN(overIdx) && overIdx !== dragOverIndex) {
          setDragOverIndex(overIdx);
        }
      }
    }
  };

  const handleTouchEnd = (e, index, category) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isTouchDraggingRef.current) {
      if (dragOverIndex !== null && touchActiveIndexRef.current !== null && dragOverIndex !== touchActiveIndexRef.current) {
        reorderCategories(touchActiveIndexRef.current, dragOverIndex);
      }
      setDraggedIndex(null);
      setDragOverIndex(null);
      isTouchDraggingRef.current = false;
      touchActiveIndexRef.current = null;
    } else if (editingCatId === null) {
      handleTabClick(category);
    }
  };

  const getCategoryIcon = (iconName, isProtected, isUnlocked) => {
    if (isProtected) {
      return isUnlocked ? (
        <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
      );
    }
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4 shrink-0" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 shrink-0" />;
      default: return <Folder className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 mt-5 mb-4 overflow-hidden">
      <div 
        ref={tabsContainerRef} 
        onTouchMove={handleTouchMove}
        className="w-full overflow-x-auto no-scrollbar touch-pan-x py-1"
      >
        {/* Category Tab Buttons */}
        <div className="flex items-center gap-2.5 flex-nowrap min-w-max pb-1">
          {categories.map((cat, index) => {
            const isActive = activeCategoryId === cat.id;
            const isUnlocked = checkCategoryAccess(cat.id);
            const isEditing = editingCatId === cat.id;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={cat.id}
                data-category-index={index}
                draggable={!isEditing}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={(e) => handleDragLeave(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index, cat)}
                onTouchEnd={(e) => handleTouchEnd(e, index, cat)}
                onClick={() => !isEditing && handleTabClick(cat)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startEditing(e, cat);
                }}
                className={`group relative shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl select-none transition-all duration-200 ${
                  isEditing ? 'cursor-text ring-2 ring-indigo-400 bg-slate-800' : 'cursor-grab active:cursor-grabbing'
                } ${
                  isDragging ? 'opacity-30 scale-95 border-dashed border-indigo-400' : ''
                } ${
                  isDragOver ? 'ring-2 ring-emerald-400 scale-105 shadow-lg shadow-emerald-500/20' : ''
                } ${
                  isActive && !isEditing
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 font-semibold ring-1 ring-white/20'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                }`}
                title={isEditing ? '按 Enter 儲存，Esc 取消' : '點擊切換、按住拖曳排序、雙擊或長按更名'}
              >
                {/* Drag Grip Handle */}
                {!isEditing && (
                  <GripVertical className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-80 transition-opacity -mr-1" />
                )}

                {/* Icon */}
                {getCategoryIcon(cat.icon, cat.isProtected, isUnlocked)}

                {/* Inline Editing Form / Tab Name */}
                {isEditing ? (
                  <div 
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={editInputRef}
                      type="text"
                      maxLength={20}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEditing}
                      className="bg-slate-900 text-white px-2 py-0.5 rounded text-xs sm:text-sm font-semibold outline-none border border-indigo-500 w-24 sm:w-28 shadow-inner"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        saveEditing();
                      }}
                      className="p-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white transition-colors"
                      title="確認修改"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        cancelEditing();
                      }}
                      className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                      title="取消"
                    >
                      <X className="w-3 h-3 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm whitespace-nowrap">{cat.name}</span>
                )}

                {/* Protected indicator */}
                {!isEditing && cat.isProtected && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {isUnlocked ? '解鎖' : '加密'}
                  </span>
                )}

                {/* Quick actions on tab hover */}
                {!isEditing && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 gap-0.5">
                    {/* Quick Edit Name Button */}
                    <button
                      type="button"
                      onClick={(e) => startEditing(e, cat)}
                      className="p-1 hover:text-indigo-300 hover:bg-slate-700/50 rounded transition-colors"
                      title="雙擊或點此修改名稱"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete Category Button (if > 1 categories) */}
                    {categories.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確定要刪除分類「${cat.name}」及其下的所有書籤嗎？`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1 hover:text-rose-400 hover:bg-slate-700/50 rounded transition-colors"
                        title="刪除分類"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Category Button */}
          <button
            onClick={() => onOpenCategoryModal(null)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl glass-card text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 border-dashed border-indigo-500/40 transition-all whitespace-nowrap"
            title="新增分類分頁"
          >
            <Plus className="w-4 h-4" />
            <span>新增分類</span>
          </button>
        </div>

      </div>
    </div>
  );
}
