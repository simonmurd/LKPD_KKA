/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pusat Asesmen & Ujian CBT KKA SMK
 * Dilengkapi:
 * 1. Mode Ujian CBT Resmi 40 Soal PG (Opsi A-E) dengan Timer, Ragu-ragu, Grid 1-40, Konfirmasi, & Hasil Lengkap.
 * 2. Mode Lembar Ujian Essay 10 Soal per Modul (Modul 1-24) dengan Kasus Industri, Starter Code, & Rubrik Penskoran.
 * 3. Format Ekspor Tab Google Sheets (Modul_Materi & Bank_Soal).
 * 4. Analisis Asesmen & Kisi-Kisi Kurikulum Merdeka Guru KKA.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MODULES_DATA } from '../data/modulesData';
import { 
  getCbt40Questions, 
  getEssay10Questions, 
  getComprehensive40Questions, 
  CbtQuestion, 
  EssayQuestion 
} from '../data/cbtData';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Printer, 
  Send, 
  FileSpreadsheet, 
  Award, 
  SlidersHorizontal,
  BookmarkCheck,
  Eye,
  EyeOff,
  Check,
  Code2,
  BookOpen,
  BarChart3,
  Copy,
  Download
} from 'lucide-react';

type SubViewMode = 'cbt_exam' | 'essay_exam' | 'sheets_bank' | 'teacher_analysis';

