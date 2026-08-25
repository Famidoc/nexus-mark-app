import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseAvailable, collection, doc, setDoc, deleteDoc, onSnapshot, query, where } from '../services/firebase';

const BookmarkContext = createContext();

const INITIAL_CATEGORIES = [
  { id: 'cat-default', name: '常用網址', icon: 'Globe', isProtected: false, passwordHash: '' },
  { id: 'cat-work', name: '工作專案', icon: 'Briefcase', isProtected: false, passwordHash: '' },
  { id: 'cat-study', name: '學習資源', icon: 'BookOpen', isProtected: false, passwordHash: '' },
  { id: 'cat-secret', name: '隱密私房鎖', icon: 'Lock', isProtected: true, passwordHash: '1234' } // Default PIN 1234 for demo
];

const INITIAL_BOOKMARKS = [
  {
    id: 'bm-1',
    categoryId: 'cat-default',
    title: 'Google 搜尋引擎',
    url: 'https://www.google.com',
    domain: 'google.com',
    favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
    description: '全球最大搜索引擎',
    tags: ['搜尋', '日常'],
    isFavorite: true,
    createdAt: Date.now() - 100000
  },
  {
    id: 'bm-2',
    categoryId: 'cat-default',
    title: 'GitHub 開源社群',
    url: 'https://github.com',
    domain: 'github.com',
    favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    description: '程式碼託管與協作平台',
    tags: ['程式', '開發'],
    isFavorite: true,
    createdAt: Date.now() - 90000
  },
  {
    id: 'bm-3',
    categoryId: 'cat-work',
    title: 'Tailwind CSS 官方文件',
    url: 'https://tailwindcss.com',
    domain: 'tailwindcss.com',
    favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128',
    description: '實用的 Utility-First CSS 框架',
    tags: ['前端', 'CSS'],
    isFavorite: false,
    createdAt: Date.now() - 80000
  },
  {
    id: 'bm-4',
    categoryId: 'cat-study',
    title: 'MDN Web Docs 華語文獻',
    url: 'https://developer.mozilla.org',
    domain: 'developer.mozilla.org',
    favicon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=128',
    description: '權威的 Web 開發技術手冊',
    tags: ['教學', 'JavaScript'],
    isFavorite: false,
    createdAt: Date.now() - 70000
  },
  {
    id: 'bm-5',
    categoryId: 'cat-secret',
    title: '我的加密秘密文檔與金鑰範例',
    url: 'https://proton.me',
    domain: 'proton.me',
    favicon: 'https://www.google.com/s2/favicons?domain=proton.me&sz=128',
    description: '受密碼保護的分類內容，僅限輸入正確密碼後讀取',
    tags: ['私人', '加密'],
    isFavorite: true,
    createdAt: Date.now() - 60000
  }
];

