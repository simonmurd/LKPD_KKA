/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dashboard Administrasi & Monitoring Guru KKA SMK
 * Fitur Lengkap:
 * 1. 🏛️ Buku Leger Nilai Siswa Kurikulum Merdeka (NPK 40%, NFC 30%, NSP 30%, NA, Predikat, & Status KKM 75).
 * 2. 🖨️ Cetak Leger Resmi & Export TSV / CSV untuk e-Rapor & Google Sheets.
 * 3. 📜 Rapor Capaian Siswa Individual (Modal Rapor & Cetak PDF).
 * 4. 🎯 Matriks Progres 24 Modul Koding (Tracking detail pengerjaan per siswa).
 * 5. 🔴 Live Log Ujian CBT Masuk (Real-time Firestore stream).
 * 6. 👥 Presensi & Pemantauan Aktivitas Kelas (Siapa yang sedang online & sedang di modul berapa).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { STUDENTS_DATA, SCHOOL_OPTIONS, CLASS_OPTIONS, Student } from '../data/studentsData';
import { MODULES_DATA } from '../data/modulesData';
import { generateCSV, downloadFile } from '../services/sheetsSyncService';
import { 
  subscribeToExamResults, 
  FirestoreExamResult, 
  subscribeToAssignments, 
  saveAssignmentToFirestore, 
  subscribeToSubmissions, 
  gradeSubmissionInFirestore 
} from '../firebase';
import { StudentReportCardModal } from './StudentReportCardModal';
import { Assignment, StudentSubmission, INITIAL_ASSIGNMENTS } from '../data/assignmentsData';
import { 
  Search, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Radio,
  Printer,
  TableProperties,
  Grid3X3,
  Users,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  BarChart2,
  FileCheck,
  Plus,
  Zap,
  Sparkles,
  Save,
  X,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

export type TeacherDashboardTab = 'leger' | 'assignments' | 'matrix' | 'live_exams' | 'presence';

export const TeacherMonitoringPanel: React.FC = () => {
  const { studentProgressMap } = useAuth();
  const { onlineStudents } = useRealtime();
  
  const [activeTab, setActiveTab] = useState<TeacherDashboardTab>('leger');
  const [recentExams, setRecentExams] = useState<FirestoreExamResult[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('SEMUA SEKOLAH');
  const [filterClass, setFilterClass] = useState<string>('SEMUA KELAS');
  const [filterAssignmentCode, setFilterAssignmentCode] = useState<string>('SEMUA TUGAS');
  const [copiedTSV, setCopiedTSV] = useState(false);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);

  // New assignment modal form state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskModuleId, setNewTaskModuleId] = useState(1);
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCriteria, setNewTaskCriteria] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Grading states per submission
  const [gradeInputMap, setGradeInputMap] = useState<Record<string, { score: number; feedback: string }>>({});
  const [isSavingGradeMap, setIsSavingGradeMap] = useState<Record<string, boolean>>({});
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Subscribe to real-time exam results, assignments, and submissions from Cloud Firestore
  useEffect(() => {
    const unsubExams = subscribeToExamResults((results) => {
      setRecentExams(results);
    });

    const unsubAssign = subscribeToAssignments((list) => {
      setAssignments(list);
    });

    const unsubSubs = subscribeToSubmissions((list) => {
      setSubmissions(list);
    });

    return () => {
      unsubExams();
      unsubAssign();
      unsubSubs();
    };
  }, []);

  // Filter students based on school, class, and search query
  const filteredStudents = useMemo(() => {
    return STUDENTS_DATA.filter((s) => {
      const matchSchool =
        filterSchool === 'SEMUA SEKOLAH' || s.school.toLowerCase() === filterSchool.toLowerCase();
      const matchClass =
        filterClass === 'SEMUA KELAS' || s.className.toLowerCase() === filterClass.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.noAbsen.includes(q) ||
        s.className.toLowerCase().includes(q);

      return matchSchool && matchClass && matchQuery;
    });
  }, [filterSchool, filterClass, searchQuery]);

  // Statistics calculation
  const totalStudents = STUDENTS_DATA.length;
  const activeStudentsCount = Object.keys(studentProgressMap).length;
  
  // Calculate Leger Data for a student
  const calculateStudentLeger = (studentId: string) => {
    const prog = studentProgressMap[studentId];
    const practicedCount = prog ? prog.practicedModules.length : 0;
    const rawQuizScore = prog ? prog.quizScore : 0;

    // Nilai Praktik Koding (NPK): 40% (0-100)
    const npk = Math.min(100, Math.round((practicedCount / 24) * 100));
    
    // Nilai Formatif CBT (NFC): 30%
    const nfc = rawQuizScore > 0 ? rawQuizScore : (practicedCount > 0 ? Math.min(95, 70 + practicedCount) : 0);
    
    // Nilai Sumatif / Essay (NSP): 30%
    const nsp = rawQuizScore > 0 ? Math.min(100, rawQuizScore + 2) : (practicedCount >= 12 ? 80 : 0);

    // Nilai Akhir (NA)
    const na = (practicedCount === 0 && rawQuizScore === 0) 
      ? 0 
      : Math.round((npk * 0.4) + (nfc * 0.3) + (nsp * 0.3));

    const isPassed = na >= 75;
    let predikat = 'D';
    if (na >= 90) predikat = 'A';
    else if (na >= 80) predikat = 'B';
    else if (na >= 75) predikat = 'C';

    return {
      practicedCount,
      npk,
      nfc,
      nsp,
      na,
      predikat,
      isPassed,
      lastActive: prog?.lastActive || '-'
    };
  };

  // Leger summary metrics
  const legerSummary = useMemo(() => {
    let tuntasCount = 0;
    let remedialCount = 0;
    let totalNA = 0;
    let countedStudents = 0;

    STUDENTS_DATA.forEach(s => {
      const leger = calculateStudentLeger(s.id);
      if (leger.na > 0) {
        totalNA += leger.na;
        countedStudents++;
        if (leger.isPassed) tuntasCount++;
        else remedialCount++;
      }
    });

    const rataRataKelas = countedStudents > 0 ? (totalNA / countedStudents).toFixed(1) : '0';
    return { tuntasCount, remedialCount, rataRataKelas, countedStudents };
  }, [studentProgressMap]);

  // Salin Buku Leger Nilai ke TSV untuk Google Sheets / Excel
  const handleCopyLegerTSV = () => {
    const headers = [
      "No",
      "No_Absen",
      "Nama_Siswa",
      "Kelas",
      "Sekolah",
      "Modul_Selesai",
      "Nilai_Praktik_Koding_NPK_40%",
      "Nilai_Formatif_CBT_NFC_30%",
      "Nilai_Sumatif_NSP_30%",
      "Nilai_Akhir_NA",
      "Predikat",
      "Status_Kelulusan_KKM_75",
      "Deskripsi_Capaian_Kompetensi"
    ];

    const rows = filteredStudents.map((s, idx) => {
      const l = calculateStudentLeger(s.id);
      const deskripsi = l.isPassed 
        ? `Menunjukkan penguasaan ${l.predikat === 'A' ? 'sangat baik' : 'baik'} dalam logika berpikir komputasional, koding modular 24 modul Canvas 2D, dan konsep dasar AI.`
        : `Perlu bimbingan dan pendampingan remedial dalam koding modular dan pemahaman logika komputasional.`;

      return [
        (idx + 1).toString(),
        s.noAbsen,
        s.name,
        s.className,
        s.school,
        `${l.practicedCount}/24`,
        l.npk.toString(),
        l.nfc.toString(),
        l.nsp.toString(),
        l.na.toString(),
        l.predikat,
        l.isPassed ? "TUNTAS" : "REMEDIAL",
        deskripsi
      ];
    });

    const tsv = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedTSV(true);
      setTimeout(() => setCopiedTSV(false), 3000);
    });
  };

  // Download Buku Leger CSV
  const handleDownloadLegerCSV = () => {
    const headers = [
      "No", "No_Absen", "Nama_Siswa", "Kelas", "Sekolah",
      "Modul_Selesai", "Nilai_Praktik_Koding", "Nilai_Formatif_CBT", 
      "Nilai_Sumatif_Essay", "Nilai_Akhir", "Predikat", "Status_KKM"
    ];

    const rows = filteredStudents.map((s, idx) => {
      const l = calculateStudentLeger(s.id);
      return [
        idx + 1,
        s.noAbsen,
        s.name,
        s.className,
        s.school,
        `${l.practicedCount}/24`,
        l.npk,
        l.nfc,
        l.nsp,
        l.na,
        l.predikat,
        l.isPassed ? "TUNTAS" : "REMEDIAL"
      ];
    });

    const csv = generateCSV(headers, rows);
    downloadFile(csv, `Leger_Nilai_KKA_${filterClass.replace(/\s+/g, '_')}.csv`);
  };

  const handlePrintLeger = () => {
    window.print();
  };

  // Hitung jumlah pengumpulan yang belum dinilai
  const pendingGradingCount = useMemo(() => {
    return submissions.filter(s => s.status === 'submitted' || !s.score).length;
  }, [submissions]);

  // Filter Submissions berdasarkan Sekolah, Kelas, Tugas, dan Pencarian
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchSchool =
        filterSchool === 'SEMUA SEKOLAH' ||
        STUDENTS_DATA.some(s => s.id === sub.studentId && s.school.toLowerCase() === filterSchool.toLowerCase());
      const matchClass =
        filterClass === 'SEMUA KELAS' ||
        (sub.studentClass && sub.studentClass.toLowerCase() === filterClass.toLowerCase());
      const matchAssignment =
        filterAssignmentCode === 'SEMUA TUGAS' ||
        sub.assignmentId === filterAssignmentCode;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        sub.studentName.toLowerCase().includes(q) ||
        (sub.studentAbsen && sub.studentAbsen.includes(q)) ||
        (sub.studentClass && sub.studentClass.toLowerCase().includes(q));

      return matchSchool && matchClass && matchAssignment && matchQuery;
    });
  }, [submissions, filterSchool, filterClass, filterAssignmentCode, searchQuery]);

  // Guru membuat tugas baru dan menyimpan ke Firestore
  const handleCreateNewAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    const mod = MODULES_DATA.find((m) => m.id === Number(newTaskModuleId));
    const nextCode = `TUGAS-0${assignments.length + 1}`;
    const newId = `tugas-${Date.now().toString().slice(-6)}`;

    const newAssignment: Assignment = {
      id: newId,
      code: nextCode,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || `Silakan buka dan praktikkan modul simulasi ${mod?.code || ''}. Modifikasi parameter kode kanvas 2D dan kumpulkan hasil pengerjaan Anda.`,
      moduleId: Number(newTaskModuleId),
      moduleCode: mod?.code || `MODUL-${String(newTaskModuleId).padStart(2, '0')}`,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newTaskDueDate,
      targetCriteria: newTaskCriteria.trim() || 'Kode berjalan lancar tanpa error konsol, penerapan konsep tepat, dan tugas dikumpulkan tepat waktu.',
      maxScore: 100
    };

    try {
      await saveAssignmentToFirestore(newAssignment);
      setShowCreateTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskCriteria('');
      setActionToast(`Tugas baru "${newAssignment.title}" berhasil disimpan dan dibagikan ke seluruh siswa!`);
      setTimeout(() => setActionToast(null), 4000);
    } catch (err) {
      console.error('Failed to create assignment:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Guru menyimpan nilai dan umpan balik tugas siswa ke Firestore
  const handleSaveGrade = async (submissionId: string) => {
    const currentGrade = gradeInputMap[submissionId];
    const sub = submissions.find(s => s.id === submissionId);
    const score = currentGrade?.score !== undefined ? currentGrade.score : (sub?.score || 85);
    const feedback = currentGrade?.feedback !== undefined ? currentGrade.feedback : (sub?.teacherFeedback || 'Telah dinilai oleh Guru Simon Murd, S.Kom');

    setIsSavingGradeMap(prev => ({ ...prev, [submissionId]: true }));
    try {
      await gradeSubmissionInFirestore(submissionId, score, feedback);
      setActionToast(`Nilai (${score}) untuk ${sub?.studentName || 'siswa'} berhasil disimpan ke Cloud Firestore!`);
      setTimeout(() => setActionToast(null), 3500);
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setIsSavingGradeMap(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Teacher Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Portal Administrasi Guru KKA &bull; Simon Murd, S.Kom</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Database Cloud Firestore Terhubung</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Buku Leger Nilai &amp; <span className="text-indigo-600">Monitoring Siswa SMK</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Pusat kendali asesmen dan rekapitulasi nilai 106 siswa dari SMK Negeri 1 Singkawang dan SMK Mudita Singkawang. Menghitung otomatis Nilai Praktik Koding (40%), Formatif CBT (30%), Sumatif (30%), Nilai Akhir (NA), dan Predikat Rapor.
            </p>
          </div>

          {/* Quick Actions Leger */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLegerTSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
              title="Salin seluruh nilai leger untuk ditempelkan ke Google Sheets / Excel e-Rapor"
            >
              {copiedTSV ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTSV ? 'Leger TSV Tersalin!' : 'Salin Leger ke Sheets'}</span>
            </button>

            <button
              onClick={handleDownloadLegerCSV}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-300 transition shadow-xs"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={handlePrintLeger}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs flex items-center gap-2 transition shadow-sm"
              title="Cetak Buku Leger format cetak resmi A4 Landscape"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak Leger Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 print:hidden">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Total Siswa Terdata</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">SMKN 1 &amp; Mudita</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online di Lab</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{onlineStudents.length} Siswa</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Terpantau Real-time</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Siswa Tuntas KKM (75)</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">{legerSummary.tuntasCount} Siswa</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Memenuhi Syarat</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Rata-Rata Nilai (NA)</div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{legerSummary.rataRataKelas}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Skala 0 - 100</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Ujian CBT Masuk</div>
          <div className="text-2xl font-bold font-mono text-violet-600 mt-1">{recentExams.length} Ujian</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Live di Firestore</div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl w-fit border border-slate-200 overflow-x-auto max-w-full print:hidden">
        <button
          onClick={() => setActiveTab('leger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leger'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TableProperties className="w-4 h-4 text-indigo-600" />
          <span>Buku Leger Nilai Siswa</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Kelola &amp; Nilai Tugas</span>
          {submissions.length > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full">
              {submissions.length} Kiriman
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid3X3 className="w-4 h-4 text-cyan-600" />
          <span>Matriks 24 Modul Koding</span>
        </button>

        <button
          onClick={() => setActiveTab('live_exams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'live_exams'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Live Log CBT Masuk</span>
          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-mono font-bold rounded-full">
            {recentExams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('presence')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'presence'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Presensi &amp; Live Lab</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold rounded-full">
            {onlineStudents.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar (shared across leger, matrix, presence, assignments) */}
      {(activeTab === 'leger' || activeTab === 'matrix' || activeTab === 'presence' || activeTab === 'assignments') && (
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm print:hidden">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* School Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Sekolah:</span>
              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {SCHOOL_OPTIONS.map((sc, idx) => (
                  <option key={idx} value={sc}>{sc}</option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Kelas:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                {CLASS_OPTIONS.map((cl, idx) => (
                  <option key={idx} value={cl}>{cl}</option>
                ))}
              </select>
            </div>

            {/* Assignment Filter (Visible in assignments tab) */}
            {activeTab === 'assignments' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold">Tugas:</span>
                <select
                  value={filterAssignmentCode}
                  onChange={(e) => setFilterAssignmentCode(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 focus:outline-none focus:border-indigo-500 font-medium max-w-[200px] truncate"
                >
                  <option value="SEMUA TUGAS">Semua Tugas ({assignments.length})</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>{a.code}: {a.title.slice(0, 24)}...</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau nomor absen..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>

        </div>
      )}

      {/* ================= TAB BARU: KELOLA & NILAI TUGAS SISWA ================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          
          {/* Header Action & Summary */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sistem Penugasan &amp; Penilaian Kecepatan (Speed Scoring)</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Cloud Firestore Live Sync
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Rekap Penugasan &amp; Penilaian Tugas Praktik
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl mt-1 leading-relaxed">
                Guru Simon dapat memberikan tugas baru (misal: penugasan simulasi Modul 1 sampai 24). Siswa yang mengumpulkan lebih cepat mendapatkan rekomendasi bonus kecepatan otomatis (+10 poin untuk &ge;24 jam lebih awal). Guru dapat meninjau kode, memberikan nilai akhir, dan umpan balik yang langsung tampil di dashboard siswa.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Berikan Tugas Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics for Assignments */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Total Tugas Aktif</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{assignments.length} Tugas</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Terkoneksi ke Siswa</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Total Pengumpulan</div>
              <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">{submissions.length} Kiriman</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dari {STUDENTS_DATA.length} Siswa</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Sudah Dinilai</div>
              <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                {submissions.filter(s => s.status === 'graded').length} Siswa
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Nilai Tersimpan</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div className="text-[11px] text-slate-500 uppercase font-semibold font-mono">Menunggu Penilaian</div>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {pendingGradingCount} Siswa
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Perlu Dinilai Guru</div>
            </div>
          </div>

          {/* Table of Submissions & Grading */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Pengumpulan &amp; Form Penilaian Guru</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan kiriman tugas siswa. Nilai yang disimpan otomatis mengupdate Nilai di Tabel 1 Dashboard Siswa &amp; Buku Leger.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Menampilkan {filteredSubmissions.length} pengumpulan
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-slate-700">Belum ada pengumpulan tugas untuk filter ini</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Siswa dapat mengerjakan modul simulasi dari Dashboard Siswa lalu mengklik tombol "Kirim Tugas". Tugas yang terkirim akan langsung muncul di sini secara real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 text-center w-12">No</th>
                      <th className="p-3.5 w-16 text-center">Absen</th>
                      <th className="p-3.5 w-52">Nama Siswa &amp; Kelas</th>
                      <th className="p-3.5 w-44">Tugas &amp; Modul</th>
                      <th className="p-3.5 w-48">Waktu &amp; Kecepatan</th>
                      <th className="p-3.5 w-56">Catatan Siswa</th>
                      <th className="p-3.5 w-60">Penilaian Guru (0-100)</th>
                      <th className="p-3.5 w-32 text-center">Aksi Simpan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub, idx) => {
                      const assign = assignments.find(a => a.id === sub.assignmentId);
                      const currentInput = gradeInputMap[sub.id] || {
                        score: sub.score !== undefined ? sub.score : 85,
                        feedback: sub.teacherFeedback || ''
                      };
                      const isSaving = isSavingGradeMap[sub.id] || false;
                      const isGraded = sub.status === 'graded';

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-indigo-600">{sub.studentAbsen || '-'}</td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{sub.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sub.studentClass}</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-800">{assign?.code || 'TUGAS'}: {assign?.title.slice(0, 24)}...</div>
                            <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-mono font-bold">
                              {assign?.moduleCode || 'MODUL'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(sub.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </div>
                            <div className="mt-1">
                              {sub.speedCategory?.includes('Sangat Cepat') ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <Zap className="w-3 h-3 text-emerald-600" />
                                  <span>{sub.speedCategory}</span>
                                </span>
                              ) : sub.speedCategory?.includes('Tepat Waktu') ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                                  <Clock className="w-3 h-3 text-indigo-600" />
                                  <span>{sub.speedCategory}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                  <span>{sub.speedCategory || 'Reguler'}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 max-h-20 overflow-y-auto leading-relaxed">
                              {sub.notes || 'Siswa mengumpulkan tanpa catatan tambahan.'}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-600">Nilai:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={currentInput.score}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                    setGradeInputMap(prev => ({
                                      ...prev,
                                      [sub.id]: {
                                        ...currentInput,
                                        score: val
                                      }
                                    }));
                                  }}
                                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center"
                                />
                                <div className="flex items-center gap-1">
                                  {[100, 95, 90, 85, 75].map(preset => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => {
                                        setGradeInputMap(prev => ({
                                          ...prev,
                                          [sub.id]: {
                                            ...currentInput,
                                            score: preset
                                          }
                                        }));
                                      }}
                                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded text-[10px] font-mono text-slate-600 transition cursor-pointer"
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="text"
                                placeholder="Catatan/Umpan balik Guru..."
                                value={currentInput.feedback}
                                onChange={(e) => {
                                  setGradeInputMap(prev => ({
                                    ...prev,
                                    [sub.id]: {
                                      ...currentInput,
                                      feedback: e.target.value
                                    }
                                  }));
                                }}
                                className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleSaveGrade(sub.id)}
                              disabled={isSaving}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs w-full cursor-pointer ${
                                isGraded
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                              }`}
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{isSaving ? 'Menyimpan...' : (isGraded ? 'Update' : 'Beri Nilai')}</span>
                            </button>
                            {isGraded && (
                              <span className="inline-block mt-1 text-[10px] font-mono font-bold text-emerald-600">
                                &check; Tersimpan
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 1: BUKU LEGER NILAI SISWA ================= */}
      {activeTab === 'leger' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Printable Header (Visible only when printing) */}
          <div className="hidden print:block p-6 text-center border-b-2 border-slate-900 mb-4">
            <h1 className="text-lg font-black uppercase tracking-tight">
              BUKU LEGER NILAI AKHIR SISWA &bull; MATA PELAJARAN KODING &amp; KECERDASAN ARTIFISIAL (KKA)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {filterSchool !== 'SEMUA SEKOLAH' ? filterSchool : 'SMK NEGERI 1 SINGKAWANG'} &bull; KELAS: {filterClass} &bull; TAHUN AJARAN 2026/2027
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Komposisi Penilaian: Praktik Koding Canvas 2D (40%) + Formatif CBT (30%) + Sumatif/Essay (30%) &bull; KKM: 75.00
            </p>
          </div>

          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <TableProperties className="w-4 h-4 text-indigo-600" />
                <span>Buku Leger Nilai Resmi Kurikulum Merdeka</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Formula Penilaian: <span className="font-mono font-semibold text-slate-700">NA = (NPK &times; 40%) + (NFC &times; 30%) + (NSP &times; 30%)</span> &bull; KKM: <span className="font-bold text-slate-900 font-mono">75.00</span>
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Menampilkan {filteredStudents.length} siswa ({filterClass})
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 text-center w-12">No</th>
                  <th className="p-3 w-16 text-center">Absen</th>
                  <th className="p-3 w-56">Nama Lengkap Siswa</th>
                  <th className="p-3 w-20 text-center">Kelas</th>
                  <th className="p-3 w-24 text-center bg-indigo-50/50 text-indigo-900 border-x border-slate-200">
                    NPK (40%)
                    <span className="block text-[9px] font-normal lowercase text-indigo-600">praktik</span>
                  </th>
                  <th className="p-3 w-24 text-center bg-cyan-50/50 text-cyan-900 border-r border-slate-200">
                    NFC (30%)
                    <span className="block text-[9px] font-normal lowercase text-cyan-600">cbt</span>
                  </th>
                  <th className="p-3 w-24 text-center bg-violet-50/50 text-violet-900 border-r border-slate-200">
                    NSP (30%)
                    <span className="block text-[9px] font-normal lowercase text-violet-600">sumatif</span>
                  </th>
                  <th className="p-3 w-24 text-center bg-amber-50 text-amber-950 font-bold border-r border-slate-200">
                    Nilai Akhir
                    <span className="block text-[9px] font-normal lowercase text-amber-700">(NA)</span>
                  </th>
                  <th className="p-3 w-16 text-center">Predikat</th>
                  <th className="p-3 w-28 text-center">Status KKM</th>
                  <th className="p-3 w-28 text-center print:hidden">Aksi Rapor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => {
                  const l = calculateStudentLeger(s.id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 text-center font-mono font-bold text-indigo-600">{s.noAbsen}</td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal font-mono">{s.school}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-indigo-700 font-semibold border border-slate-200">
                          {s.className}
                        </span>
                      </td>
                      
                      {/* Nilai Praktik Koding */}
                      <td className="p-3 text-center font-mono border-x border-slate-200 bg-indigo-50/20">
                        <span className="font-bold text-indigo-900">{l.npk}</span>
                        <span className="block text-[10px] text-slate-400">({l.practicedCount}/24 mod)</span>
                      </td>

                      {/* Nilai Formatif CBT */}
                      <td className="p-3 text-center font-mono border-r border-slate-200 bg-cyan-50/20 font-bold text-cyan-900">
                        {l.nfc > 0 ? l.nfc : '-'}
                      </td>

                      {/* Nilai Sumatif */}
                      <td className="p-3 text-center font-mono border-r border-slate-200 bg-violet-50/20 font-bold text-violet-900">
                        {l.nsp > 0 ? l.nsp : '-'}
                      </td>

                      {/* Nilai Akhir (NA) */}
                      <td className="p-3 text-center font-mono border-r border-slate-200 bg-amber-50/50">
                        <span className="text-base font-extrabold text-amber-900">{l.na}</span>
                      </td>

                      {/* Predikat */}
                      <td className="p-3 text-center font-mono font-black text-slate-800 text-sm">
                        {l.predikat}
                      </td>

                      {/* Status KKM */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          l.isPassed 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {l.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>

                      {/* Tombol Rapor Siswa Individual */}
                      <td className="p-3 text-center print:hidden">
                        <button
                          onClick={() => setSelectedStudentForReport(s)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1 mx-auto transition border border-indigo-200"
                          title="Lihat Rapor Capaian Siswa & Cetak Kartu Nilai"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rapor</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Printable Signature Section */}
          <div className="hidden print:grid grid-cols-2 p-8 text-xs text-center border-t border-slate-900 mt-6">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah SMK Negeri 1 Singkawang</p>
              <div className="h-16"></div>
              <p className="font-bold uppercase underline">( ............................................ )</p>
              <p className="text-[10px] font-mono">NIP. ........................................</p>
            </div>
            <div>
              <p>Singkawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold">Guru Pengampu Koding &amp; Kecerdasan Artifisial</p>
              <div className="h-16"></div>
              <p className="font-bold uppercase underline">SIMON MURD, S.Kom</p>
              <p className="text-[10px] font-mono">NIP. Guru Pengampu KKA SMK</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 px-4 print:hidden">
            <div>
              <span>Menampilkan {filteredStudents.length} siswa &bull; Data tersinkronisasi otomatis dengan Cloud Firestore</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Standar Penilaian KKA SMK 2026</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MATRIKS 24 MODUL KODING ================= */}
      {activeTab === 'matrix' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-cyan-600" />
                <span>Matriks Ketuntasan 24 Modul Koding Per Siswa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ceklis hijau menandakan siswa telah berhasil membuka, membaca, dan mencoba lab koding interaktif Canvas 2D.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Selesai
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 bg-slate-200 rounded"></span> Belum
              </span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[10px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-center w-10 sticky left-0 bg-slate-50 z-10">No</th>
                  <th className="p-2.5 w-12 text-center sticky left-10 bg-slate-50 z-10">Absen</th>
                  <th className="p-2.5 w-48 sticky left-22 bg-slate-50 z-10 border-r border-slate-200">Nama Siswa</th>
                  {MODULES_DATA.map((m) => (
                    <th key={m.id} className="p-2 text-center w-8 min-w-[32px]" title={`${m.code}: ${m.title}`}>
                      M{m.id}
                    </th>
                  ))}
                  <th className="p-2.5 w-20 text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-200">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => {
                  const prog = studentProgressMap[s.id];
                  const practiced = new Set(prog?.practicedModules || []);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 text-center font-mono text-slate-400 sticky left-0 bg-white">{idx + 1}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-indigo-600 sticky left-10 bg-white">{s.noAbsen}</td>
                      <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap sticky left-22 bg-white border-r border-slate-200">
                        {s.name}
                      </td>
                      {MODULES_DATA.map((m) => {
                        const isDone = practiced.has(m.id);
                        return (
                          <td key={m.id} className="p-1.5 text-center">
                            {isDone ? (
                              <span 
                                className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                                title={`Modul ${m.id} Selesai`}
                              >
                                &check;
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-300 text-[10px]">
                                &ndash;
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-mono font-bold text-indigo-700 sticky right-0 bg-white border-l border-slate-200">
                        {practiced.size} / 24
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVE LOG UJIAN CBT MASUK (FIRESTORE) ================= */}
      {activeTab === 'live_exams' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                Log Masuk Ujian CBT Real-Time (Cloud Firestore Stream)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total {recentExams.length} Hasil Ujian Tersimpan
            </span>
          </div>

          {recentExams.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">Belum Ada Pengiriman Ujian CBT Terbaru</p>
              <p className="mt-1">Ketika siswa menyelesaikan ujian CBT 40 Soal PG atau Essay, nilai akan langsung mengalir ke tabel ini secara instan.</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 text-center w-12">No</th>
                    <th className="p-3.5 w-60">Nama Siswa</th>
                    <th className="p-3.5 w-24 text-center">Kelas</th>
                    <th className="p-3.5 w-44">Modul Ujian</th>
                    <th className="p-3.5 w-32 text-center">Skor CBT</th>
                    <th className="p-3.5 w-32 text-center">Status KKM</th>
                    <th className="p-3.5 w-44 text-right">Waktu Selesai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentExams.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{exam.studentName}</td>
                      <td className="p-3.5 text-center font-mono">{exam.studentClass}</td>
                      <td className="p-3.5 font-medium text-indigo-700">{exam.moduleCode}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-base">
                        <span className={exam.isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                          {exam.mcScore}
                        </span>
                        <span className="text-slate-400 text-xs font-normal"> / 100</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          exam.isPassed 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {exam.isPassed ? 'TUNTAS (>= 75)' : 'REMEDIAL'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        {new Date(exam.submittedAt).toLocaleTimeString()} &bull; {new Date(exam.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: PRESENSI & LIVE LAB AKTIVITAS ================= */}
      {activeTab === 'presence' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Pemantauan Presensi &amp; Aktivitas Layar Siswa (Live)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengetahui siapa saja siswa yang sedang aktif di ruang lab komputer dan modul koding apa yang sedang dibuka saat ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{onlineStudents.length} Siswa Sedang Online</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 w-16 text-center">Absen</th>
                  <th className="p-3.5 w-60">Nama Siswa</th>
                  <th className="p-3.5 w-24 text-center">Kelas</th>
                  <th className="p-3.5 w-44">Status Kehadiran</th>
                  <th className="p-3.5 w-44">Aktivitas Terbuka</th>
                  <th className="p-3.5 w-40 text-right">Login Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => {
                  const onlineUser = onlineStudents.find(u => u.id === s.id);
                  const prog = studentProgressMap[s.id];

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-indigo-600">{s.noAbsen}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5 text-center font-mono">{s.className}</td>
                      <td className="p-3.5">
                        {onlineUser ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Online Aktif di Lab</span>
                          </span>
                        ) : prog ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                            Offline (Pernah Login)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[10px]">
                            Belum Ada Aktivitas
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {onlineUser ? (
                          <div className="flex items-center gap-1 text-indigo-700 font-semibold">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>
                              {onlineUser.currentModuleId 
                                ? `Modul ${onlineUser.currentModuleId}: ${onlineUser.status === 'exam' ? 'Ujian CBT' : 'Koding Canvas'}`
                                : 'Melihat Silabus'}
                            </span>
                          </div>
                        ) : prog ? (
                          <span className="text-slate-500 text-[11px]">
                            Telah mencoba {prog.practicedModules.length} modul
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        {prog?.lastActive && prog.lastActive !== '-'
                          ? new Date(prog.lastActive).toLocaleTimeString()
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Rapor Siswa Individual */}
      {selectedStudentForReport && (
        <StudentReportCardModal
          student={selectedStudentForReport}
          progress={studentProgressMap[selectedStudentForReport.id]}
          onClose={() => setSelectedStudentForReport(null)}
        />
      )}

      {/* Modal Berikan Tugas Baru oleh Guru Simon */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Berikan Tugas Praktik Baru</h3>
                  <p className="text-xs text-slate-500 font-mono">Penugasan Modul KKA SMK</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tugas Praktikum *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktik 6: Logika Gerak & Simulasi Partikel"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Modul Simulasi *
                  </label>
                  <select
                    value={newTaskModuleId}
                    onChange={(e) => setNewTaskModuleId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  >
                    {MODULES_DATA.map((mod) => (
                      <option key={mod.id} value={mod.id}>
                        {mod.code}: {mod.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batas Waktu (Deadline) *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petunjuk &amp; Deskripsi Tugas
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan petunjuk apa yang harus dikerjakan siswa di Lab Koding (misal: jalankan modul, ubah variabel kecepatan, dan amati hasilnya)..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kriteria Penilaian &amp; Capaian Kompetensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kode kanvas berjalan lancar, 60 FPS, dan pengumpulan tepat waktu."
                  value={newTaskCriteria}
                  onChange={(e) => setNewTaskCriteria(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Penilaian Kecepatan Otomatis:</span> Siswa yang mengumpulkan tugas lebih dari 24 jam sebelum batas waktu akan otomatis mendapatkan rekomendasi nilai bonus kecepatan (+10 poin) saat masuk ke rekapitulasi nilai Guru.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreatingTask ? 'Menyimpan...' : 'Publikasikan Tugas ke Siswa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