export const CbtExamCenter: React.FC = () => {
  const { role, currentStudent, recordQuizScore } = useAuth();

  // Mode Navigasi Utama Asesmen
  const [subMode, setSubMode] = useState<SubViewMode>('cbt_exam');

  // ================= STATE CBT EXAM (40 SOAL PG) =================
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [isComprehensiveExam, setIsComprehensiveExam] = useState<boolean>(false);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  
  // Font Size: 'normal' | 'large' | 'xlarge'
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Waktu Ujian (detik) - default 60 menit = 3600 detik
  const [timeLeft, setTimeLeft] = useState<number>(3600);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);

  // Status Jawaban CBT: index 0..39
  // userAnswers: { [qIndex]: 'A' | 'B' | 'C' | 'D' | 'E' }
  const [userAnswers, setUserAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D' | 'E'>>({});
  // flagged: { [qIndex]: boolean } (Ragu-ragu / Kuning)
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // ================= STATE ESSAY EXAM (10 SOAL PER MODUL) =================
  const [essayModuleId, setEssayModuleId] = useState<number>(1);
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});
  const [essayScores, setEssayScores] = useState<Record<number, number>>({});

  // ================= STATE EKSPOR GOOGLE SHEETS =================
  const [exportCopied, setExportCopied] = useState<string | null>(null);
  const [isSendingToSheets, setIsSendingToSheets] = useState<boolean>(false);
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<string | null>(null);

  // Ambil paket 40 soal CBT berdasarkan pilihan
  const cbtQuestions: CbtQuestion[] = useMemo(() => {
    if (isComprehensiveExam) {
      return getComprehensive40Questions();
    }
    return getCbt40Questions(selectedModuleId);
  }, [selectedModuleId, isComprehensiveExam]);

  // Ambil paket 10 soal Essay berdasarkan pilihan
  const essayQuestions: EssayQuestion[] = useMemo(() => {
    return getEssay10Questions(essayModuleId);
  }, [essayModuleId]);

  // Ref to always access latest user answers in async timeout
  const userAnswersRef = useRef(userAnswers);
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Timer Effect untuk CBT
  useEffect(() => {
    if (!examStarted || examFinished || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => handleFinishExam(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, isTimerPaused]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setUserAnswers({});
    setFlagged({});
    setCurrentQIndex(0);
    setTimeLeft(3600); // 60 menit
    setIsTimerPaused(false);
    setExamFinished(false);
    setExamStarted(true);
    setShowConfirmModal(false);
  };

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D' | 'E') => {
    if (examFinished) return;
    setUserAnswers((prev) => ({ ...prev, [currentQIndex]: key }));
  };

  const handleToggleFlag = () => {
    if (examFinished) return;
    setFlagged((prev) => ({ ...prev, [currentQIndex]: !prev[currentQIndex] }));
  };

  const handleFinishExam = () => {
    setExamFinished(true);
    setShowConfirmModal(false);

    // Hitung skor total menggunakan latest answers
    const currentAnswers = userAnswersRef.current;
    let correct = 0;
    cbtQuestions.forEach((q, idx) => {
      if (currentAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / cbtQuestions.length) * 100);
    recordQuizScore(finalScore, 100);
  };

  // Kalkulasi Hasil CBT
  const cbtResult = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    cbtQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (!ans) {
        unattempted++;
      } else if (ans === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = cbtQuestions.length;
    const finalScore = Math.round((correct / total) * 100);
    const isPassed = finalScore >= 75; // KKM SMK KKA = 75
    let grade = 'D';
    if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 75) grade = 'C';

    return { correct, wrong, unattempted, finalScore, isPassed, grade, total };
  }, [cbtQuestions, userAnswers]);

  // Pengiriman Hasil CBT ke Google Sheets secara otomatis
  const handleSendResultToSheets = async () => {
    setIsSendingToSheets(true);
    setSheetsSyncMessage(null);

    const payload = {
      action: "submit_cbt_score",
      timestamp: new Date().toISOString(),
      studentName: currentStudent ? currentStudent.name : "Simon Murd (Guru)",
      school: currentStudent ? currentStudent.school : "SMK NEGERI 1 SINGKAWANG",
      grade: currentStudent ? currentStudent.className : "XI TJK",
      examType: isComprehensiveExam ? "CBT Ujian Komprehensif (40 PG)" : `CBT Modul-${selectedModuleId} (40 PG)`,
      score: cbtResult.finalScore,
      correctCount: cbtResult.correct,
      wrongCount: cbtResult.wrong,
      unattemptedCount: cbtResult.unattempted,
      statusKKM: cbtResult.isPassed ? "TUNTAS" : "REMEDIAL",
      gradeLetter: cbtResult.grade
    };

    try {
      await fetch("https://script.google.com/macros/s/AKfycbzNQYMH-RpKQUfxw0TOpTp_wJBp7dUMrDV2gVB9AiTkJoGuLOnETSaHyA2fIUdud7LQ/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSheetsSyncMessage("Berhasil! Hasil ujian CBT telah disinkronkan ke rekap Google Sheets.");
    } catch {
      setSheetsSyncMessage("Hasil ujian disimpan ke profil aplikasi.");
    } finally {
      setIsSendingToSheets(false);
    }
  };

  // Salin Data Bank Soal ke Clipboard (Format Tabel Google Sheets)
  const handleCopySheetsTable = (tabType: 'Modul_Materi' | 'Bank_Soal') => {
    const clean = (s: string) => (s || '').replace(/[\t\r\n]+/g, ' ').trim();
    let text = "";
    if (tabType === 'Modul_Materi') {
      text = "No\tKode Modul\tNama Modul\tKelompok\tDomain Kompetensi\tRingkasan Materi SMK\tIntisari Koding\tTautan Simulasi\n";
      MODULES_DATA.forEach((m) => {
        text += `${m.id}\t${m.code}\t${clean(m.title)}\t${clean(m.groupLabel)}\t${clean(m.domainCategory)}\t${clean(m.smkSummary)}\t${clean(m.codingLogic.join('; '))}\t${clean(m.assetFile)}\n`;
      });
    } else {
      text = "ID\tModul\tTopik\tTipe\tPertanyaan\tOpsi A\tOpsi B\tOpsi C\tOpsi D\tOpsi E\tKunci Jawaban\tPembahasan\tKompetensi Kejuruan\n";
      const q40 = getCbt40Questions(selectedModuleId);
      q40.forEach((q) => {
        const optA = clean(q.options.find(o => o.key === 'A')?.text || '');
        const optB = clean(q.options.find(o => o.key === 'B')?.text || '');
        const optC = clean(q.options.find(o => o.key === 'C')?.text || '');
        const optD = clean(q.options.find(o => o.key === 'D')?.text || '');
        const optE = clean(q.options.find(o => o.key === 'E')?.text || '');
        text += `${q.id}\t${q.moduleCode}\t${clean(q.topic)}\tPG CBT\t${clean(q.question)}\t${optA}\t${optB}\t${optC}\t${optD}\t${optE}\t${q.correctAnswer}\t${clean(q.explanation)}\t${clean(q.smkCompetency)}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setExportCopied(tabType);
    setTimeout(() => setExportCopied(null), 3000);
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg';
    if (fontSize === 'xlarge') return 'text-xl';
    return 'text-base';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Navigation: Pusat CBT & Asesmen KKA */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 font-mono">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Standar Ujian Komputer (CBT) Kurikulum KKA SMK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pusat Ujian CBT & Bank Soal Komprehensif
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Dilengkapi simulasi ujian standar ANBK 40 Soal Pilihan Ganda (Opsi A–E), lembar kerja 10 Soal Essay per modul dengan rubrik resmi, dan ekspor tab Google Sheets untuk guru.
            </p>
          </div>

          {/* Quick Info Box */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shrink-0">
            <div className="text-right">
              <div className="text-[11px] font-mono font-medium text-slate-500 uppercase">Peserta Ujian</div>
              <div className="text-sm font-bold text-slate-900 truncate max-w-[180px]">
                {currentStudent ? currentStudent.name : "Simon Murd (Guru Mapel)"}
              </div>
              <div className="text-xs text-indigo-600 font-mono">
                {currentStudent ? `${currentStudent.className} • KKM: 75` : "Administrator Kurikulum"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm">
              {currentStudent ? currentStudent.className.split(' ')[0] : 'KKA'}
            </div>
          </div>
        </div>

        {/* 4 Mode Navigation Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-6">
          <button
            onClick={() => setSubMode('cbt_exam')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              subMode === 'cbt_exam'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Ujian CBT (40 PG)</span>
          </button>

          <button
            onClick={() => setSubMode('essay_exam')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              subMode === 'essay_exam'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Ujian Essay (10 Soal)</span>
          </button>

          <button
            onClick={() => setSubMode('sheets_bank')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              subMode === 'sheets_bank'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Tab Google Sheets</span>
          </button>

          <button
            onClick={() => setSubMode('teacher_analysis')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium text-xs sm:text-sm transition-all border ${
              subMode === 'teacher_analysis'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Analisis Asesmen Guru</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUBMODE: UJIAN CBT 40 SOAL PG RESMI STANDAR ANBK / PUSMENDIK          */}
      {/* ========================================================================= */}
      {subMode === 'cbt_exam' && (
        <div className="space-y-6">
          
          {/* Layar Sebelum Mulai Ujian: Pemilihan Paket Ujian CBT */}
          {!examStarted && !examFinished && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Siap Ujian CBT KKA SMK • Alokasi Waktu: 60 Menit</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Konfigurasi Simulasi Ujian CBT (40 Soal Pilihan Ganda)
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pilih apakah Anda ingin menguji materi spesifik per modul (Modul 1 s.d. 24) atau mengikuti Ujian Komprehensif Semester yang menggabungkan seluruh kompetensi kejuruan TJKT & RPL.
                </p>
              </div>

              {/* Pilihan Paket */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => setIsComprehensiveExam(false)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    !isComprehensiveExam 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                      Opsi 1: Ujian Per Modul
                    </span>
                    {!isComprehensiveExam && <Check className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Paket 40 PG Khusus Modul</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Fokus menguji butir soal mendalam pada satu modul tertentu (40 Soal Opsi A-E).
                  </p>

                  <label className="block text-xs font-semibold text-slate-700 mb-2">Pilih Modul Ujian:</label>
                  <select
                    disabled={isComprehensiveExam}
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {MODULES_DATA.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code}: {m.shortTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div 
                  onClick={() => setIsComprehensiveExam(true)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    isComprehensiveExam 
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-sm' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                      Opsi 2: Ujian Terpadu Semester
                    </span>
                    {isComprehensiveExam && <Check className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Ujian Komprehensif (24 Modul)</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Menggabungkan butir soal dari seluruh 24 modul (Fondasi Grafis, State Machine, Vektor, A*, AI, & Jaringan).
                  </p>
                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs">
                    Rekomendasi untuk Ujian Akhir Semester (UAS) / Penilaian Sumatif Akhir Jenjang SMK.
                  </div>
                </div>
              </div>

              {/* Tata Tertib Ujian CBT */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Petunjuk Pengerjaan CBT Siswa SMK:</span>
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                  <li>Jumlah soal: <strong>40 butir Pilihan Ganda (Opsi A, B, C, D, E)</strong>.</li>
                  <li>Waktu pengerjaan: <strong>60 menit (3.600 detik)</strong>. Timer berjalan otomatis.</li>
                  <li>Gunakan tombol <strong>Ragu-Ragu (Kuning)</strong> jika belum yakin dengan jawaban yang dipilih.</li>
                  <li>Warna nomor pada kisi-kisi: <strong>Abu-abu (Belum Dijawab)</strong>, <strong>Hijau (Sudah Dijawab)</strong>, <strong>Kuning (Ragu-ragu)</strong>.</li>
                  <li>Kriteria Ketuntasan Minimal (KKM) mata pelajaran KKA SMK adalah <strong>75</strong>.</li>
                </ul>
              </div>

              {/* Tombol Mulai Ujian */}
              <div className="flex justify-end">
                <button
                  onClick={handleStartExam}
                  className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Clock className="w-5 h-5" />
                  <span>Mulai Simulasi Ujian CBT (40 Soal)</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Antarmuka Ujian CBT yang Sedang Berjalan */}
          {examStarted && !examFinished && (
            <div className="space-y-6">
              
              {/* Header CBT Resmi: Timer, Identitas, Font Size */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 sticky top-24 z-30 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  
                  {/* Info Ujian & Soal Aktif */}
                  <div>
                    <div className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-wider">
                      {isComprehensiveExam ? "Ujian CBT Komprehensif (40 PG)" : `CBT ${cbtQuestions[0]?.moduleCode}: ${cbtQuestions[0]?.moduleTitle}`}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Soal Nomor {currentQIndex + 1}</span>
                      <span className="text-xs font-medium text-slate-400 font-mono">/ 40 Butir</span>
                    </div>
                  </div>

                  {/* Pengatur Ukuran Font Soal */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <span className="text-[11px] font-mono text-slate-500 px-2 font-medium">Ukuran Teks:</span>
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                        fontSize === 'normal' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2.5 py-1 text-sm rounded-lg font-bold transition-all ${
                        fontSize === 'large' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => setFontSize('xlarge')}
                      className={`px-2.5 py-1 text-base rounded-lg font-bold transition-all ${
                        fontSize === 'xlarge' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      A++
                    </button>
                  </div>

                  {/* Sisa Waktu Ujian (Timer ANBK) */}
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border font-mono font-bold text-sm sm:text-base ${
                    timeLeft < 300 
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                      : timeLeft < 900
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  }`}>
                    <Clock className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-sans font-medium">Sisa Waktu</div>
                      <div>{formatTimer(timeLeft)}</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Area Utama: Soal Kiri & Kisi-Kisi Nomor Kanan */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Kolom Soal (8/12) */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                  
                  {/* Kompetensi & Topik */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {cbtQuestions[currentQIndex]?.smkCompetency}
                    </span>
                    <span className="text-xs font-semibold text-indigo-600">
                      Topik: {cbtQuestions[currentQIndex]?.topic}
                    </span>
                  </div>

                  {/* Pertanyaan */}
                  <div className={`text-slate-800 leading-relaxed font-sans ${getFontSizeClass()}`}>
                    <p className="whitespace-pre-line font-medium">
                      {cbtQuestions[currentQIndex]?.question}
                    </p>
                  </div>

                  {/* Cuplikan Kode Jika Ada */}
                  {cbtQuestions[currentQIndex]?.codingSnippet && (
                    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                      <pre>{cbtQuestions[currentQIndex]?.codingSnippet}</pre>
                    </div>
                  )}

                  {/* Opsi Jawaban A, B, C, D, E */}
                  <div className="space-y-3 pt-2">
                    {cbtQuestions[currentQIndex]?.options.map((opt) => {
                      const isSelected = userAnswers[currentQIndex] === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleSelectOption(opt.key)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {opt.key}
                          </div>
                          <div className={`pt-1 text-sm sm:text-base leading-relaxed ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                            {opt.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Navigasi Bawah */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                    
                    {/* Tombol Sebelumnya */}
                    <button
                      disabled={currentQIndex === 0}
                      onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                      className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Soal Sebelumnya</span>
                    </button>

                    {/* Tombol Ragu-Ragu (Kuning) */}
                    <button
                      onClick={handleToggleFlag}
                      className={`px-5 py-3 rounded-2xl font-semibold text-xs sm:text-sm flex items-center gap-2 border transition-all ${
                        flagged[currentQIndex]
                          ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      <span>{flagged[currentQIndex] ? 'Hapus Tanda Ragu-Ragu' : 'Tandai Ragu-Ragu'}</span>
                    </button>

                    {/* Tombol Selanjutnya / Selesaikan */}
                    {currentQIndex < cbtQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(prev => Math.min(cbtQuestions.length - 1, prev + 1))}
                        className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
                      >
                        <span>Soal Berikutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan Ujian</span>
                      </button>
                    )}

                  </div>

                </div>

                {/* Kolom Kisi-Kisi Nomor 1 - 40 (4/12) */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900 font-sans">
                      Lembar Jawaban (40 Nomor)
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                      {Object.keys(userAnswers).length}/40 Terisi
                    </span>
                  </div>

                  {/* Keterangan Warna Status */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-white border border-slate-300"></span>
                      <span>Kosong</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
                      <span className="text-emerald-700 font-semibold">Dijawab</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                      <span className="text-amber-700 font-semibold">Ragu-Ragu</span>
                    </div>
                  </div>

                  {/* Grid 40 Nomor */}
                  <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
                    {cbtQuestions.map((_, idx) => {
                      const isCurrent = idx === currentQIndex;
                      const isAnswered = !!userAnswers[idx];
                      const isFlagged = !!flagged[idx];

                      let btnBg = "bg-white text-slate-700 border-slate-200 hover:bg-slate-100";
                      if (isFlagged) {
                        btnBg = "bg-amber-400 text-slate-900 border-amber-500 font-bold";
                      } else if (isAnswered) {
                        btnBg = "bg-emerald-600 text-white border-emerald-600 font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentQIndex(idx)}
                          className={`h-10 rounded-xl text-xs font-mono transition-all flex flex-col items-center justify-center border relative ${btnBg} ${
                            isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10' : ''
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {userAnswers[idx] && (
                            <span className="text-[9px] font-sans opacity-90">{userAnswers[idx]}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Tombol Cepat Selesai Ujian */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Kumpulkan Hasil Ujian</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Modal Konfirmasi Penyelesaian Ujian */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-amber-600">
                  <AlertCircle className="w-7 h-7" />
                  <h3 className="text-xl font-bold text-slate-900">Konfirmasi Pengumpulan Ujian</h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Apakah Anda yakin ingin menyelesaikan simulasi CBT ini? Periksa kembali rekap status lembar jawaban Anda di bawah:
                </p>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="text-2xl font-bold text-emerald-700 font-mono">
                      {Object.keys(userAnswers).length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Sudah Dijawab</div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="text-2xl font-bold text-amber-700 font-mono">
                      {Object.values(flagged).filter(Boolean).length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Ragu-Ragu</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-2xl font-bold text-slate-700 font-mono">
                      {40 - Object.keys(userAnswers).length}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Belum Dijawab</div>
                  </div>
                </div>

                {Object.values(flagged).filter(Boolean).length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    Perhatian: Masih terdapat soal dengan status <strong>Ragu-Ragu</strong>. Nilai pilihan terakhir tetap akan diperhitungkan.
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm"
                  >
                    Kembali Periksa
                  </button>
                  <button
                    onClick={handleFinishExam}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md"
                  >
                    Ya, Selesaikan Sekarang
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lembar Hasil & Analisis Butir Soal CBT */}
          {examFinished && (
            <div className="space-y-6">
              
              {/* Kartu Skor & Nilai Akhir */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6 print:border-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 font-mono">
                      <Award className="w-3.5 h-3.5" />
                      <span>Lembar Hasil Ujian Komputer (CBT) Resmi</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Hasil Evaluasi Asesmen KKA SMK
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Peserta: <strong>{currentStudent ? currentStudent.name : "Simon Murd"}</strong> ({currentStudent ? currentStudent.className : "Pendidik KKA"}) • Sekolah: <strong>SMK NEGERI 1 SINGKAWANG</strong>
                    </p>
                  </div>

                  {/* Nilai Rapor & Predikat */}
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] font-mono font-bold uppercase text-slate-500">Nilai Akhir (0-100)</div>
                      <div className={`text-4xl font-extrabold font-mono ${cbtResult.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {cbtResult.finalScore}
                      </div>
                      <div className="text-xs font-semibold mt-0.5">
                        {cbtResult.isPassed ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">TUNTAS KKM</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">PERLU REMEDIAL</span>
                        )}
                      </div>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-mono shadow-sm">
                      <span className="text-[10px] opacity-80 uppercase font-sans">Grade</span>
                      <span className="text-2xl font-bold">{cbtResult.grade}</span>
                    </div>
                  </div>
                </div>

                {/* Statistik Rinci */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-xs text-slate-500 font-medium">Total Soal</div>
                    <div className="text-2xl font-bold text-slate-800 font-mono mt-1">40 Butir</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <div className="text-xs text-emerald-700 font-medium">Jawaban Benar</div>
                    <div className="text-2xl font-bold text-emerald-700 font-mono mt-1">{cbtResult.correct}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
                    <div className="text-xs text-rose-700 font-medium">Jawaban Salah</div>
                    <div className="text-2xl font-bold text-rose-700 font-mono mt-1">{cbtResult.wrong}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                    <div className="text-xs text-amber-700 font-medium">Tidak Dijawab</div>
                    <div className="text-2xl font-bold text-amber-700 font-mono mt-1">{cbtResult.unattempted}</div>
                  </div>
                </div>

                {/* Action Buttons: Cetak & Sinkron ke Google Sheets */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleStartExam}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Ujian CBT</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Cetak Hasil (PDF)</span>
                    </button>

                    <button
                      disabled={isSendingToSheets}
                      onClick={handleSendResultToSheets}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingToSheets ? 'Menyinkronkan...' : 'Kirim Skor ke Google Sheets'}</span>
                    </button>
                  </div>
                </div>

                {sheetsSyncMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    {sheetsSyncMessage}
                  </div>
                )}
              </div>

              {/* Pembahasan Lengkap 40 Butir Soal CBT */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Pembahasan Kunci Jawaban Lengkap (Nomor 1 - 40)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan pembahasan butir soal ini untuk pengayaan atau bahan remedial mandiri siswa.
                  </p>
                </div>

                <div className="space-y-4">
                  {cbtQuestions.map((q, idx) => {
                    const studentAns = userAnswers[idx];
                    const isCorrect = studentAns === q.correctAnswer;

                    return (
                      <div 
                        key={idx}
                        className={`p-5 rounded-2xl border transition-all ${
                          isCorrect 
                            ? 'bg-emerald-50/20 border-emerald-200' 
                            : studentAns 
                            ? 'bg-rose-50/20 border-rose-200' 
                            : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-slate-700">
                            Soal #{idx + 1} • {q.topic}
                          </span>
                          <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isCorrect 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : studentAns 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isCorrect ? 'BENAR (+2.5 Poin)' : studentAns ? `SALAH (Jawaban Anda: ${studentAns})` : 'KOSONG (0 Poin)'}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-800 font-medium mb-3">
                          {q.question}
                        </p>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-3">
                          <div className="font-semibold text-indigo-700">
                            Kunci Jawaban Benar: Pilihan ({q.correctAnswer})
                          </div>
                          <div className="text-slate-600">
                            <strong>Penjelasan Konseptual:</strong> {q.explanation}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono">
                          Kompetensi Kejuruan: {q.smkCompetency}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUBMODE: LEMBAR UJIAN ESSAY (10 SOAL PER MODUL 1-24)                   */}
      {/* ========================================================================= */}
      {subMode === 'essay_exam' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold mb-2 font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Studi Kasus Koding & Analisis Problem Solving • 10 Soal per Modul</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Lembar Ujian Essay Teknis KKA SMK
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Masing-masing modul memiliki 10 butir soal essay berbasis studi kasus industri, debugging kode, dan rubrik penilaian 0-100.
                </p>
              </div>

              {/* Selector Modul Essay */}
              <div className="w-full md:w-80">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Modul Essay:</label>
                <select
                  value={essayModuleId}
                  onChange={(e) => setEssayModuleId(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {MODULES_DATA.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code}: {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List 10 Soal Essay */}
            <div className="space-y-6">
              {essayQuestions.map((eq, idx) => {
                const isRevealed = !!revealedSolutions[eq.id];
                const studentText = essayAnswers[eq.id] || '';
                const currentScore = essayScores[eq.id] || 0;

                return (
                  <div key={eq.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                    
                    {/* Header Soal Essay */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{eq.topic}</span>
                      </div>
                      <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Bobot: 100 Poin Rubrik
                      </span>
                    </div>

                    {/* Studi Kasus & Prompt Soal */}
                    <div className="space-y-2">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block mb-1">Studi Kasus / Skenario Industri:</span>
                        {eq.caseStudy}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed">
                        {eq.question}
                      </p>
                    </div>

                    {/* Starter Code Jika Ada */}
                    {eq.starterCode && (
                      <div className="bg-slate-900 rounded-xl p-3.5 font-mono text-xs text-emerald-400 overflow-x-auto">
                        <div className="text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
                          Starter Code / Kasus Debugging:
                        </div>
                        <pre>{eq.starterCode}</pre>
                      </div>
                    )}

                    {/* Area Ketik Jawaban Siswa */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Lembar Jawaban Siswa (Penjelasan / Kode Program Solusi):
                      </label>
                      <textarea
                        rows={4}
                        value={studentText}
                        onChange={(e) => setEssayAnswers(prev => ({ ...prev, [eq.id]: e.target.value }))}
                        placeholder="Tuliskan analisis atau kode JavaScript solusi Anda di sini..."
                        className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Action Buka Kunci Jawaban & Rubrik */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => setRevealedSolutions(prev => ({ ...prev, [eq.id]: !prev[eq.id] }))}
                        className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
                        <span>{isRevealed ? 'Tutup Kunci & Rubrik' : 'Lihat Kunci Model & Rubrik Penskoran'}</span>
                      </button>

                      {/* Input Nilai Guru / Penilaian Mandiri */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-medium">Input Nilai Guru:</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentScore}
                          onChange={(e) => setEssayScores(prev => ({ ...prev, [eq.id]: Number(e.target.value) }))}
                          className="w-20 text-xs font-mono font-bold text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-2 focus:ring-indigo-600"
                        />
                        <span className="text-xs font-mono text-slate-400">/ 100</span>
                      </div>
                    </div>

                    {/* Panel Terbuka: Kunci Model Jawaban & Rubrik Guru */}
                    {isRevealed && (
                      <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-4 animate-in fade-in duration-150">
                        
                        {/* Model Solusi Ideal */}
                        <div>
                          <div className="text-xs font-bold text-indigo-900 mb-1.5 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Model Solusi Ideal & Analisis Teknis Guru:</span>
                          </div>
                          <div className="bg-white p-3.5 rounded-xl border border-indigo-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed shadow-xs">
                            {eq.modelAnswer}
                          </div>
                        </div>

                        {/* Rubrik Penilaian Resmi Guru */}
                        <div>
                          <div className="text-xs font-bold text-indigo-900 mb-2">
                            Rubrik Penskoran Asesmen (Total 100 Poin):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {eq.rubric.map((r, rIdx) => (
                              <div key={rIdx} className="bg-white p-2.5 rounded-lg border border-indigo-100 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{r.criterion}</span>
                                  <span className="font-mono text-indigo-600 font-bold">{r.maxScore} Poin</span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {r.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUBMODE: FORMAT TABEL GOOGLE SHEETS (Modul_Materi & Bank_Soal)         */}
      {/* ========================================================================= */}
      {subMode === 'sheets_bank' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2 font-mono">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Format Tabel Sesuai Permintaan Guru • Langsung Copy-Paste</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Ekspor Tab Google Sheets (Modul_Materi & Bank_Soal)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data telah dirapikan ke dalam format baris & kolom tabular siap tempel (copy-paste) ke spreadsheet guru SMK.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCopySheetsTable('Modul_Materi')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Copy className="w-4 h-4 text-indigo-600" />
                <span>{exportCopied === 'Modul_Materi' ? 'Tersalin!' : 'Salin Tab Modul_Materi'}</span>
              </button>

              <button
                onClick={() => handleCopySheetsTable('Bank_Soal')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{exportCopied === 'Bank_Soal' ? 'Tersalin!' : 'Salin Tab Bank_Soal'}</span>
              </button>
            </div>
          </div>

          {/* Preview Tab Modul_Materi */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Preview Tab: Modul_Materi (24 Baris Modul Pembelajaran KKA)</span>
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                  <tr>
                    <th className="p-3">No</th>
                    <th className="p-3">Kode Modul</th>
                    <th className="p-3">Nama Modul</th>
                    <th className="p-3">Kelompok</th>
                    <th className="p-3">Domain Kompetensi</th>
                    <th className="p-3">Ringkasan Materi SMK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {MODULES_DATA.slice(0, 8).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-800">{m.id}</td>
                      <td className="p-3 font-mono text-indigo-600 font-semibold">{m.code}</td>
                      <td className="p-3 font-medium text-slate-900">{m.shortTitle}</td>
                      <td className="p-3">{m.groupLabel}</td>
                      <td className="p-3 text-slate-700">{m.domainCategory}</td>
                      <td className="p-3 max-w-xs truncate">{m.smkSummary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-right">
              Menampilkan 8 dari total 24 Modul. Klik 'Salin Tab Modul_Materi' untuk seluruh 24 baris lengkap.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBMODE: ANALISIS ASESMEN GURU KKA (DIAGNOSTIK & KISI-KISI)             */}
      {/* ========================================================================= */}
      {subMode === 'teacher_analysis' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-2 font-mono">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analisis Kompetensi Kurikulum Merdeka KKA SMK</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Analisis Butir Soal & Diagnostik Pembelajaran
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pandangan guru untuk memetakan daya serap siswa, tingkat kesulitan soal, dan rekomendasi program pengayaan/remedial.
            </p>
          </div>

          {/* Matriks 4 Domain Utama KKA SMK */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-700 uppercase">Domain 1: Fondasi Grafis</span>
              <div className="text-xl font-bold text-slate-900">Modul 1 – 3</div>
              <p className="text-xs text-slate-600 leading-normal">
                Koordinat layar kanvas, rendering primitif, game loop 60 FPS, dan efisiensi modular DRY.
              </p>
              <div className="text-[11px] font-mono font-semibold text-emerald-700">Daya Serap Rata-rata: 88% (Tinggi)</div>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase">Domain 2: DOM & Fisika 2D</span>
              <div className="text-xl font-bold text-slate-900">Modul 4 – 10</div>
              <p className="text-xs text-slate-600 leading-normal">
                State management, array 2D tilemap, antrean ular, vektor pantulan, dan deteksi tabrakan AABB.
              </p>
              <div className="text-[11px] font-mono font-semibold text-emerald-700">Daya Serap Rata-rata: 82% (Baik)</div>
            </div>

            <div className="p-5 rounded-2xl bg-violet-50/50 border border-violet-200 space-y-2">
              <span className="text-xs font-mono font-bold text-violet-700 uppercase">Domain 3: AI & Algoritma</span>
              <div className="text-xl font-bold text-slate-900">Modul 11 – 18</div>
              <p className="text-xs text-slate-600 leading-normal">
                Pathfinding A*, FSM AI musuh, klasifikasi Machine Learning KNN, perceptron, dan platformer terpadu.
              </p>
              <div className="text-[11px] font-mono font-semibold text-amber-700">Daya Serap Rata-rata: 74% (Sedang)</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Domain 4: Advanced & Jaringan</span>
              <div className="text-xl font-bold text-slate-900">Modul 19 – 24</div>
              <p className="text-xs text-slate-600 leading-normal">
                Generasi prosedural, optimasi memory leak/pooling, computer vision, neuro-evolution, dan jaringan LERP.
              </p>
              <div className="text-[11px] font-mono font-semibold text-amber-700">Daya Serap Rata-rata: 71% (Perlu Remedial)</div>
            </div>
          </div>

          {/* Rekomendasi Tindak Lanjut Guru */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">
              Rekomendasi Tindak Lanjut Pendidik (Simon Murd):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">1. Program Pengayaan (Siswa Nilai &gt;= 85):</span>
                Diberikan tugas modifikasi kode pada Lab Koding: Menambahkan algoritma genetic neuro-evolution untuk navigasi mandiri tank pada Modul 23 & 24.
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">2. Program Remedial (Siswa Nilai &lt; 75):</span>
                Fokus latihan terbimbing pada 10 Soal Essay Modul 12 (A* Pathfinding) dan Modul 14 (KNN) dengan memanfaatkan rubrik solusi ideal.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