export function BookmarkProvider({ children }) {
  const { currentUser, isGuest } = useAuth();

  const [categories, setCategories] = useState(() => {
    try {
      const localCats = localStorage.getItem('bm_categories');
      if (localCats) {
        const parsed = JSON.parse(localCats);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CATEGORIES;
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const localBms = localStorage.getItem('bm_bookmarks');
      if (localBms) {
        const parsed = JSON.parse(localBms);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_BOOKMARKS;
  });

  const [activeCategoryId, setActiveCategoryIdState] = useState(() => {
    try {
      const savedActive = localStorage.getItem('bm_active_category_id');
      const localCats = localStorage.getItem('bm_categories');
      const parsedCats = localCats ? JSON.parse(localCats) : INITIAL_CATEGORIES;
      if (savedActive && Array.isArray(parsedCats) && parsedCats.some(c => c.id === savedActive)) {
        return savedActive;
      }
      if (Array.isArray(parsedCats) && parsedCats.length > 0) {
        return parsedCats[0].id;
      }
    } catch (e) {}
    return 'cat-default';
  });

  const [unlockedCategories, setUnlockedCategories] = useState({}); // { [catId]: true }
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal States
  const [activePreviewUrl, setActivePreviewUrl] = useState(null); // String URL for In-App Browser
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetLockCategory, setTargetLockCategory] = useState(null);

  const handleSetActiveCategoryId = (id) => {
    setActiveCategoryIdState(id);
    setIsRandomSort(false); // Reset random sort when switching category
    try {
      localStorage.setItem('bm_active_category_id', id);
    } catch (e) {}
  };

  // Synchronize LocalStorage Cache whenever categories or bookmarks change
  useEffect(() => {
    try {
      localStorage.setItem('bm_categories', JSON.stringify(categories));
      localStorage.setItem('bm_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('LocalStorage sync error:', e);
    }
  }, [categories, bookmarks]);

  // Ensure activeCategoryId always points to an existing category
  useEffect(() => {
    if (categories && categories.length > 0) {
      const exists = categories.some(c => c.id === activeCategoryId);
      if (!exists) {
        const fallbackId = categories[0].id;
        setActiveCategoryIdState(fallbackId);
        try {
          localStorage.setItem('bm_active_category_id', fallbackId);
        } catch (e) {}
      }
    }
  }, [categories, activeCategoryId]);

  // Firestore Realtime Sync when logged in
  useEffect(() => {
    if (currentUser && isFirebaseAvailable && db) {
      const userUid = currentUser.uid;

      // Sync Categories
      const catRef = doc(db, 'users', userUid, 'data', 'categories');
      const unsubCat = onSnapshot(catRef, (docSnap) => {
        if (docSnap.exists()) {
          const items = docSnap.data().items || [];
          setCategories(items);
          try {
            localStorage.setItem('bm_categories', JSON.stringify(items));
          } catch (e) {}
        } else {
          // Initialize user data in Firestore
          setDoc(catRef, { items: INITIAL_CATEGORIES });
        }
      });

      // Sync Bookmarks
      const bmRef = doc(db, 'users', userUid, 'data', 'bookmarks');
      const unsubBm = onSnapshot(bmRef, (docSnap) => {
        if (docSnap.exists()) {
          const items = docSnap.data().items || [];
          setBookmarks(items);
          try {
            localStorage.setItem('bm_bookmarks', JSON.stringify(items));
          } catch (e) {}
        } else {
          setDoc(bmRef, { items: INITIAL_BOOKMARKS });
        }
      });

      return () => {
        unsubCat();
        unsubBm();
      };
    }
  }, [currentUser]);

  // Helper to persist changes to Cloud or Local
  const saveCategories = (newCats) => {
    setCategories(newCats);
    try {
      localStorage.setItem('bm_categories', JSON.stringify(newCats));
    } catch (e) {}
    if (currentUser && isFirebaseAvailable && db) {
      const catRef = doc(db, 'users', currentUser.uid, 'data', 'categories');
      setDoc(catRef, { items: newCats }, { merge: true });
    }
  };

  const saveBookmarks = (newBms) => {
    setBookmarks(newBms);
    try {
      localStorage.setItem('bm_bookmarks', JSON.stringify(newBms));
    } catch (e) {}
    if (currentUser && isFirebaseAvailable && db) {
      const bmRef = doc(db, 'users', currentUser.uid, 'data', 'bookmarks');
      setDoc(bmRef, { items: newBms }, { merge: true });
    }
  };

  // Category Lock Unlock logic
  const checkCategoryAccess = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat || !cat.isProtected) return true;
    return !!unlockedCategories[categoryId];
  };

  const unlockCategory = (categoryId, enteredPassword) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return false;
    if (cat.passwordHash === enteredPassword || (!cat.passwordHash && enteredPassword === '1234')) {
      setUnlockedCategories(prev => ({ ...prev, [categoryId]: true }));
      return true;
    }
    return false;
  };

  const lockCategory = (categoryId) => {
    setUnlockedCategories(prev => {
      const copy = { ...prev };
      delete copy[categoryId];
      return copy;
    });
  };

  // CRUD for Categories
  const addCategory = (name, isProtected = false, password = '') => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      icon: isProtected ? 'Lock' : 'Folder',
      isProtected,
      passwordHash: password
    };
    saveCategories([...categories, newCat]);
    setActiveCategoryId(newCat.id);
  };

  const updateCategory = (id, updatedFields) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updatedFields } : c);
    saveCategories(updated);
  };

  const renameCategory = (id, newName) => {
    if (!newName || !newName.trim()) return;
    const updated = categories.map(c => c.id === id ? { ...c, name: newName.trim() } : c);
    saveCategories(updated);
  };

  const reorderCategories = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= categories.length || toIndex >= categories.length) return;
    const updated = [...categories];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    saveCategories(updated);
  };

  const deleteCategory = (id) => {
    if (categories.length <= 1) return; // Keep at least one category
    const updatedCats = categories.filter(c => c.id !== id);
    const updatedBms = bookmarks.filter(b => b.categoryId !== id);
    saveCategories(updatedCats);
    saveBookmarks(updatedBms);
    setActiveCategoryId(updatedCats[0].id);
  };

  // CRUD for Bookmarks
  const addBookmark = (bookmarkData) => {
    const newBm = {
      id: `bm-${Date.now()}`,
      categoryId: bookmarkData.categoryId || activeCategoryId,
      title: bookmarkData.title || '無標題網址',
      url: bookmarkData.url,
      domain: bookmarkData.domain || '',
      favicon: bookmarkData.favicon || '',
      description: bookmarkData.description || '',
      tags: bookmarkData.tags || [],
      isFavorite: false,
      createdAt: Date.now()
    };
    saveBookmarks([newBm, ...bookmarks]);
  };

  const updateBookmark = (id, updatedData) => {
    const updated = bookmarks.map(b => b.id === id ? { ...b, ...updatedData } : b);
    saveBookmarks(updated);
  };

  const deleteBookmark = (id) => {
    const updated = bookmarks.filter(b => b.id !== id);
    saveBookmarks(updated);
  };

  const toggleFavorite = (id) => {
    const updated = bookmarks.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b);
    saveBookmarks(updated);
  };

  const [isRandomSort, setIsRandomSort] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const triggerRandomSort = () => {
    setIsRandomSort(true);
    setShuffleSeed(Date.now());
  };

  const resetSortMode = () => {
    setIsRandomSort(false);
  };

  // Helper to check duplicates in specific tab category
  const checkTabDuplicates = (inputUrl, targetCategoryId = activeCategoryId) => {
    if (!inputUrl || !inputUrl.trim()) return [];
    const normalize = (u) => u ? u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '') : '';
    const normQuery = normalize(inputUrl);
    const rawQueryLower = inputUrl.trim().toLowerCase();

    const targetList = bookmarks.filter(b => b.categoryId === targetCategoryId);
    return targetList.filter(bm => {
      const bmNorm = normalize(bm.url);
      const isUrlMatch = bmNorm && normQuery && (bmNorm === normQuery || bmNorm.includes(normQuery) || normQuery.includes(bmNorm));
      const isTitleMatch = rawQueryLower.length >= 2 && bm.title && bm.title.toLowerCase().includes(rawQueryLower);
      return isUrlMatch || isTitleMatch;
    });
  };

  // Filtered Bookmarks by active category & search query
  let filteredBookmarks = bookmarks.filter(bm => {
    const matchesCategory = bm.categoryId === activeCategoryId;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      bm.title.toLowerCase().includes(q) ||
      bm.url.toLowerCase().includes(q) ||
      bm.description.toLowerCase().includes(q) ||
      (bm.tags && bm.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  // Apply Random Shuffle if active
  if (isRandomSort && filteredBookmarks.length > 0) {
    const arr = [...filteredBookmarks];
    // Deterministic or time-seeded Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    filteredBookmarks = arr;
  }

  return (
    <BookmarkContext.Provider value={{
      categories,
      bookmarks,
      activeCategoryId,
      setActiveCategoryId: handleSetActiveCategoryId,
      checkCategoryAccess,
      unlockCategory,
      lockCategory,
      addCategory,
      updateCategory,
      renameCategory,
      reorderCategories,
      deleteCategory,
      addBookmark,
      updateBookmark,
      deleteBookmark,
      toggleFavorite,
      filteredBookmarks,
      searchQuery,
      setSearchQuery,
      viewMode,
      setViewMode,
      isRandomSort,
      triggerRandomSort,
      resetSortMode,
      checkTabDuplicates,
      activePreviewUrl,
      setActivePreviewUrl,
      isBookmarkModalOpen,
      setIsBookmarkModalOpen,
      editingBookmark,
      setEditingBookmark,
      isPasswordModalOpen,
      setIsPasswordModalOpen,
      targetLockCategory,
      setTargetLockCategory
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
