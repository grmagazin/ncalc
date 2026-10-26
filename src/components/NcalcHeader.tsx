import React, { useState, useEffect, useRef } from 'react';
import {
  Undo2,
  Redo2,
  Printer,
  Save,
  Search,
  LayoutGrid,
  Sparkles,
  Maximize2,
  Minimize2,
  MessageSquare,
  Sun,
  ChevronDown,
  Check,
  FileSpreadsheet,
  Download,
  Database,
  HelpCircle,
  FileCode,
} from 'lucide-react';

interface NcalcHeaderProps {
  onToggleAi: () => void;
  isAiOpen: boolean;
}

export default function NcalcHeader({ onToggleAi, isAiOpen }: NcalcHeaderProps) {
  const [docName, setDocName] = useState('Untitled 2 .jsom');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isSavedFlash, setIsSavedFlash] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const fileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Monitor theme changes for dark mode header styling
  useEffect(() => {
    const checkDark = () => {
      const themeAttr = document.documentElement.getAttribute('data-theme') || '';
      const s = (window as any).__NCALC_STORE__?.getState?.();
      const currentTheme = (s?.theme || themeAttr || '').toLowerCase();
      const isDark = currentTheme.startsWith('dark') || document.documentElement.classList.contains('dark');
      setIsDarkTheme(isDark);
      if (isDark) {
        if (!document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.add('dark');
        }
      } else {
        if (document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    const storeObj = (window as any).__NCALC_STORE__;
    let unsubscribe: any = null;
    if (storeObj && typeof storeObj.subscribe === 'function') {
      unsubscribe = storeObj.subscribe(checkDark);
    }

    return () => {
      observer.disconnect();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Alt+Q keyboard shortcut for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to safely get the Ncalc Zustand store
  const getStore = () => {
    return (window as any).__NCALC_STORE__?.getState();
  };

  const handleUndo = () => {
    const s = getStore();
    if (s?.undo) {
      s.undo();
      s.toast?.('Undo');
    }
  };

  const handleRedo = () => {
    const s = getStore();
    if (s?.redo) {
      s.redo();
      s.toast?.('Redo');
    }
  };

  const handlePrint = () => {
    const s = getStore();
    if (s?.setModal) {
      s.setModal('showPrintPreview', true);
    } else {
      window.print();
    }
  };

  const handleSave = () => {
    const s = getStore();
    if (s?.snapshot) {
      s.snapshot();
      setIsSavedFlash(true);
      setTimeout(() => setIsSavedFlash(false), 1200);
      s.toast?.(`Saved "${docName}" to Local DB`);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleCycleTheme = () => {
    const s = getStore();
    if (s?.cycleTheme) {
      s.cycleTheme(false);
    } else if (s?.setModal) {
      s.setModal('showThemeModal', true);
    }
  };

  const handleOpenThemesModal = () => {
    const s = getStore();
    if (s?.setModal) {
      s.setModal('showThemeModal', true);
    } else if (s?.cycleTheme) {
      s.cycleTheme(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    const s = getStore();
    if (!s) return;

    // Check if query is a cell coordinate e.g. B5 or A1:C10
    const cellMatch = query.match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/i);
    if (cellMatch) {
      s.toast?.(`Navigating to ${query.toUpperCase()}`);
      searchInputRef.current?.blur();
      return;
    }

    // Check if formula search e.g. SUM
    if (s.setModal && query.toLowerCase().includes('chart')) {
      s.setModal('showChartModal', true);
      return;
    }

    // Default: Open AI assistant and ask query
    onToggleAi();
    s.toast?.(`Asking AI Assistant: "${query}"`);
    window.dispatchEvent(new CustomEvent('ncalc-ai-ask', { detail: { prompt: query } }));
    setSearchQuery('');
    searchInputRef.current?.blur();
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-[44px] z-40 flex items-center justify-between px-3 text-white select-none shadow-md transition-all duration-200"
      style={{
        backgroundColor: isDarkTheme ? '#080c14' : '#155dfc',
        backgroundImage: isDarkTheme
          ? 'linear-gradient(180deg, #0f172a 0%, #080c14 100%)'
          : 'linear-gradient(180deg, #1d64fc 0%, #1153e2 100%)',
        borderBottom: isDarkTheme ? '1px solid #1e293b' : '1px solid rgba(0, 0, 0, 0.15)',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* LEFT SECTION: Pill Brand, Undo, Redo, Print, Separator, File Title, Save, AutoSave */}
      <div className="flex items-center gap-1.5 min-w-0">
        {/* Ncalc v5.5 Pill Badge with external link to GRmagazin */}
        <a
          href="https://grmagazin.blogspot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer hover:brightness-110 active:scale-95 transition-all shrink-0 no-underline"
          style={{
            backgroundColor: isDarkTheme ? '#1e293b' : '#0047cc',
            border: isDarkTheme ? '1.5px solid rgba(255, 255, 255, 0.2)' : '1.5px solid rgba(255, 255, 255, 0.65)',
            boxShadow: isDarkTheme ? '0 1px 4px rgba(0, 0, 0, 0.6)' : '0 1px 3px rgba(0, 0, 0, 0.25)',
          }}
          title="Ncalc v5.5 — Visit GRmagazin (opens in new tab)"
        >
          <span>Ncalc v5.5</span>
        </a>

        {/* Undo Button */}
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
          onClick={handleUndo}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Redo Button */}
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
          onClick={handleRedo}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Print Button */}
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
          title="Print Sheet (Ctrl+P)"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" />
        </button>

        {/* Thin Divider */}
        <div className={`h-5 w-px mx-1 ${isDarkTheme ? 'bg-slate-700' : 'bg-white/25'}`} />

        {/* Workbook Title Dropdown (e.g. Untitled 2 .jsom ⌵) */}
        <div className="relative" ref={fileMenuRef}>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/15 active:bg-white/25 text-white font-semibold text-xs transition-colors cursor-pointer max-w-[170px]"
            onClick={() => setShowFileMenu(!showFileMenu)}
            title="Rename or Manage Workbook"
          >
            <span className="truncate">{docName}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </button>

          {/* Dropdown Menu */}
          {showFileMenu && (
            <div
              className={`absolute left-0 top-full mt-1.5 w-60 rounded-lg shadow-xl border text-xs py-1.5 z-50 animate-in fade-in-50 duration-100 ${
                isDarkTheme ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <div className={`px-3 py-1.5 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-100'}`}>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>
                  Document Name
                </label>
                <input
                  type="text"
                  className={`w-full px-2 py-1 border rounded text-xs font-semibold focus:outline-none focus:border-blue-500 ${
                    isDarkTheme ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="button"
                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  isDarkTheme ? 'hover:bg-slate-700/70 text-slate-200' : 'hover:bg-blue-50 text-gray-800'
                }`}
                onClick={() => {
                  const s = getStore();
                  s?.newDoc?.();
                  s?.toast?.('Created new blank sheet');
                  setShowFileMenu(false);
                }}
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                <span>New Blank Workbook</span>
              </button>

              <button
                type="button"
                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  isDarkTheme ? 'hover:bg-slate-700/70 text-slate-200' : 'hover:bg-blue-50 text-gray-800'
                }`}
                onClick={() => {
                  handleSave();
                  setShowFileMenu(false);
                }}
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save to Local DB</span>
              </button>

              <div className={`h-px my-1 ${isDarkTheme ? 'bg-slate-700' : 'bg-gray-100'}`} />

              <button
                type="button"
                className={`w-full px-3 py-1.5 text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  isDarkTheme ? 'hover:bg-slate-700/70 text-slate-200' : 'hover:bg-blue-50 text-gray-800'
                }`}
                onClick={() => {
                  const s = getStore();
                  const json = JSON.stringify({ sheets: s?.sheets, charts: s?.charts }, null, 2);
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = docName.endsWith('.json') || docName.endsWith('.jsom') ? docName : `${docName}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  s?.toast?.('Exported JSON');
                  setShowFileMenu(false);
                }}
              >
                <Download className="w-4 h-4 text-purple-400" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Floppy Disk Save Button with Orange Indicator Dot */}
        <div className="relative">
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Save to Local Database"
            onClick={handleSave}
          >
            <Save className={`w-4 h-4 transition-transform ${isSavedFlash ? 'scale-125 text-emerald-300' : ''}`} />
          </button>
          {/* Orange/Gold status dot matching Foto 1 */}
          <span
            className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border pointer-events-none ${
              isDarkTheme ? 'border-slate-800' : 'border-blue-700'
            }`}
            style={{ backgroundColor: '#f59e0b' }}
            title="Database Sync Active"
          />
        </div>

        {/* AutoSave Capsule Toggle: [AutoSave (●) Local DB] */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white/95 shrink-0 cursor-pointer select-none transition-all"
          style={{
            backgroundColor: isDarkTheme ? '#111827' : '#0c2e78',
            border: isDarkTheme ? '1px solid #374151' : '1px solid rgba(255, 255, 255, 0.25)',
          }}
          onClick={() => {
            setAutoSaveEnabled(!autoSaveEnabled);
            const s = getStore();
            s?.toast?.(`AutoSave ${!autoSaveEnabled ? 'Enabled' : 'Disabled'}`);
          }}
          title="Automatic Persistence to Local Database (IndexedDB / LocalStorage)"
        >
          <span className="text-[11px] font-bold tracking-tight">AutoSave</span>
          {/* Toggle Switch */}
          <div
            className={`w-7 h-3.5 rounded-full p-0.5 flex items-center transition-colors ${
              autoSaveEnabled
                ? (isDarkTheme ? 'bg-sky-500 justify-end' : 'bg-blue-400 justify-end')
                : 'bg-gray-500 justify-start'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
          </div>
          <span className="text-[10.5px]" style={{ color: isDarkTheme ? '#94a3b8' : '#bfdbfe' }}>
            Local DB
          </span>
        </div>
      </div>

      {/* MIDDLE SECTION: Search Bar with Alt+Q placeholder */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md mx-3 hidden md:flex items-center relative"
      >
        <div
          className="w-full flex items-center rounded-md px-2.5 py-1 text-xs transition-all"
          style={{
            backgroundColor: isDarkTheme ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.16)',
            border: isDarkTheme ? '1px solid #334155' : '1px solid rgba(255, 255, 255, 0.28)',
            color: '#ffffff',
          }}
        >
          <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${isDarkTheme ? 'text-sky-400' : 'text-blue-200'}`} />
          <input
            ref={searchInputRef}
            type="text"
            className={`w-full bg-transparent border-none outline-none text-white text-xs ${
              isDarkTheme ? 'placeholder:text-slate-400' : 'placeholder:text-blue-100/70'
            }`}
            placeholder="Tell me what you want to do (Alt+Q)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span
            className={`text-[10px] font-mono font-medium ml-1.5 shrink-0 px-1 py-0.2 rounded ${
              isDarkTheme
                ? 'text-slate-300 bg-slate-800 border border-slate-700'
                : 'text-blue-200/90 bg-black/15'
            }`}
          >
            Alt+Q
          </span>
        </div>
      </form>

      {/* RIGHT SECTION: Themes, ✨ AI, Fullscreen, Comments with '1' badge, Theme Sun icon */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Themes Button */}
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white transition-all cursor-pointer active:scale-95 ${
            isDarkTheme ? 'hover:bg-slate-700/70' : 'hover:bg-white/20'
          }`}
          style={{
            backgroundColor: isDarkTheme ? 'rgba(30, 41, 59, 0.75)' : 'rgba(255, 255, 255, 0.18)',
            border: isDarkTheme ? '1px solid #475569' : '1px solid rgba(255, 255, 255, 0.3)',
          }}
          onClick={handleOpenThemesModal}
          title="Themes Palette & Styling (12 Themes)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Themes</span>
        </button>

        {/* ✨ AI Button (Vibrant Purple Pill matching Foto 1) */}
        <button
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-md text-xs font-bold text-white shadow-md transition-all cursor-pointer active:scale-95 ${
            isAiOpen
              ? 'ring-2 ring-white brightness-110 shadow-purple-900/40'
              : 'hover:brightness-110'
          }`}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
          onClick={onToggleAi}
          title="Open AI Ncalc Assistant & Data Pipeline"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AI</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Comments with Badge "1" (Matching Foto 1) */}
        <div className="relative">
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Cell Comments & Diagnostics (1 notification)"
            onClick={() => setShowCommentsModal(!showCommentsModal)}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          {/* Badge '1' */}
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs pointer-events-none"
            style={{ backgroundColor: '#f59e0b' }}
          >
            1
          </span>

          {/* Quick Notification Popover */}
          {showCommentsModal && (
            <div
              className={`absolute right-0 top-full mt-1.5 w-64 rounded-lg shadow-xl border p-3 z-50 text-xs animate-in fade-in duration-100 ${
                isDarkTheme ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              <div className={`font-bold text-xs flex items-center justify-between border-b pb-1.5 mb-2 ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                <span>Spreadsheet Status</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDarkTheme ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  Healthy
                </span>
              </div>
              <p className={`text-[11.5px] leading-snug ${isDarkTheme ? 'text-slate-300' : 'text-gray-600'}`}>
                Ncalc v5.5 engine running with 0 circular dependencies. AI Copilot is connected and ready.
              </p>
              <div className={`mt-2.5 pt-2 border-t flex justify-end ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded text-[11px] hover:bg-blue-700 cursor-pointer"
                  onClick={() => setShowCommentsModal(false)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Sun Icon (Dark/Light switch) */}
        <button
          type="button"
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 active:bg-white/25 text-amber-200 hover:text-amber-100 transition-colors cursor-pointer"
          title="Toggle / Cycle Theme"
          onClick={handleCycleTheme}
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
