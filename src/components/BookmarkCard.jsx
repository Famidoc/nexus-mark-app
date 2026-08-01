import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Eye, 
  Star, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function BookmarkCard({ bookmark }) {
  const { 
    setActivePreviewUrl, 
    toggleFavorite, 
    deleteBookmark, 
    setEditingBookmark, 
    setIsBookmarkModalOpen 
  } = useBookmarks();

  const [favErr, setFavErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    setEditingBookmark(bookmark);
    setIsBookmarkModalOpen(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    if (window.confirm(`確定要刪除「${bookmark.title}」嗎？`)) {
      deleteBookmark(bookmark.id);
    }
    setShowMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  return (
    <div className="group glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
      
      {/* Top Section: Favicon, Domain, Actions */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          
          <div className="flex items-center gap-3">
            {/* Favicon Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 shadow-inner">
              {!favErr && bookmark.favicon ? (
                <img
                  src={bookmark.favicon}
                  alt={bookmark.domain}
                  onError={() => setFavErr(true)}
                  className="w-full h-full object-contain rounded"
                />
              ) : (
                <Globe className="w-5 h-5 text-indigo-400" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {bookmark.title}
              </h3>
              <p className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                {bookmark.domain || bookmark.url}
              </p>
            </div>
          </div>

          {/* Star & Action Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(bookmark.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmark.isFavorite 
                  ? 'text-amber-400 bg-amber-400/10' 
                  : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title={bookmark.isFavorite ? '已收藏' : '標記收藏'}
            >
              <Star className={`w-4 h-4 ${bookmark.isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div 
                  className="absolute right-0 top-full mt-1 w-36 glass-panel rounded-xl shadow-2xl border border-slate-700 py-1 z-20"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={handleCopy}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已複製網址' : '複製網址'}</span>
                  </button>
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-indigo-600/30 hover:text-white flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>編輯書籤</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>刪除書籤</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {bookmark.description}
          </p>
        )}

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {bookmark.tags.map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar: In-App Browser vs New Tab */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
        
        {/* In-App Browser Button (Requirement 1) */}
        <button
          onClick={() => setActivePreviewUrl(bookmark.url)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>App 內預覽</span>
        </button>

        {/* External Link */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
          title="在新分頁開啟網頁"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

    </div>
  );
}
