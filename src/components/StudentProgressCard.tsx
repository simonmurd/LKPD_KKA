/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dashboard Siswa KKA SMK
 * Fitur Utama Sesuai Permintaan Guru:
 * 1. 📋 Tabel 1: Daftar Tugas yang Diberikan Guru, Status Pengerjaan, dan Nilai Siswa.
 * 2. ✅ Tabel 2: Tabel Ceklis Ketuntasan Tugas (Khusus Berisi Centang Saja).
 * 3. 🚀 Tombol Kerjakan Simulasi & Kirim Tugas dengan Penilaian Kecepatan Otomatis + Nilai Guru.
 * 4. 📚 Lembar Kemajuan 24 Modul Pembelajaran.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { MODULES_DATA } from '../data/modulesData';
import { Assignment, StudentSubmission, INITIAL_ASSIGNMENTS } from '../data/assignmentsData';
import { StudentChecklistTable } from './StudentChecklistTable';
import { processAiGradingAndSaveToLeger, AiEvaluationResult } from '../services/aiGradingService';
import { 
  subscribeToAssignments, 
  subscribeToStudentSubmissions, 
  submitAssignmentToFirestore 
} from '../firebase';
import { 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Code2, 
  Award,
  ArrowRight,
  Send,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  Check,
  X,
  Sparkles,
  Zap,
  GraduationCap
} from 'lucide-react';

