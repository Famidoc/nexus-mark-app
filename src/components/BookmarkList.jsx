import React, { useState } from 'react';
import { Globe, ExternalLink, Eye, Star, Edit3, Trash2, Tag } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function BookmarkList({ bookmark }) {
  const { 
    setActivePreviewUrl, 
    toggleFavorite, 
    deleteBookmark, 
    setEditingBookmark, 
    setIsBookmarkModalOpen 
  } = useBookmarks();

  const [favErr, setFavErr] = useState(false);

  return (
    <div className="glass-card rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-indigo-500/40">
      
      {/* Left: Favicon & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700/60 p-1.5 flex items-center justify-center shrink-0">
          {!favErr && bookmark.favicon ? (
            <img
              src={bookmark.favicon}
              alt={bookmark.domain}
              onError={() => setFavErr(true)}
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <Globe className="w-4 h-4 text-indigo-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-slate-100 truncate">
              {bookmark.title}
            </h4>
            {bookmark.isFavorite && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 truncate font-mono">
            {bookmark.url}
          </p>
        </div>
      </div>

      {/* Tags */}
      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          {bookmark.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 text-[11px] text-indigo-300 font-medium border border-indigo-500/20">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
        <button
          onClick={() => setActivePreviewUrl(bookmark.url)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>App內預覽</span>
        </button>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
          title="開啟新分頁"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={() => {
            setEditingBookmark(bookmark);
            setIsBookmarkModalOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          title="編輯"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (window.confirm(`確定要刪除「${bookmark.title}」嗎？`)) {
              deleteBookmark(bookmark.id);
            }
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          title="刪除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
