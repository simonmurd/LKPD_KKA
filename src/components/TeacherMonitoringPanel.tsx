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
  deleteAssignmentFromFirestore,
  subscribeToSubmissions, 
  gradeSubmissionInFirestore,
  requestRevisionInFirestore,
  sendChatMessageToFirestore,
  saveSpreadsheetScoreToFirestore
} from '../firebase';
import { StudentReportCardModal } from './StudentReportCardModal';
import { SpreadsheetGradebookTable } from './SpreadsheetGradebookTable';
import { Assignment, StudentSubmission, INITIAL_ASSIGNMENTS, getAssignmentTaskIndex } from '../data/assignmentsData';
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
  ChevronRight,
  Code2,
  Pencil,
  Trash2,
  Layers,
  FileText
} from 'lucide-react';

export type TeacherDashboardTab = 'leger' | 'assignments' | 'live_exams' | 'presence';

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

  // Assignment modal form state (Create & Edit)
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Assignment | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<'coding' | 'cbt'>('coding');
  const [newTaskModuleScope, setNewTaskModuleScope] = useState<'single' | 'all'>('single');
  const [newTaskModuleId, setNewTaskModuleId] = useState(1);
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCriteria, setNewTaskCriteria] = useState('');
  const [newTaskTargetClass, setNewTaskTargetClass] = useState('SEMUA KELAS');
  const [broadcastToChat, setBroadcastToChat] = useState(true);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Student code viewer & revision states
  const [viewingStudentCode, setViewingStudentCode] = useState<{ studentName: string; assignmentCode: string; code: string } | null>(null);
  const [revisionModalSub, setRevisionModalSub] = useState<StudentSubmission | null>(null);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

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

  // Buka modal pembuatan tugas baru
  const handleOpenCreateTaskModal = () => {
    setEditingAssignment(null);
    setNewTaskType('coding');
    setNewTaskModuleScope('single');
    setNewTaskModuleId(1);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskCriteria('');
    setNewTaskTargetClass('SEMUA KELAS');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setNewTaskDueDate(d.toISOString().split('T')[0]);
    setShowCreateTaskModal(true);
  };

  // Buka modal ubah / edit tugas yang sudah ada
  const handleOpenEditTaskModal = (task: Assignment) => {
    setEditingAssignment(task);
    setNewTaskType(task.taskType || 'coding');
    setNewTaskModuleScope(task.moduleScope || (task.moduleId === 0 ? 'all' : 'single'));
    setNewTaskModuleId(task.moduleId || 1);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setNewTaskCriteria(task.targetCriteria || '');
    setNewTaskTargetClass(task.targetClass || 'SEMUA KELAS');
    setNewTaskDueDate(task.dueDate);
    setShowCreateTaskModal(true);
  };

  // Guru menyimpan tugas (baik baru maupun ubah tugas lama) ke Firestore
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    const mod = MODULES_DATA.find((m) => m.id === Number(newTaskModuleId));
    const isSingle = newTaskModuleScope === 'single';

    const assignedModuleId = isSingle ? Number(newTaskModuleId) : 0;
    const assignedModuleCode = isSingle 
      ? (mod?.code || `MODUL-${String(newTaskModuleId).padStart(2, '0')}`) 
      : 'SEMUA-MODUL';

    if (editingAssignment) {
      // MODE EDIT TUGAS LAMA
      const taskIndex = getAssignmentTaskIndex(editingAssignment.code, editingAssignment.taskIndex);
      const updatedAssignment: Assignment = {
        ...editingAssignment,
        title: newTaskTitle.trim(),
        taskType: newTaskType,
        moduleScope: newTaskModuleScope,
        moduleId: assignedModuleId,
        moduleCode: assignedModuleCode,
        dueDate: newTaskDueDate,
        description: newTaskDescription.trim(),
        targetCriteria: newTaskCriteria.trim() || 'Penyelesaian tugas sesuai kriteria dan ketuntasan tepat waktu.',
        targetClass: newTaskTargetClass,
        taskIndex
      };

      try {
        await saveAssignmentToFirestore(updatedAssignment);
        setAssignments(prev => prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a));
        setShowCreateTaskModal(false);
        setEditingAssignment(null);
        setActionToast(`Tugas "${updatedAssignment.code}" berhasil diperbarui (Terkoneksi Kolom Tugas ${taskIndex + 1})!`);
        setTimeout(() => setActionToast(null), 3500);
      } catch (err) {
        console.error('Failed to update assignment:', err);
      } finally {
        setIsCreatingTask(false);
      }
    } else {
      // MODE BUAT TUGAS BARU
      const taskIdx = assignments.length < 20 ? assignments.length : 0;
      const nextCode = `TUGAS-${String(taskIdx + 1).padStart(2, '0')}`;
      const newId = `tugas-${Date.now().toString().slice(-6)}`;

      const newAssignment: Assignment = {
        id: newId,
        code: nextCode,
        title: newTaskTitle.trim(),
        taskType: newTaskType,
        moduleScope: newTaskModuleScope,
        taskIndex: taskIdx,
        description: newTaskDescription.trim() || (
          newTaskType === 'cbt'
            ? (newTaskModuleScope === 'all'
                ? 'Kerjakan 40 soal ujian CBT komprehensif mencakup materi 24 Modul KKA SMK.'
                : `Kerjakan soal kuis CBT khusus untuk Modul ${assignedModuleId} (${mod?.title || ''}) untuk menguji pemahaman Anda.`)
            : `Buka Lab Koding ${assignedModuleCode}. Jalankan kode simulasi dan kumpulkan snapshot kode Anda ke Pak Simon.`
        ),
        moduleId: assignedModuleId,
        moduleCode: assignedModuleCode,
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: newTaskDueDate,
        targetCriteria: newTaskCriteria.trim() || 'Pemahaman materi konsep KKA, pengerjaan tuntas, dan tepat waktu.',
        maxScore: 100,
        targetClass: newTaskTargetClass
      };

      try {
        await saveAssignmentToFirestore(newAssignment);
        setAssignments(prev => [newAssignment, ...prev.filter(a => a.id !== newAssignment.id)]);

        if (broadcastToChat) {
          try {
            await sendChatMessageToFirestore({
              id: `broadcast-${Date.now()}`,
              senderId: 'guru-simon',
              senderName: 'Simon Murd (Guru Mapel)',
              senderRole: 'GURU',
              senderClass: 'Pengampu KKA',
              recipientId: 'all',
              content: `📢 PENGUMUMAN TUGAS BARU: ${nextCode} - "${newAssignment.title}" (${newAssignment.moduleCode}) [${newTaskType === 'cbt' ? '📝 CBT' : '💻 Lab Koding'}] telah diterbitkan untuk ${newTaskTargetClass}. Batas pengumpulan: ${new Date(newTaskDueDate).toLocaleDateString('id-ID')}.`,
              timestamp: new Date().toISOString(),
              type: 'broadcast'
            });
          } catch (chatErr) {
            console.warn('Failed to broadcast task to chat:', chatErr);
          }
        }

        setShowCreateTaskModal(false);
        setActionToast(`Tugas baru "${newAssignment.title}" berhasil disimpan dan diterbitkan ke siswa!`);
        setTimeout(() => setActionToast(null), 4000);
      } catch (err) {
        console.error('Failed to create assignment:', err);
      } finally {
        setIsCreatingTask(false);
      }
    }
  };

  // Guru menghapus tugas dari Firestore
  const handleConfirmDeleteAssignment = async () => {
    if (!taskToDelete) return;
    try {
      await deleteAssignmentFromFirestore(taskToDelete.id);
      setAssignments(prev => prev.filter(a => a.id !== taskToDelete.id));
      setActionToast(`Tugas "${taskToDelete.code}: ${taskToDelete.title}" berhasil dihapus.`);
      setTaskToDelete(null);
      setTimeout(() => setActionToast(null), 3500);
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  // Guru menyimpan nilai dan umpan balik tugas siswa ke Firestore
  const handleSaveGrade = async (submissionId: string) => {
    const currentGrade = gradeInputMap[submissionId];
    const sub = submissions.find(s => s.id === submissionId);
    const score = currentGrade?.score !== undefined ? currentGrade.score : (sub?.score || 85);
    const feedback = currentGrade?.feedback !== undefined ? currentGrade.feedback : (sub?.teacherFeedback || 'Telah dinilai oleh Guru Simon Murdani Yusuf, S.ST');

    setIsSavingGradeMap(prev => ({ ...prev, [submissionId]: true }));
    try {
      await gradeSubmissionInFirestore(submissionId, score, feedback);

      // Sinkronkan langsung ke Kolom Tugas di Buku Leger Siswa
      if (sub) {
        const assign = assignments.find(a => a.id === sub.assignmentId);
        const taskIdx = getAssignmentTaskIndex(assign?.code || 'TUGAS-01', assign?.taskIndex);
        await saveSpreadsheetScoreToFirestore(sub.studentClass, sub.studentId, taskIdx, score);
      }

      setActionToast(`Nilai (${score}) untuk ${sub?.studentName || 'siswa'} berhasil disimpan dan diperbarui di Buku Leger!`);
      setTimeout(() => setActionToast(null), 3500);
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setIsSavingGradeMap(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  // Guru meminta siswa merevisi / mengulang pengerjaan kode
  const handleRequestRevision = async (submissionId: string, notes: string) => {
    setIsRequestingRevision(true);
    try {
      await requestRevisionInFirestore(submissionId, notes);
      setRevisionModalSub(null);
      setRevisionNotesInput('');
      setActionToast('Permintaan revisi kode berhasil dikirim ke siswa!');
      setTimeout(() => setActionToast(null), 3500);
    } catch (err) {
      console.error('Failed to request revision:', err);
    } finally {
      setIsRequestingRevision(false);
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
                <span>Portal Administrasi Guru KKA &bull; Simon Murdani Yusuf, S.ST</span>
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

      {/* Filter and Search Bar (shared across presence, assignments) */}
      {(activeTab === 'presence' || activeTab === 'assignments') && (
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
                onClick={handleOpenCreateTaskModal}
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

          {/* ================= PANEL DAFTAR TUGAS AKTIF GURU (MONITORING & EDIT TUGAS) ================= */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>Daftar Tugas Aktif Guru (Kelola, Pantau &amp; Ubah Tugas)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh penugasan praktikum dan ujian CBT yang telah Anda terbitkan. Anda dapat mengubah detail tugas, deadline, atau menghapus tugas sewaktu-waktu.
                </p>
              </div>
              <button
                onClick={handleOpenCreateTaskModal}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Buat Tugas Baru</span>
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 text-center w-12">No</th>
                    <th className="p-3.5 w-24">Kode</th>
                    <th className="p-3.5 w-64">Judul Tugas &amp; Deskripsi</th>
                    <th className="p-3.5 w-44">Tipe &amp; Cakupan Modul</th>
                    <th className="p-3.5 w-32">Target Rombel</th>
                    <th className="p-3.5 w-32">Tenggat Waktu</th>
                    <th className="p-3.5 w-36 text-center">Progres Terkumpul</th>
                    <th className="p-3.5 w-28 text-center">Aksi Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.map((task, idx) => {
                    const taskSubs = submissions.filter(s => s.assignmentId === task.id);
                    const gradedCount = taskSubs.filter(s => s.status === 'graded').length;
                    const targetTotal = task.targetClass === 'X TJK' ? 33 : task.targetClass === 'XI TJK' ? 35 : task.targetClass === 'XI TJKT' ? 38 : 106;
                    const isOverdue = new Date(task.dueDate + 'T23:59:59') < new Date();

                    return (
                      <tr key={task.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-indigo-600">{task.code}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{task.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{task.description}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              task.taskType === 'cbt'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {task.taskType === 'cbt' ? '📝 Kuis CBT' : '💻 Praktik Koding'}
                            </span>
                            <div className="text-[10px] font-mono text-slate-600">
                              {task.moduleScope === 'all' ? '📚 Seluruh 24 Modul' : `🎯 ${task.moduleCode}`}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200">
                            {task.targetClass || 'SEMUA KELAS'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {isOverdue ? 'Tenggat Terlewat' : 'Aktif'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="space-y-1">
                            <div className="text-xs font-mono font-bold text-slate-800">
                              {taskSubs.length} <span className="text-[10px] text-slate-400 font-normal">/ {targetTotal} Siswa</span>
                            </div>
                            <div className="w-24 mx-auto bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.round((taskSubs.length / targetTotal) * 100))}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              {gradedCount} dinilai
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditTaskModal(task)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition border border-indigo-200 flex items-center gap-1 font-semibold text-[11px]"
                              title="Ubah / Edit Tugas Ini"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Ubah</span>
                            </button>
                            <button
                              onClick={() => setTaskToDelete(task)}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition border border-rose-200"
                              title="Hapus Tugas Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              <span className="px-2 py-0.2 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 text-[10px] font-mono font-bold">
                                {assign?.moduleCode || 'MODUL'}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-mono font-bold">
                                Leger: Kolom {getAssignmentTaskIndex(assign?.code || 'TUGAS-01', assign?.taskIndex) + 1}
                              </span>
                              {sub.aiEvaluation?.isAiGraded && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-mono font-bold flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                                  <span>AI: {sub.score} ({sub.grade})</span>
                                </span>
                              )}
                            </div>
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
                            <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 max-h-24 overflow-y-auto leading-relaxed">
                              {sub.notes || 'Siswa mengumpulkan tanpa catatan tambahan.'}
                            </div>
                            {sub.submittedCode && (
                              <button
                                onClick={() => setViewingStudentCode({
                                  studentName: sub.studentName,
                                  assignmentCode: assign?.code || 'TUGAS',
                                  code: sub.submittedCode!
                                })}
                                className="mt-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center gap-1.5 border border-indigo-200 transition cursor-pointer"
                              >
                                <Code2 className="w-3 h-3 text-indigo-600" />
                                <span>Lihat Kode ({sub.submittedCode.length} karakter)</span>
                              </button>
                            )}
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

                            <button
                              onClick={() => {
                                setRevisionModalSub(sub);
                                setRevisionNotesInput(sub.teacherFeedback || 'Perlu perbaikan kode praktikum. Silakan periksa kembali dan kumpulkan ulang.');
                              }}
                              className="mt-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center gap-1 w-full transition cursor-pointer"
                              title="Minta siswa untuk memperbaiki kode (Remedial)"
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Minta Revisi</span>
                            </button>

                            {isGraded && (
                              <span className="inline-block mt-1 text-[10px] font-mono font-bold text-emerald-600">
                                &check; Tersimpan
                              </span>
                            )}
                            {sub.status === 'needs_revision' && (
                              <span className="inline-block mt-1 text-[9px] font-mono font-bold text-amber-600">
                                ⚠️ Perlu Revisi Siswa
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
        <SpreadsheetGradebookTable initialClass={filterClass === 'SEMUA KELAS' ? 'X TJK' : filterClass} />
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

      {/* Modal Berikan / Ubah Tugas oleh Guru Simon */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  {editingAssignment ? (
                    <Pencil className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <FileCheck className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingAssignment ? `Ubah / Edit Tugas: ${editingAssignment.code}` : 'Berikan Tugas Praktik / CBT Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingAssignment ? 'Perbarui detail dan tenggat tugas aktif' : 'Penugasan Modul KKA SMK untuk Siswa'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setEditingAssignment(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              {/* Judul Tugas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Praktik 2: Efisiensi Kode Modular atau Kuis CBT Modul 2"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Tipe Tugas: Praktik Koding vs Ujian CBT */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jenis Tugas / Asesmen *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskType('coding');
                      if (!newTaskTitle || newTaskTitle.startsWith('Kuis CBT')) {
                        const mod = MODULES_DATA.find(m => m.id === newTaskModuleId);
                        setNewTaskTitle(`Praktik ${newTaskModuleId}: ${mod?.title || ''}`);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      newTaskType === 'coding'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Code2 className={`w-4 h-4 ${newTaskType === 'coding' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">Praktik Koding</div>
                      <div className="text-[10px] text-slate-500">Lab &amp; Kanvas Interaktif</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskType('cbt');
                      if (!newTaskTitle || newTaskTitle.startsWith('Praktik')) {
                        const mod = MODULES_DATA.find(m => m.id === newTaskModuleId);
                        setNewTaskTitle(newTaskModuleScope === 'all' 
                          ? 'Ujian CBT Komprehensif: Seluruh 24 Modul KKA' 
                          : `Kuis CBT: Modul ${newTaskModuleId} - ${mod?.title || ''}`);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      newTaskType === 'cbt'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${newTaskType === 'cbt' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">Ujian / Kuis CBT</div>
                      <div className="text-[10px] text-slate-500">Soal Pilihan Ganda &amp; Nilai</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cakupan Modul: Per Part / Modul Tertentu vs Seluruh Modul */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cakupan Modul Pembelajaran *
                </label>
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <button
                    type="button"
                    onClick={() => setNewTaskModuleScope('single')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      newTaskModuleScope === 'single'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Per Part / Modul Tertentu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTaskModuleScope('all');
                      if (newTaskType === 'cbt') {
                        setNewTaskTitle('Ujian CBT Komprehensif: Seluruh 24 Modul KKA');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                      newTaskModuleScope === 'all'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Seluruh Modul (1-24)</span>
                  </button>
                </div>

                {newTaskModuleScope === 'single' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Pilih Modul Spesifik:
                    </label>
                    <select
                      value={newTaskModuleId}
                      onChange={(e) => {
                        const mId = Number(e.target.value);
                        setNewTaskModuleId(mId);
                        const m = MODULES_DATA.find(x => x.id === mId);
                        if (!editingAssignment) {
                          if (newTaskType === 'cbt') {
                            setNewTaskTitle(`Kuis CBT: Modul ${mId} - ${m?.title || ''}`);
                          } else {
                            setNewTaskTitle(`Praktik ${mId}: ${m?.title || ''}`);
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium font-mono"
                    >
                      {MODULES_DATA.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.code}: {mod.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Deadline & Target Rombel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batas Waktu (Deadline) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Rombel / Kelas Siswa *
                  </label>
                  <select
                    value={newTaskTargetClass}
                    onChange={(e) => setNewTaskTargetClass(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium font-mono"
                  >
                    <option value="SEMUA KELAS">Semua Kelas (106 Siswa: X TJK, XI TJK, XI TJKT)</option>
                    <option value="X TJK">X TJK (SMK Negeri 1 Singkawang - 33 Siswa)</option>
                    <option value="XI TJK">XI TJK (SMK Negeri 1 Singkawang - 35 Siswa)</option>
                    <option value="XI TJKT">XI TJKT (SMK Mudita Singkawang - 38 Siswa)</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi & Petunjuk Tugas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petunjuk &amp; Deskripsi Tugas
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan petunjuk pengerjaan (misal: jalankan koding kanvas, perhatikan variabel kecepatan, atau selesaikan kuis CBT hingga selesai)..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium leading-relaxed"
                />
              </div>

              {/* Kriteria Penilaian */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kriteria Penilaian &amp; Capaian Kompetensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kode kanvas berjalan lancar tanpa error, atau skor CBT mencapai &ge; 75."
                  value={newTaskCriteria}
                  onChange={(e) => setNewTaskCriteria(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium"
                />
              </div>

              {/* Siarkan ke Live Chat (hanya pada pembuatan baru) */}
              {!editingAssignment && (
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer p-3 bg-indigo-50/70 rounded-xl border border-indigo-200/80">
                  <input
                    type="checkbox"
                    checked={broadcastToChat}
                    onChange={(e) => setBroadcastToChat(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span>📢 Siarkan Pengumuman Tugas Otomatis ke Ruang Live Chat</span>
                </label>
              )}

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Penilaian Kecepatan Otomatis:</span> Siswa yang mengumpulkan tugas lebih dari 24 jam sebelum batas waktu akan otomatis mendapatkan rekomendasi nilai bonus kecepatan (+10 poin) saat masuk ke rekapitulasi nilai Guru.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateTaskModal(false);
                    setEditingAssignment(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {editingAssignment ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isCreatingTask ? 'Menyimpan...' : 'Simpan Perubahan Tugas'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingTask ? 'Menerbitkan...' : 'Publikasikan Tugas ke Siswa'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Tugas */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-base">Hapus Tugas Ini?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus tugas <strong className="text-slate-800 font-mono">{taskToDelete.code}</strong> - <strong className="text-slate-800">"{taskToDelete.title}"</strong>?
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
                Tugas akan dihapus dari Cloud Firestore dan tidak lagi muncul di dashboard siswa.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAssignment}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Tugas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Kode Siswa Langsung */}
      {viewingStudentCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Kodingan Siswa: {viewingStudentCode.studentName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{viewingStudentCode.assignmentCode} &bull; Kode Kanvas Terkumpul</p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudentCode(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
                <span>Bahasa: JavaScript / HTML5 Canvas 2D</span>
                <span>{viewingStudentCode.code.length} Karakter</span>
              </div>
              <div className="flex-1 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl overflow-y-auto border border-slate-800 leading-relaxed scrollbar-thin">
                <pre>{viewingStudentCode.code}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setViewingStudentCode(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Minta Revisi Kode Siswa (Remedial) */}
      {revisionModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Minta Revisi Kode Siswa</h3>
                  <p className="text-xs text-slate-500 font-mono">{revisionModalSub.studentName} ({revisionModalSub.studentClass})</p>
                </div>
              </div>
              <button
                onClick={() => setRevisionModalSub(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Siswa akan menerima pemberitahuan status <strong>"Perlu Revisi"</strong> di dashboard mereka dan diizinkan memperbaiki kodingan di Lab Koding untuk dikumpulkan kembali.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan / Petunjuk Perbaikan dari Guru:
              </label>
              <textarea
                rows={3}
                value={revisionNotesInput}
                onChange={(e) => setRevisionNotesInput(e.target.value)}
                placeholder="Misal: Perbaiki perulangan for-loop objek agar tidak tumpang tindih..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRevisionModalSub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleRequestRevision(revisionModalSub.id, revisionNotesInput)}
                disabled={isRequestingRevision}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isRequestingRevision ? 'Mengirim...' : 'Kirim Permintaan Revisi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