interface StudentProgressCardProps {
  onContinueLearning: () => void;
  onGoToQuiz: () => void;
  onLaunchModule?: (moduleId: number) => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  onContinueLearning,
  onGoToQuiz,
  onLaunchModule,
}) => {
  const { currentStudent, studentProgressMap } = useAuth();
  
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [viewingSubmittedCode, setViewingSubmittedCode] = useState<{ title: string; code: string } | null>(null);
  const [table2Mode, setTable2Mode] = useState<'spreadsheet' | 'detail'>('spreadsheet');
  const [aiGradingResult, setAiGradingResult] = useState<{ evaluation: AiEvaluationResult; taskCode: string; taskTitle: string } | null>(null);

  // Subscribe to assignments & student's submissions from Cloud Firestore
  useEffect(() => {
    if (!currentStudent) return;

    const unsubAssign = subscribeToAssignments((list) => {
      setAssignments(list);
    });

    const unsubSub = subscribeToStudentSubmissions(currentStudent.id, (list) => {
      setSubmissions(list);
    });

    return () => {
      unsubAssign();
      unsubSub();
    };
  }, [currentStudent]);

  if (!currentStudent) return null;

  const progress = studentProgressMap[currentStudent.id] || {
    practicedModules: [1],
    quizScore: 0,
    quizTotal: 0,
    lastActive: new Date().toISOString(),
  };

  const practicedCount = progress.practicedModules.length;
  const progressPercent = Math.min(100, Math.round((practicedCount / 24) * 100));

  // Map submission by assignmentId
  const submissionMap = useMemo(() => {
    const map = new Map<string, StudentSubmission>();
    submissions.forEach((s) => map.set(s.assignmentId, s));
    return map;
  }, [submissions]);

  // Filter tugas yang relevan dengan kelas siswa
  const relevantAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (!a.targetClass || a.targetClass === 'SEMUA KELAS') return true;
      return a.targetClass === currentStudent.className;
    });
  }, [assignments, currentStudent.className]);

  // Hitung berapa tugas yang sudah tuntas (tidak berstatus needs_revision)
  const completedAssignmentsCount = useMemo(() => {
    return relevantAssignments.filter((a) => {
      const sub = submissionMap.get(a.id);
      return sub && sub.status !== 'needs_revision';
    }).length;
  }, [relevantAssignments, submissionMap]);

  const assignmentPercent = relevantAssignments.length > 0
    ? Math.round((completedAssignmentsCount / relevantAssignments.length) * 100)
    : 0;

  // Kalkulasi sisa waktu dan bonus kecepatan
  const getDeadlineStatus = (dueDateStr: string) => {
    const now = new Date();
    const dueDate = new Date(dueDateStr + 'T23:59:59');
    const diffMs = dueDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    if (diffMs < 0) {
      return {
        label: 'Lewat Batas Waktu',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        speedBonus: 'Terlambat',
        isOverdue: true
      };
    } else if (diffDays > 1) {
      return {
        label: `Sisa ${diffDays} hari lagi`,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        speedBonus: '+10 Poin Cepat ⚡',
        isOverdue: false
      };
    } else {
      return {
        label: `Tenggat Hari Ini (${Math.max(1, Math.round(diffHours))} jam lagi)`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        speedBonus: '+5 Poin Cepat ⏱',
        isOverdue: false
      };
    }
  };

  // Handle student submit task
  const handleOpenSubmitModal = (assignment: Assignment) => {
    setSubmittingAssignment(assignment);
    const existing = submissionMap.get(assignment.id);
    setStudentNotes(existing?.notes || `Sudah selesai mengerjakan dan mencoba simulasi koding ${assignment.moduleCode}, Pak.`);
  };

  const handleConfirmSubmit = async () => {
    if (!submittingAssignment || !currentStudent) return;

    setIsSending(true);
    const now = new Date();

    try {
      // 1. Asesor AI menilai tugas secara otomatis
      // 2. Nilai otomatis langsung dimasukkan ke Kolom Tugas di Buku Leger Siswa!
      const { evaluation } = await processAiGradingAndSaveToLeger(
        submittingAssignment,
        currentStudent,
        '',
        studentNotes,
        now.toISOString()
      );

      setSubmittingAssignment(null);
      setAiGradingResult({
        evaluation,
        taskCode: submittingAssignment.code,
        taskTitle: submittingAssignment.title
      });
      setNotification(`🤖 Tugas ${submittingAssignment.code} dinilai otomatis oleh AI (Skor: ${evaluation.score}, Predikat: ${evaluation.grade}) dan otomatis masuk ke Kolom Tugas ${evaluation.taskIndex + 1} Buku Leger!`);
      setTimeout(() => setNotification(null), 8000);
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:bg-emerald-700 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Student Welcome Hero */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-mono font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              {currentStudent.noAbsen}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold">
                  Siswa: {currentStudent.className}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentStudent.school}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                {currentStudent.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Dashboard Pembelajaran Mandiri &amp; Lembar Penugasan KKA SMK.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onContinueLearning}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Buka Lab Koding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Ketuntasan Tugas Guru */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider font-mono">Tugas dari Guru</span>
            <FileCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {completedAssignmentsCount} <span className="text-xs text-slate-500 font-normal">/ {relevantAssignments.length} Selesai</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${assignmentPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-emerald-600 font-mono block text-right font-bold">
            {assignmentPercent}% Tugas Dicentang
          </span>
        </div>

        {/* Modul Dipelajari */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider font-mono">Modul Praktikum</span>
            <BookOpen className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {practicedCount} <span className="text-xs text-slate-500 font-normal">/ 24 Modul</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-cyan-600 font-mono block text-right font-bold">
            {progressPercent}% Kurikulum KKA
          </span>
        </div>

        {/* Skor CBT */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider font-mono">Nilai Ujian CBT</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {progress.quizScore}{' '}
            <span className="text-xs text-slate-500 font-normal">
              {progress.quizTotal > 0 ? `/ ${progress.quizTotal}` : 'Poin'}
            </span>
          </div>
          <button
            onClick={onGoToQuiz}
            className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-1"
          >
            <span>Buka Ujian CBT (40 PG + Essay)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* ================= TABEL 1: DAFTAR TUGAS, STATUS & NILAI DARI GURU ================= */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Tabel 1: Tugas &amp; Simulasi yang Diberikan Guru (Status &amp; Nilai)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar tugas praktikum yang ditugaskan oleh Guru Pengampu (Simon Murdani Yusuf, S.ST) beserta tenggat waktu dan nilai akhir.
            </p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 font-mono font-bold px-3 py-1 rounded-full w-fit">
            {completedAssignmentsCount} dari {relevantAssignments.length} Tugas Selesai
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5 w-32">Kode Tugas</th>
                <th className="p-3.5 w-64">Nama Tugas &amp; Petunjuk</th>
                <th className="p-3.5 w-28">Target Modul</th>
                <th className="p-3.5 w-32">Batas Waktu</th>
                <th className="p-3.5 w-36 text-center">Status Pengerjaan</th>
                <th className="p-3.5 w-36 text-center">Nilai dari Guru</th>
                <th className="p-3.5 w-44 text-center">Aksi Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relevantAssignments.map((task, idx) => {
                const sub = submissionMap.get(task.id);
                const isSubmitted = sub !== undefined;
                const score = sub?.score || 0;
                const deadline = getDeadlineStatus(task.dueDate);

                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-indigo-600">{task.code}</div>
                      {task.targetClass && task.targetClass !== 'SEMUA KELAS' && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-mono font-bold">
                          {task.targetClass}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{task.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{task.description}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                          task.taskType === 'cbt' 
                            ? 'bg-amber-50 text-amber-800 border-amber-200' 
                            : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        }`}>
                          {task.taskType === 'cbt' ? '📝 CBT' : '💻 Koding'}
                        </span>
                        <div className="font-mono text-[10px] text-slate-700 font-bold">
                          {task.moduleScope === 'all' ? '24 Modul' : task.moduleCode}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(task.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${deadline.badgeClass}`}>
                        <span>{deadline.label}</span>
                        {deadline.speedBonus && !deadline.isOverdue && (
                          <span className="text-[9px] text-indigo-700 font-semibold">{deadline.speedBonus}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {sub?.status === 'needs_revision' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3 text-amber-700" /> Perlu Revisi
                          </span>
                          {sub.teacherFeedback && (
                            <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200 max-w-[150px] leading-tight text-left mx-auto">
                              <strong>Catatan Guru:</strong> {sub.teacherFeedback}
                            </div>
                          )}
                        </div>
                      ) : isSubmitted ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sub?.status === 'graded' 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <Check className="w-3 h-3" /> {sub?.status === 'graded' ? 'Dinilai Guru' : 'Sudah Dikirim'}
                          </span>
                          {sub?.speedCategory && (
                            <div className="text-[9px] text-emerald-600 font-mono">{sub.speedCategory}</div>
                          )}
                          {sub?.submittedCode && (
                            <button
                              onClick={() => setViewingSubmittedCode({ title: task.title, code: sub.submittedCode! })}
                              className="mt-1 text-[10px] text-indigo-600 hover:text-indigo-800 underline font-mono flex items-center gap-1 mx-auto"
                            >
                              <Code2 className="w-3 h-3" />
                              <span>Lihat Kode Terkirim</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" /> Belum Dikirim
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {isSubmitted && score > 0 ? (
                        <div>
                          <span className="text-base font-extrabold text-indigo-700">{score}</span>
                          <span className="text-slate-400 text-xs"> / 100</span>
                          <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            score >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {sub?.grade || 'B'}
                          </span>
                          {sub?.teacherFeedback && sub?.status !== 'needs_revision' && (
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5 max-w-[130px] truncate mx-auto" title={sub.teacherFeedback}>
                              {sub.teacherFeedback}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Jalankan Simulasi atau CBT */}
                        {task.taskType === 'cbt' ? (
                          <button
                            onClick={onGoToQuiz}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] flex items-center gap-1 transition border border-amber-200"
                            title={task.moduleScope === 'all' ? 'Buka Ujian CBT Komprehensif' : `Buka CBT Modul ${task.moduleId}`}
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                            <span>{task.moduleScope === 'all' ? 'Ujian CBT' : `CBT Modul ${task.moduleId}`}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (onLaunchModule) onLaunchModule(task.moduleId || 1);
                              else onContinueLearning();
                            }}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition border ${
                              sub?.status === 'needs_revision'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 font-bold shadow-xs animate-pulse'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                            }`}
                            title="Buka Lab Koding Modul ini"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{sub?.status === 'needs_revision' ? 'Perbaiki di Lab' : 'Simulasi'}</span>
                          </button>
                        )}

                        {/* Tombol Kirim Tugas */}
                        <button
                          onClick={() => handleOpenSubmitModal(task)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs ${
                            sub?.status === 'needs_revision'
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : isSubmitted
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{sub?.status === 'needs_revision' ? 'Kirim Ulang' : isSubmitted ? 'Edit Kiriman' : 'Kirim Tugas'}</span>
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

      {/* ================= TABEL 2: LEMBAR CEKLIS KETUNTASAN SISWA (SESUAI GAMBAR 1) ================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tabel 2: Lembar Ceklis Tugas Siswa (Ceklis Ketuntasan &amp; Nilai Akhir)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Format resmi rekapitulasi ceklis tugas siswa (Gambar 1). Centang (✓) menandakan tugas selesai dikerjakan.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setTable2Mode('spreadsheet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                table2Mode === 'spreadsheet'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 Format Tabel Ceklis (Gambar 1)
            </button>
            <button
              onClick={() => setTable2Mode('detail')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                table2Mode === 'detail'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📝 Rincian Tugas Saya
            </button>
          </div>
        </div>

        {table2Mode === 'spreadsheet' ? (
          <StudentChecklistTable />
        ) : (
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 font-mono">
                  Rincian Ceklis Status per Tugas ({currentStudent.name})
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Setiap tugas yang Anda kirimkan ke Pak Simon akan langsung tercentang otomatis di sistem.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black border border-emerald-300">&check;</span>
                  <span>Sudah Selesai</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center text-xs">&ndash;</span>
                  <span>Belum Selesai</span>
                </span>
              </div>
            </div>

        {/* Quick Checkmark Ribbon */}
        <div className="px-5 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono shrink-0">
            Ceklis Cepat:
          </span>
          <div className="flex items-center gap-2">
            {relevantAssignments.map((task) => {
              const sub = submissionMap.get(task.id);
              const done = !!sub && sub.status !== 'needs_revision';
              const isRevision = sub?.status === 'needs_revision';

              return (
                <div
                  key={task.id}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0 border transition ${
                    isRevision
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : done
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <span>{task.code}</span>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isRevision
                      ? 'bg-amber-500 text-white'
                      : done
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isRevision ? '!' : done ? '✓' : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5 w-32">Kode Tugas</th>
                <th className="p-3.5 w-80">Uraian Tugas / Praktik KKA</th>
                <th className="p-3.5 w-36 text-center">Modul Simulasi</th>
                <th className="p-3.5 w-36 text-center font-black text-emerald-700">Centang (✓)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {relevantAssignments.map((task, idx) => {
                const sub = submissionMap.get(task.id);
                const isCompleted = !!sub;

                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{task.code}</td>
                    <td className="p-3.5 font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {task.taskType === 'cbt' ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold font-mono shrink-0">CBT</span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800 font-bold font-mono shrink-0">LAB</span>
                        )}
                        <span>{task.title}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[11px] text-slate-700 font-semibold border border-slate-200">
                        {task.moduleScope === 'all' ? '24 Modul' : task.moduleCode}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {isCompleted && sub?.status === 'needs_revision' ? (
                        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs shadow-xs" title="Perlu Revisi">
                          ⚠️ Revisi
                        </div>
                      ) : isCompleted ? (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-lg shadow-xs" title="Tugas Selesai (Dicentang)">
                          ✓
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-300 font-bold text-base" title="Belum Selesai">
                          —
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>

      {/* Modules Checklist 24 Modul */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Lembar Kemajuan 24 Modul Mandiri
          </h3>
          <span className="text-xs text-slate-500 font-mono font-bold">
            {practicedCount} dari 24 Modul
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MODULES_DATA.map((mod) => {
            const isCompleted = progress.practicedModules.includes(mod.id);

            return (
              <div
                key={mod.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mod.id}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-slate-800 truncate">
                    {mod.shortTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {mod.domainCategory}
                  </div>
                </div>

                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Kirim Tugas */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-mono font-bold text-xs">
                <Send className="w-4 h-4" />
                <span>PENGUMPULAN TUGAS PRAKTIK</span>
              </div>
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                {submittingAssignment.code} &bull; {submittingAssignment.moduleCode}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {submittingAssignment.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {submittingAssignment.description}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Sistem Penilaian Kecepatan &amp; Ketepatan:</span>
              </div>
              <p className="text-amber-800 leading-relaxed text-[11px]">
                Tenggat waktu: <strong>{new Date(submittingAssignment.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Mengumpulkan lebih awal sebelum deadline memberikan bonus kecepatan otomatis (+10 Poin) ke dalam buku nilai guru!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Catatan Hasil Pengerjaan / Laporan Siswa:
              </label>
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                rows={3}
                placeholder="Tuliskan catatan singkat mengenai hasil simulasi koding Anda..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmittingAssignment(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Mengirim...' : 'Kirim Tugas ke Guru'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Kode Terkirim */}
      {viewingSubmittedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Code2 className="w-4 h-4" />
                <span>KODE PROGRAM YANG DIKIRIMKAN SISWA</span>
              </div>
              <button
                onClick={() => setViewingSubmittedCode(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-sans">Tugas Praktikum:</div>
              <div className="text-sm font-bold text-slate-200 font-sans">{viewingSubmittedCode.title}</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto max-h-80 text-xs text-emerald-400 font-mono scrollbar-thin">
              <pre>{viewingSubmittedCode.code}</pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingSubmittedCode(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans transition"
              >
                Tutup Kode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hasil Penilaian Otomatis AI Gemini */}
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
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
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
                <strong>Otomatis Tercatat:</strong> Nilai <strong>{aiGradingResult.evaluation.score}</strong> telah masuk ke <strong>Kolom Tugas {aiGradingResult.evaluation.taskIndex + 1}</strong> pada Buku Leger Guru &amp; Tabel Ceklis Anda!
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setAiGradingResult(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Tutup &amp; Lihat di Tabel Ceklis
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
