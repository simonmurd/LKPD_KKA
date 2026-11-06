/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tabel Ceklis Ketuntasan Siswa (Sesuai Tampilan Gambar 1 Siswa)
 * Format Resmi:
 * DAFTAR NILAI
 * PROGRAM KEAHLIAN TEKNIK KOMPUTER DAN JARINGAN
 * Mata Pelajaran : DASAR - DASAR KEJURUAN
 * Kelas          : X TJK (atau kelas siswa aktif)
 * GURU           : SIMON MURDANI YUSUF, S.ST
 * Update [HH:mm:ss]
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  buildClassGradeRows, 
  StudentGradeRow 
} from '../data/gradesSpreadsheetData';
import { 
  subscribeToClassSpreadsheetScores, 
  subscribeToAssignments, 
  subscribeToSubmissions 
} from '../firebase';
import { Assignment, StudentSubmission, INITIAL_ASSIGNMENTS } from '../data/assignmentsData';
import { Check, Clock, UserCheck, Eye, Sparkles, Filter, Download } from 'lucide-react';

interface StudentChecklistTableProps {
  onGoToTask?: (taskId: string) => void;
}

export const StudentChecklistTable: React.FC<StudentChecklistTableProps> = ({
  onGoToTask
}) => {
  const { currentStudent } = useAuth();
  const studentClass = currentStudent?.className || 'X TJK';

  const [customScoresMap, setCustomScoresMap] = useState<Record<string, number[]>>({});
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [allSubmissions, setAllSubmissions] = useState<StudentSubmission[]>([]);
  const [onlyMyRow, setOnlyMyRow] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Live Clock (Format: Update 07:55:49)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setCurrentTimeStr(`Update ${h}:${m}:${s}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Firestore subscriptions for scores, assignments, and submissions
  useEffect(() => {
    const unsubScores = subscribeToClassSpreadsheetScores(studentClass, (map) => {
      setCustomScoresMap(map);
    });

    const unsubAssignments = subscribeToAssignments((list) => {
      setAssignments(list);
    });

    const unsubSubs = subscribeToSubmissions((list) => {
      setAllSubmissions(list);
    });

    return () => {
      unsubScores();
      unsubAssignments();
      unsubSubs();
    };
  }, [studentClass]);

  // Build grade rows
  const gradeRows = useMemo(() => {
    return buildClassGradeRows(studentClass, customScoresMap, 11);
  }, [studentClass, customScoresMap]);

  // Set of submissions by studentId and assignmentId
  const submissionSet = useMemo(() => {
    const set = new Set<string>();
    allSubmissions.forEach(sub => {
      if (sub.status !== 'needs_revision') {
        set.add(`${sub.studentId}_${sub.assignmentId}`);
      }
    });
    return set;
  }, [allSubmissions]);

  // Current student grade row
  const myRow = useMemo(() => {
    if (!currentStudent) return null;
    return gradeRows.find(r => r.studentId === currentStudent.id || r.noAbsen === currentStudent.noAbsen);
  }, [gradeRows, currentStudent]);

  // Number of columns to display (columns 1 through 14 as seen in Image 1)
  const columnsCount = 14;

  return (
    <div className="rounded-3xl bg-white border border-slate-300 shadow-sm overflow-hidden font-sans">
      
      {/* Official Header matching Image 1 */}
      <div className="p-5 bg-white border-b border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
              DAFTAR NILAI
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-0.5">
              PROGRAM KEAHLIAN TEKNIK KOMPUTER DAN JARINGAN
            </h3>
            
            <div className="mt-2 space-y-0.5 text-xs font-mono text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-28 text-slate-500">Mata Pelajaran</span>
                <span>: <strong>DASAR - DASAR KEJURUAN</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 text-slate-500">Kelas</span>
                <span>: <strong className="text-indigo-700 font-bold">{studentClass}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-28 text-slate-500">GURU</span>
                <span>: <strong className="text-slate-900">SIMON MURDANI YUSUF, S.ST</strong></span>
              </div>
            </div>

            {/* Live Update Clock in Red font matching Image 1 */}
            <div className="mt-2 text-xs font-mono font-bold text-rose-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span>{currentTimeStr || 'Update Live'}</span>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-2 sm:self-start">
            <button
              onClick={() => setOnlyMyRow(!onlyMyRow)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 border cursor-pointer ${
                onlyMyRow
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{onlyMyRow ? 'Tampilkan Semua Siswa' : 'Fokus Baris Saya'}</span>
            </button>

            {myRow && (
              <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-mono">
                <span className="text-slate-500">Nilai Akhir Saya: </span>
                <span className={`font-black ${
                  myRow.totalScore > 0 
                    ? (myRow.na < 75 ? 'text-rose-600' : 'text-indigo-700') 
                    : 'text-slate-400'
                }`}>
                  {myRow.totalScore > 0 ? myRow.na : 'Belum Ada Nilai'}
                </span>
                {myRow.rank > 0 && <span className="text-slate-400 text-[10px] ml-1">(Rank #{myRow.rank})</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Container with exact grid lines */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-center text-xs border-collapse font-sans">
          <thead>
            {/* Main Header */}
            <tr className="bg-white text-slate-900 border-b border-black">
              <th rowSpan={2} className="py-2.5 px-2 border-r border-black w-10 font-black text-center">
                No
              </th>
              <th rowSpan={2} className="py-2.5 px-3 border-r-2 border-black text-left min-w-[200px] font-black">
                Nama
              </th>
              <th colSpan={columnsCount} className="py-2 px-2 border-r border-black font-black uppercase text-xs tracking-wider bg-slate-50">
                SUMATIF LINGKUP MATERI
              </th>
              <th rowSpan={2} className="py-2 px-3 border-l-2 border-black font-black w-14 text-center bg-slate-50">
                NA
              </th>
            </tr>

            {/* Sub Header (Numbers 1 through 14) */}
            <tr className="bg-slate-100 text-slate-800 text-[11px] font-bold font-mono border-b-2 border-black">
              {Array.from({ length: columnsCount }, (_, i) => (
                <th key={i} className="py-1.5 px-1 border-r border-black w-8 text-center font-black">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-black text-[11px]">
            {gradeRows
              .filter(r => !onlyMyRow || (currentStudent && (r.studentId === currentStudent.id || r.noAbsen === currentStudent.noAbsen)))
              .map((row, idx) => {
                const isCurrentStudent = currentStudent && (
                  row.studentId === currentStudent.id || 
                  row.noAbsen === currentStudent.noAbsen ||
                  row.name.toLowerCase().includes(currentStudent.name.toLowerCase())
                );
                const hasSubmissions = row.totalScore > 0;
                const isUnderKKM = hasSubmissions && row.na < 75;

                return (
                  <tr
                    key={row.studentId}
                    className={`border-b border-black transition ${
                      isCurrentStudent 
                        ? 'bg-blue-50/70 ring-2 ring-blue-600 ring-inset font-bold z-10' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* No */}
                    <td className="py-2 px-1 border-r border-black font-mono font-bold text-slate-600">
                      {idx + 1}
                    </td>

                    {/* Nama Siswa (e.g. 05 EVAN KRESNA LEE) */}
                    <td className={`py-2 px-3 border-r-2 border-black text-left whitespace-nowrap ${
                      isCurrentStudent ? 'text-blue-900 font-extrabold' : 'text-slate-800 font-medium'
                    }`}>
                      <span className="font-mono mr-1.5 text-slate-500">{row.noAbsen}</span>
                      <span>{row.name}</span>
                      {isCurrentStudent && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-mono font-bold uppercase">
                          Anda
                        </span>
                      )}
                    </td>

                    {/* Checkmark Columns 1 to 14 */}
                    {Array.from({ length: columnsCount }, (_, taskIdx) => {
                      const score = row.scores[taskIdx] || 0;
                      const formattedCode = `TUGAS-${String(taskIdx + 1).padStart(2, '0')}`;
                      const assign = assignments.find(a => 
                        a.taskIndex === taskIdx || 
                        a.code === formattedCode || 
                        a.code === `TUGAS-0${taskIdx + 1}`
                      );
                      const hasSub = assign && submissionSet.has(`${row.studentId}_${assign.id}`);
                      const isCompleted = score > 0 || hasSub;

                      return (
                        <td
                          key={taskIdx}
                          className="py-2 px-0.5 border-r border-black font-mono text-center select-none"
                        >
                          {isCompleted ? (
                            <span className="font-black text-slate-900 text-xs inline-block">
                              ✓
                            </span>
                          ) : (
                            <span className="text-transparent text-[10px]">&nbsp;</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Nilai Akhir (NA) with soft red #fca5a5 only if active student < 75 */}
                    <td className={`py-2 px-2 border-l-2 border-black font-mono font-black text-xs ${
                      !hasSubmissions 
                        ? 'bg-white text-slate-300 font-normal' 
                        : (isUnderKKM 
                            ? 'bg-[#fca5a5] text-rose-950 font-black' 
                            : 'bg-white text-slate-900 font-bold')
                    }`}>
                      {hasSubmissions ? row.na : '-'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#fca5a5] border border-rose-300 inline-block"></span>
          <span>Merah muda (<strong className="text-rose-900">NA &lt; 75</strong>): Belum mencapai batas tuntas KKM.</span>
        </div>
        <div className="text-[11px]">
          Tanda <strong className="text-slate-900 font-black">✓</strong> = Tugas telah selesai dikerjakan &bull; Kotak biru = Baris identitas Anda
        </div>
      </div>

    </div>
  );
};
