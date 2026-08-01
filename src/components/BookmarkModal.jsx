import React, { useState, useEffect } from 'react';
import { X, Sparkles, Globe, Tag, Check, Loader2 } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { fetchUrlMetadata } from '../services/metaFetcher';

export default function BookmarkModal() {
  const { 
    isBookmarkModalOpen, 
    setIsBookmarkModalOpen, 
    editingBookmark, 
    addBookmark, 
    updateBookmark,
    categories,
    activeCategoryId
  } = useBookmarks();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [categoryId, setCategoryId] = useState(activeCategoryId);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [fetchedFavicon, setFetchedFavicon] = useState('');
  const [fetchedDomain, setFetchedDomain] = useState('');

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url || '');
      setTitle(editingBookmark.title || '');
      setDescription(editingBookmark.description || '');
      setTagsInput(editingBookmark.tags ? editingBookmark.tags.join(', ') : '');
      setCategoryId(editingBookmark.categoryId || activeCategoryId);
      setFetchedFavicon(editingBookmark.favicon || '');
      setFetchedDomain(editingBookmark.domain || '');
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setTagsInput('');
      setCategoryId(activeCategoryId);
      setFetchedFavicon('');
      setFetchedDomain('');
    }
  }, [editingBookmark, isBookmarkModalOpen, activeCategoryId]);

  if (!isBookmarkModalOpen) return null;

  const handleUrlBlur = async () => {
    if (!url.trim() || title.trim()) return; // Don't overwrite existing user title
    setIsFetchingMeta(true);
    const meta = await fetchUrlMetadata(url);
    if (meta) {
      setTitle(meta.title);
      setDescription(meta.description);
      setFetchedFavicon(meta.favicon);
      setFetchedDomain(meta.domain);
    }
    setIsFetchingMeta(false);
  };

  const handleFetchManual = async () => {
    if (!url.trim()) return;
    setIsFetchingMeta(true);
    const meta = await fetchUrlMetadata(url);
    if (meta) {
      setTitle(meta.title);
      setDescription(meta.description);
      setFetchedFavicon(meta.favicon);
      setFetchedDomain(meta.domain);
    }
    setIsFetchingMeta(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const parsedTags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    let domain = fetchedDomain;
    if (!domain) {
      try { domain = new URL(url).hostname; } catch (err) {}
    }

    let favicon = fetchedFavicon;
    if (!favicon && domain) {
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    const payload = {
      url: /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`,
      title: title.trim() || domain || url,
      description: description.trim(),
      tags: parsedTags,
      categoryId,
      domain,
      favicon
    };

    if (editingBookmark) {
      updateBookmark(editingBookmark.id, payload);
    } else {
      addBookmark(payload);
    }

    setIsBookmarkModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-700/80 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsBookmarkModalOpen(false)}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-indigo-400" />
          <span>{editingBookmark ? '編輯網址書籤' : '新增網址書籤'}</span>
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-[#16] flex flex-col gap-4">
          
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              網址 URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="https://example.com"
                className="w-full pr-24 pl-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={handleFetchManual}
                disabled={isFetchingMeta || !url.trim()}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all disabled:opacity-50"
              >
                {isFetchingMeta ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>自動分析</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              書籤標題
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入顯示名稱 (若留空自動帶入網址標題)"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              歸屬分類分頁
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-200 bg-slate-900"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.isProtected ? '(🔒 加密分頁)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              備註說明 / 描述
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="新增此網址的個人筆記或備註..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              標籤 Tag (以逗號分隔)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="例如: 工作, 前端, 參考文獻"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsBookmarkModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingBookmark ? '儲存變更' : '建立書籤'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
