import React, { useState, useEffect, useRef } from 'react';
import { MODULES_DATA, ModuleItem } from '../data/modulesData';
import { MODULES_INITIAL_CODES, MODULES_TASKS } from '../data/modulesCodeData';
import { 
  Play, 
  RotateCcw, 
  Maximize2, 
  ExternalLink, 
  Code2, 
  Gamepad2, 
  Columns, 
  CheckCircle2, 
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Save,
  Check,
  Search,
  BookOpen
} from 'lucide-react';

export type RunnerViewMode = 'split' | 'code_only' | 'game_only';

interface InteractiveRunnerProps {
  initialModuleId: number;
  onSelectModule: (mod: ModuleItem) => void;
}

export const InteractiveRunner: React.FC<InteractiveRunnerProps> = ({
  initialModuleId,
  onSelectModule,
}) => {
  const [selectedId, setSelectedId] = useState<number>(initialModuleId || 1);
  const [viewMode, setViewMode] = useState<RunnerViewMode>('split');
  const [code, setCode] = useState<string>('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showTaskList, setShowTaskList] = useState<boolean>(false);
  const [taskSearch, setTaskSearch] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const currentModule = MODULES_DATA.find((m) => m.id === selectedId) || MODULES_DATA[0];
  const initialCode = MODULES_INITIAL_CODES[selectedId] || '';
  const moduleTasks = MODULES_TASKS[selectedId] || [];

  const STORAGE_KEY = `kka_modul_code_${selectedId}`;

  // Load code from localStorage or fallback to default
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const codeToLoad = saved && saved.trim().length > 50 ? saved : initialCode;
    setCode(codeToLoad);
    updatePreview(codeToLoad);
  }, [selectedId]);

  // Update blob preview
  const updatePreview = (currentCode: string) => {
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
    }
    const blob = new Blob([currentCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    setPreviewBlobUrl(url);
  };

  const handleRunCode = () => {
    updatePreview(code);
    localStorage.setItem(STORAGE_KEY, code);
    setSaveStatus('Tersimpan & Dijalankan!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleResetCode = () => {
    if (window.confirm('Kembalikan kode ke templat awal modul ini? Semua perubahan akan direset.')) {
      setCode(initialCode);
      localStorage.removeItem(STORAGE_KEY);
      updatePreview(initialCode);
      setSaveStatus('Kode Direset ke Awal');
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleManualSave = () => {
    localStorage.setItem(STORAGE_KEY, code);
    setSaveStatus('Tersimpan di Browser!');
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Keyboard shortcut (Tab and Ctrl+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  const handleJumpToTask = (taskText: string) => {
    if (!textareaRef.current) return;
    const taskKeyword = taskText.match(/🎯\s*TUGAS\s*\d+/i)?.[0];
    if (!taskKeyword) return;

    const index = code.indexOf(taskKeyword);
    if (index !== -1) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index + taskKeyword.length);

      // Scroll textarea to view the task
      const linesBefore = code.substring(0, index).split('\n').length;
      const lineHeight = 20; // approximate
      textareaRef.current.scrollTop = Math.max(0, (linesBefore - 4) * lineHeight);
    }
  };

  const handleFullscreen = () => {
    if (previewContainerRef.current) {
      if (!document.fullscreenElement) {
        previewContainerRef.current.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  // Next / Prev Module
  const handleNextModule = () => {
    const next = selectedId >= 18 ? 1 : selectedId + 1;
    setSelectedId(next);
  };

  const handlePrevModule = () => {
    const prev = selectedId <= 1 ? 18 : selectedId - 1;
    setSelectedId(prev);
  };

  const filteredTasks = moduleTasks.filter((t) =>
    !taskSearch || t.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Minimalist Header & Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Module Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevModule}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
              title="Modul Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="px-3 py-1 rounded-lg bg-white text-slate-800 text-xs sm:text-sm font-bold font-mono focus:outline-none border border-slate-200 cursor-pointer shadow-sm"
            >
              {MODULES_DATA.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code}: {m.shortTitle}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextModule}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
              title="Modul Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{currentModule.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                {currentModule.domainCategory}
              </span>
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-lg hidden sm:block">
              {currentModule.focus}
            </p>
          </div>
        </div>

        {/* View Mode Switcher Menu: 2 Bagian vs Koding Saja vs Game Saja */}
        <div className="flex items-center gap-2">
          
          {/* Mode Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'split'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan 2 Bagian: Koding dengan 20 Tugas & Hasil Game"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>2 Bagian (Split)</span>
            </button>

            <button
              onClick={() => setViewMode('code_only')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'code_only'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan Koding Saja (Layar Penuh Editor & 20 Tugas)"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Koding Saja</span>
            </button>

            <button
              onClick={() => setViewMode('game_only')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                viewMode === 'game_only'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan Game Saya Saja (Layar Penuh Game)"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game Saya Saja</span>
            </button>
          </div>

          <button
            onClick={() => onSelectModule(currentModule)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
            title="Lihat Detail Intisari Modul"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Content Workspace: STRICTLY 2 PARTS (KODING DENGAN 20 TUGAS & HASIL) */}
      <div className={`grid gap-5 ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        
        {/* ========================================================
            BAGIAN 1: KODING DENGAN 20 TUGASNYA
            (Tampil jika mode 'split' atau 'code_only')
           ======================================================== */}
        {(viewMode === 'split' || viewMode === 'code_only') && (
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[740px]">
            
            {/* Header Bagian Koding */}
            <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs">
                  &lt;/&gt;
                </div>
                <div>
                  <span className="font-bold text-slate-800">Bagian 1: Koding & 20 Tugas</span>
                  <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                    (Ctrl + Enter untuk Menjalankan)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowTaskList(!showTaskList)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition ${
                    showTaskList
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Buka Daftar 20 Tugas"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Daftar Tugas ({moduleTasks.length})</span>
                </button>

                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition"
                  title="Kembalikan kode ke templat awal"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  Reset
                </button>

                <button
                  onClick={handleRunCode}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
                  title="Jalankan kode ke Bagian Hasil"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Jalankan Kode</span>
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {saveStatus && (
              <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border-b border-emerald-200 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Drawer 20 Tugas Terstruktur (Interactive Task Jump) */}
            {showTaskList && (
              <div className="p-3 bg-slate-50/90 border-b border-slate-200 space-y-2 max-h-48 overflow-y-auto text-xs animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Lompat Cepat ke Tugas (Klik untuk Menuju Kode):
                  </span>
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Cari tugas..."
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-[11px] text-slate-700 focus:outline-none w-32"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredTasks.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJumpToTask(t)}
                      className="p-1.5 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left text-[11px] text-slate-700 truncate transition flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span>
                      <span className="truncate">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Code Editor Textarea */}
            <div className="relative flex-1 bg-[#1e293b] overflow-hidden flex">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-100 bg-[#0f172a] focus:outline-none resize-none leading-relaxed selection:bg-indigo-500 selection:text-white"
                placeholder="Area penulisan kode JavaScript & HTML5 Canvas..."
              />
            </div>

            {/* Footer Bar Bagian Koding */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{code.length} Karakter • {code.split('\n').length} Baris</span>
              <span>Tekan Tab untuk indentasi 2 spasi</span>
            </div>

          </div>
        )}

        {/* ========================================================
            BAGIAN 2: BAGIAN HASIL (LIVE CANVAS & GAME PREVIEW)
            (Tampil jika mode 'split' atau 'game_only')
           ======================================================== */}
        {(viewMode === 'split' || viewMode === 'game_only') && (
          <div 
            ref={previewContainerRef}
            className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[740px]"
          >
            
            {/* Header Bagian Hasil */}
            <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-mono font-bold text-xs">
                  🎮
                </div>
                <div>
                  <span className="font-bold text-slate-800">Bagian 2: Hasil Karyamu</span>
                  <span className="text-[10px] text-emerald-600 font-semibold ml-2 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    Live 60 FPS
                  </span>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updatePreview(code)}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition"
                  title="Muat Ulang Tampilan Hasil"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                  Refresh
                </button>

                <button
                  onClick={handleFullscreen}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center gap-1"
                  title="Layar Penuh"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Layar Penuh</span>
                </button>

                {previewBlobUrl && (
                  <a
                    href={previewBlobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1"
                    title="Buka Game di Tab Baru"
                  >
                    <span>Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Iframe Live Output Canvas */}
            <div className="relative flex-1 bg-white">
              {previewBlobUrl ? (
                <iframe
                  key={previewBlobUrl}
                  src={previewBlobUrl}
                  title={`Hasil ${currentModule.title}`}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  allow="fullscreen"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Memuat simulasi kanvas...
                </div>
              )}
            </div>

            {/* Footer Bar Bagian Hasil */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Output: {currentModule.shortTitle}</span>
              <span>Gunakan kontrol keyboard atau sentuhan layar</span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
