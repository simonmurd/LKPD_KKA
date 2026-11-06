import React, { useState, useEffect, useRef } from 'react';
import { MODULES_DATA, ModuleItem } from '../data/modulesData';
import { MODULES_INITIAL_CODES, MODULES_TASKS } from '../data/modulesCodeData';
import { useAuth } from '../context/AuthContext';
import { Assignment, StudentSubmission } from '../data/assignmentsData';
import { processAiGradingAndSaveToLeger, AiEvaluationResult } from '../services/aiGradingService';
import { 
  subscribeToAssignments, 
  subscribeToStudentSubmissions, 
  submitAssignmentToFirestore 
} from '../firebase';
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
  BookOpen,
  Send,
  FileCheck,
  AlertCircle,
  Clock,
  Calendar,
  Zap,
  X
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

  const { role, currentStudent } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [taskNotification, setTaskNotification] = useState<string | null>(null);
  const [aiGradingResult, setAiGradingResult] = useState<{ evaluation: AiEvaluationResult; taskCode: string; taskTitle: string } | null>(null);

  // Subscribe to assignments & student's submissions from Cloud Firestore
  useEffect(() => {
    const unsubA = subscribeToAssignments((list) => {
      setAssignments(list);
    });
    let unsubS = () => {};
    if (role === 'SISWA' && currentStudent) {
      unsubS = subscribeToStudentSubmissions(currentStudent.id, (subs) => {
        setSubmissions(subs);
      });
    }
    return () => {
      unsubA();
      unsubS();
    };
  }, [role, currentStudent]);

  // Cek apakah modul ini sedang ditugaskan oleh Guru Simon (khusus tipe coding atau umum)
  const activeAssignment = assignments.find((a) => {
    if (a.taskType === 'cbt') return false;
    if (a.moduleScope !== 'all' && a.moduleId !== selectedId) return false;
    if (currentStudent && a.targetClass && a.targetClass !== 'SEMUA KELAS') {
      return a.targetClass === currentStudent.className;
    }
    return true;
  });

  const existingSubmission = activeAssignment && currentStudent
    ? submissions.find((s) => s.assignmentId === activeAssignment.id)
    : undefined;

  const handleSubmitCodeAssignment = async () => {
    if (!activeAssignment || !currentStudent) return;
    setIsSubmitting(true);
    const now = new Date();

    try {
      const { evaluation } = await processAiGradingAndSaveToLeger(
        activeAssignment,
        currentStudent,
        code,
        submissionNotes,
        now.toISOString()
      );
      setIsSubmitModalOpen(false);
      setAiGradingResult({
        evaluation,
        taskCode: activeAssignment.code,
        taskTitle: activeAssignment.title
      });
      setTaskNotification(`🤖 Tugas ${activeAssignment.code} dinilai otomatis oleh AI (Skor: ${evaluation.score}, Predikat: ${evaluation.grade}) dan otomatis masuk ke Kolom Tugas ${evaluation.taskIndex + 1} Buku Leger!`);
      setTimeout(() => setTaskNotification(null), 8000);
    } catch (err) {
      console.error('Failed to submit assignment from runner:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const currentModule = MODULES_DATA.find((m) => m.id === selectedId) || MODULES_DATA[0];
  const initialCode = MODULES_INITIAL_CODES[selectedId] || '';
  const moduleTasks = MODULES_TASKS[selectedId] || [];

  const STORAGE_KEY = `kka_modul_code_${selectedId}`;

  // Sync when initialModuleId changes from props
  useEffect(() => {
    if (initialModuleId && initialModuleId !== selectedId) {
      setSelectedId(initialModuleId);
    }
  }, [initialModuleId]);

  // Clean up blob URL on unmount to avoid memory leak
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

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

      {/* Toast Notification from Submitting Task */}
      {taskNotification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{taskNotification}</span>
          </div>
          <button onClick={() => setTaskNotification(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* BANNER TUGAS RESMI DARI GURU (PAK SIMON MURD, S.KOM) */}
      {activeAssignment && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/70 border border-indigo-200/90 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md border border-indigo-200">
                    {activeAssignment.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                    Tugas Guru &bull; Pak Simon Murdani Yusuf, S.ST
                  </span>
                  {activeAssignment.targetClass && activeAssignment.targetClass !== 'SEMUA KELAS' && (
                    <span className="text-[10px] font-mono bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full">
                      Khusus {activeAssignment.targetClass}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  {activeAssignment.title}
                </h3>
              </div>
            </div>

            {/* Status & Deadline Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Batas: {new Date(activeAssignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
              </div>

              {existingSubmission?.status === 'graded' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nilai: {existingSubmission.score} ({existingSubmission.grade})</span>
                </span>
              ) : existingSubmission?.status === 'needs_revision' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Perlu Revisi</span>
                </span>
              ) : existingSubmission ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sudah Terkirim (✓)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold font-mono">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Belum Dikirim</span>
                </span>
              )}

              {role === 'SISWA' && (
                <button
                  onClick={() => {
                    setSubmissionNotes(existingSubmission?.notes || `Sudah menyelesaikan dan mencoba simulasi ${activeAssignment.code}, Pak.`);
                    setIsSubmitModalOpen(true);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    existingSubmission
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{existingSubmission ? 'Kirim Ulang Kode' : 'Kumpulkan Kode Ini'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-indigo-100 leading-relaxed">
            <span className="font-bold text-slate-800">Petunjuk Tugas: </span>
            {activeAssignment.description}
            {activeAssignment.targetCriteria && (
              <div className="mt-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Kriteria Penilaian: </span>
                {activeAssignment.targetCriteria}
              </div>
            )}
            {existingSubmission?.teacherFeedback && (
              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                <span className="font-bold">Umpan Balik Guru Simon: </span>
                {existingSubmission.teacherFeedback}
              </div>
            )}
          </div>
        </div>
      )}

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

                {/* Tombol Kumpulkan Kode ke Guru Simon */}
                {role === 'SISWA' && activeAssignment && (
                  <button
                    onClick={() => {
                      setSubmissionNotes(existingSubmission?.notes || `Sudah menyelesaikan dan mencoba simulasi ${activeAssignment.code}, Pak.`);
                      setIsSubmitModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/30 cursor-pointer"
                    title="Kumpulkan kodingan kanvas saat ini ke Guru Simon"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{existingSubmission ? 'Kirim Ulang' : 'Kumpul Tugas'}</span>
                  </button>
                )}
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

      {/* Modal Kumpulkan Tugas Langsung dari Lab Koding */}
      {isSubmitModalOpen && activeAssignment && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Send className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Kumpulkan Kode Praktikum</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeAssignment.code} &bull; {activeAssignment.moduleCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{activeAssignment.title}</div>
              <div className="text-slate-500 leading-relaxed">{activeAssignment.description}</div>
            </div>

            {/* Code Snapshot Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cuplikan Kode Kanvas yang Akan Terlampir:
              </label>
              <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl max-h-36 overflow-y-auto border border-slate-800 leading-relaxed">
                <pre>{code.slice(0, 500)}...</pre>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                Total {code.length} karakter kode di editor akan otomatis terlampir ke akun Guru Simon.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Bukti Pengerjaan Siswa (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Misal: Sudah memodifikasi loop objek dan mengubah warna kanvas..."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Penilaian Kecepatan Otomatis:</span> Dikirim sebelum batas waktu ({new Date(activeAssignment.dueDate).toLocaleDateString('id-ID')}) otomatis mendapatkan rekomendasi bonus kecepatan!
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitCodeAssignment}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Sekarang ke Pak Simon'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hasil Penilaian Otomatis AI */}
      {aiGradingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 font-sans text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-mono font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ASESOR AI OTOMATIS KKA SMK</span>
              </div>
              <button
                onClick={() => setAiGradingResult(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black font-mono text-indigo-700">
                  {aiGradingResult.evaluation.score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">/ 100</span>
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">
                Predikat: <span className="text-indigo-600 font-extrabold">{aiGradingResult.evaluation.grade}</span> &bull; {aiGradingResult.evaluation.speedBonus}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {aiGradingResult.taskCode}: {aiGradingResult.taskTitle}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 font-mono text-[11px]">
                <span>🤖 Catatan Evaluasi AI:</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                {aiGradingResult.evaluation.feedback}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <strong>Otomatis Tercatat:</strong> Nilai {aiGradingResult.evaluation.score} telah masuk ke <strong>Kolom Tugas {aiGradingResult.evaluation.taskIndex + 1}</strong> pada Buku Leger Guru &amp; Tabel Ceklis Anda!
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setAiGradingResult(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Tutup &amp; Lanjutkan Belajar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
