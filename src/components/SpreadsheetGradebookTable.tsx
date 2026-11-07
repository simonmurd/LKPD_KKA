/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tabel Rekapitulasi Nilai 20 Tugas & Peringkat Guru (Sesuai Spreadsheet Pak Simon)
 * Berdasarkan Format Resmi:
 * GURU: SIMON MURDANI YUSUF, S.ST
 * Mata Pelajaran: DASAR - DASAR KEJURUAN
 * Program Keahlian: TEKNIK KOMPUTER DAN JARINGAN
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CLASS_OPTIONS, Student } from '../data/studentsData';
import { 
  buildClassGradeRows, 
  StudentGradeRow, 
  RAW_X_TJK_SCORES 
} from '../data/gradesSpreadsheetData';
import { 
  saveSpreadsheetScoreToFirestore, 
  subscribeToClassSpreadsheetScores 
} from '../firebase';
import { 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Edit3, 
  Save, 
  X, 
  Trophy, 
  Sparkles,
  Info
} from 'lucide-react';

interface SpreadsheetGradebookTableProps {
  initialClass?: string;
}

export const SpreadsheetGradebookTable: React.FC<SpreadsheetGradebookTableProps> = ({
  initialClass = 'X TJK'
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [customScoresMap, setCustomScoresMap] = useState<Record<string, number[]>>({});
  const [copiedTSV, setCopiedTSV] = useState(false);
  
  // Inline edit score state
  const [editingCell, setEditingCell] = useState<{
    studentId: string;
    studentName: string;
    taskIndex: number;
    score: number;
  } | null>(null);
  const [inputScore, setInputScore] = useState<string>('85');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Subscribe to real-time scores override for the selected class from Firestore
  useEffect(() => {
    const unsub = subscribeToClassSpreadsheetScores(selectedClass, (map) => {
      setCustomScoresMap(map);
    });
    return () => unsub();
  }, [selectedClass]);

  // Build grade rows and calculate ranking
  const gradeRows = useMemo(() => {
    return buildClassGradeRows(selectedClass, customScoresMap, 11);
  }, [selectedClass, customScoresMap]);

  // Statistics: Hanya hitung siswa yang sudah mengumpulkan nilai tugas (> 0)
  const totalStudents = gradeRows.length;
  const submittedStudents = gradeRows.filter(r => r.totalScore > 0);
  const submittedCount = submittedStudents.length;
  const passedCount = gradeRows.filter(r => r.isPassed).length;
  const failedCount = submittedStudents.filter(r => !r.isPassed).length;
  const averageNA = submittedCount > 0 
    ? (submittedStudents.reduce((acc, r) => acc + r.na, 0) / submittedCount).toFixed(1) 
    : '-';

  // Demo buttons: Muat contoh atau kosongkan kembali
  const handleLoadDemoData = () => {
    const demoMap: Record<string, number[]> = {};
    gradeRows.forEach((r, idx) => {
      if (idx < RAW_X_TJK_SCORES.length) {
        demoMap[r.studentId] = [...RAW_X_TJK_SCORES[idx]];
      }
    });
    setCustomScoresMap(demoMap);
    setToastMsg('Contoh 33 data nilai telah dimuat untuk keperluan demonstrasi.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleClearAllScores = () => {
    setCustomScoresMap({});
    setToastMsg('Tabel nilai dikosongkan (0). Nilai akan masuk otomatis saat siswa mengumpulkan tugas.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle cell click to edit score
  const handleCellClick = (row: StudentGradeRow, taskIdx: number) => {
    const currentVal = row.scores[taskIdx] || 0;
    setEditingCell({
      studentId: row.studentId,
      studentName: row.name,
      taskIndex: taskIdx,
      score: currentVal
    });
    setInputScore(String(currentVal || 85));
  };

  // Save edited score
  const handleSaveScore = async () => {
    if (!editingCell) return;
    const num = Math.min(100, Math.max(0, parseInt(inputScore, 10) || 0));

    // Update local state immediately
    setCustomScoresMap(prev => {
      const studentScores = [...(prev[editingCell.studentId] || Array(20).fill(0))];
      while (studentScores.length < 20) studentScores.push(0);
      studentScores[editingCell.taskIndex] = num;
      return {
        ...prev,
        [editingCell.studentId]: studentScores
      };
    });

    try {
      await saveSpreadsheetScoreToFirestore(selectedClass, editingCell.studentId, editingCell.taskIndex, num);
      setToastMsg(`Nilai Tugas ${editingCell.taskIndex + 1} (${num}) untuk ${editingCell.studentName} tersimpan.`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save score to Firestore:', err);
    }

    setEditingCell(null);
  };

  // Copy TSV for Google Sheets / Excel
  const handleCopyTSV = () => {
    let tsv = `DAFTAR NILAI - PROGRAM KEAHLIAN TEKNIK KOMPUTER DAN JARINGAN\n`;
    tsv += `Mata Pelajaran: DASAR - DASAR KEJURUAN\n`;
    tsv += `Kelas: ${selectedClass}\n`;
    tsv += `GURU: SIMON MURDANI YUSUF, S.ST\n\n`;

    // Headers
    const taskHeaders = Array.from({ length: 20 }, (_, i) => String(i + 1)).join('\t');
    tsv += `NO\tNAMA SISWA\t${taskHeaders}\tNilai Total\tNILAI\tRank\n`;

    // Rows
    gradeRows.forEach((r, idx) => {
      const scoresStr = r.scores.map(s => s > 0 ? s : '-').join('\t');
      tsv += `${idx + 1}\t${r.noAbsen} ${r.name}\t${scoresStr}\t${r.totalScore > 0 ? r.totalScore : '-'}\t${r.totalScore > 0 ? r.na : '-'}\t${r.rank > 0 ? r.rank : '-'}\n`;
    });

    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedTSV(true);
      setTimeout(() => setCopiedTSV(false), 3000);
    });
  };

  // Print sheet
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="p-0.5 hover:bg-emerald-700 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Info & Action Controls */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold border border-indigo-200">
              Format Rekap Guru: 20 Tugas &amp; Peringkat
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Guru: <strong>SIMON MURDANI YUSUF, S.ST</strong>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
            Daftar Nilai Siswa &bull; Program Keahlian TKJ
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mata Pelajaran: <strong>DASAR - DASAR KEJURUAN</strong> &bull; Klik sel nilai untuk mengedit skor secara real-time.
          </p>
        </div>

        {/* Action Buttons & Class Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 font-mono pl-1">Kelas:</span>
            {['X TJK', 'XI TJK', 'XI TJKT', 'XII TJKT'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                  selectedClass === cls
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Quick Demo & Reset Controls */}
          {submittedCount === 0 ? (
            <button
              onClick={handleLoadDemoData}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition border border-amber-200 cursor-pointer"
              title="Isi contoh data 33 siswa untuk melihat simulasi tampilan penuh"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Muat Contoh Demo</span>
            </button>
          ) : (
            <button
              onClick={handleClearAllScores}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
              title="Kosongkan kembali nilai ke kondisi awal sebelum siswa mengumpulkan"
            >
              <X className="w-3.5 h-3.5" />
              <span>Kosongkan Tabel (0)</span>
            </button>
          )}

          {/* Copy to TSV */}
          <button
            onClick={handleCopyTSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition border border-slate-200 cursor-pointer"
            title="Salin seluruh tabel dalam format TSV untuk paste ke Google Sheets atau Excel"
          >
            {copiedTSV ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedTSV ? 'Disalin!' : 'Salin ke Sheets'}</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition border border-indigo-200 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Total Siswa {selectedClass}</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{totalStudents} Siswa</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Siswa Dinilai / Masuk</div>
          <div className="text-xl font-bold font-mono text-indigo-600 mt-0.5">{submittedCount} Siswa</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Rata-rata: {averageNA} / 100</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-emerald-600 font-mono">Tuntas (&ge; 75)</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{passedCount} Siswa</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-rose-500 font-mono">Perlu Remedial (&lt; 75)</div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-0.5">{failedCount} Siswa</div>
        </div>
      </div>

      {/* Official Sheet Table Container (Styled like Google Sheets / Excel) */}
      <div className="rounded-2xl bg-white border border-slate-300 shadow-sm overflow-hidden">
        {/* Printable Official Header */}
        <div className="p-4 bg-[#f8fafc] border-b border-slate-300">
          <div className="text-center font-sans">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
              DAFTAR NILAI
            </h2>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-0.5">
              PROGRAM KEAHLIAN TEKNIK KOMPUTER DAN JARINGAN
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-600 mt-1.5">
              <span>Mata Pelajaran: <strong>DASAR - DASAR KEJURUAN</strong></span>
              <span>&bull;</span>
              <span>Kelas: <strong>{selectedClass}</strong></span>
              <span>&bull;</span>
              <span>GURU: <strong>SIMON MURDANI YUSUF, S.ST</strong></span>
            </div>
          </div>
        </div>

        {/* Horizontal Scrollable Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-center text-xs border-collapse font-sans">
            {/* Header Level 1 */}
            <thead>
              <tr className="bg-[#cbd5e1] text-slate-800 text-[11px] font-bold uppercase border-b border-slate-400">
                <th colSpan={2} className="py-2.5 px-3 border-r border-slate-400 bg-[#94a3b8]/40 text-slate-900">
                  DATA SISWA
                </th>
                <th colSpan={20} className="py-2.5 px-3 border-r border-slate-400 bg-[#cbd5e1] text-slate-800">
                  TUGAS / LINGKUP MATERI (1 - 20)
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-400 bg-[#94a3b8]/30 font-bold text-slate-900 w-20 whitespace-nowrap">
                  Nilai Total
                </th>
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-400 bg-[#94a3b8]/40 font-black text-slate-900 w-16 whitespace-nowrap">
                  NILAI (NA)
                </th>
                <th rowSpan={2} className="py-2 px-2 border-slate-400 bg-[#94a3b8]/30 font-bold text-slate-900 w-14">
                  Rank
                </th>
              </tr>

              {/* Header Level 2: Sub-columns */}
              <tr className="bg-[#e2e8f0] text-[10px] font-bold font-mono text-slate-700 border-b-2 border-slate-400">
                <th className="py-2 px-2.5 border-r border-slate-300 w-10 text-center">NO</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left min-w-[220px]">NAMA SISWA</th>
                {Array.from({ length: 20 }, (_, idx) => (
                  <th key={idx} className="py-2 px-1 border-r border-slate-300 w-9 text-center font-bold">
                    {idx + 1}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {gradeRows.map((row, idx) => {
                const hasScore = row.totalScore > 0;
                const isUnderKKM = hasScore && row.na < 75;

                return (
                  <tr 
                    key={row.studentId}
                    className="hover:bg-indigo-50/40 transition border-b border-slate-200"
                  >
                    {/* No */}
                    <td className="py-2 px-2 border-r border-slate-200 font-mono text-slate-500 font-bold bg-slate-50/50">
                      {idx + 1}
                    </td>

                    {/* Nama Siswa */}
                    <td className="py-2 px-3 border-r border-slate-300 text-left font-bold text-slate-800 whitespace-nowrap bg-white">
                      <span className="font-mono text-indigo-700 mr-1.5">{row.noAbsen}</span>
                      <span>{row.name}</span>
                    </td>

                    {/* 20 Task Scores */}
                    {row.scores.map((score, taskIdx) => {
                      const isZero = score === 0;

                      return (
                        <td
                          key={taskIdx}
                          onClick={() => handleCellClick(row, taskIdx)}
                          className={`py-2 px-1 border-r border-slate-200 font-mono text-[11px] cursor-pointer select-none transition ${
                            isZero 
                              ? 'text-slate-300 hover:bg-indigo-100 hover:text-slate-700' 
                              : 'text-slate-900 font-bold bg-indigo-50/30 hover:bg-indigo-100'
                          }`}
                          title={`Tugas ${taskIdx + 1}: ${score > 0 ? `${score} poin` : 'Belum dikerjakan'}. Klik untuk isi/ubah.`}
                        >
                          {score > 0 ? score : '-'}
                        </td>
                      );
                    })}

                    {/* Nilai Total */}
                    <td className="py-2 px-2.5 border-r border-slate-300 font-mono font-bold text-slate-900 bg-slate-50">
                      {hasScore ? row.totalScore : <span className="text-slate-300">-</span>}
                    </td>

                    {/* NILAI (NA) */}
                    <td className={`py-2 px-2 border-r border-slate-300 font-mono font-black text-xs ${
                      !hasScore 
                        ? 'bg-slate-50 text-slate-300 font-normal' 
                        : (isUnderKKM 
                            ? 'bg-[#fca5a5] text-rose-950 font-black' 
                            : 'bg-emerald-50 text-emerald-950 font-bold')
                    }`}>
                      {hasScore ? row.na : '-'}
                    </td>

                    {/* Rank */}
                    <td className="py-2 px-1.5 border-slate-200 font-mono font-bold text-slate-700 bg-slate-50">
                      {row.rank > 0 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] ${
                          row.rank === 1 ? 'bg-amber-100 text-amber-800 font-black border border-amber-300' :
                          row.rank === 2 ? 'bg-slate-200 text-slate-800 font-black border border-slate-300' :
                          row.rank === 3 ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' :
                          'text-slate-600'
                        }`}>
                          {row.rank}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-indigo-600" />
            <span>Keterangan Nilai: Warna merah (<span className="bg-[#fca5a5] px-1 py-0.2 rounded text-rose-950 font-bold">NA &lt; 75</span>) menandakan siswa belum tuntas / memerlukan remedial.</span>
          </div>
          <div>
            Divisor Tugas Aktif: <strong>11 Tugas</strong> &bull; Total Kapasitas: <strong>20 Tugas</strong>
          </div>
        </div>
      </div>

      {/* Modal Quick Edit Nilai */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs font-mono">
                <Edit3 className="w-4 h-4" />
                <span>INPUT / UBAH NILAI TUGAS</span>
              </div>
              <button onClick={() => setEditingCell(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-500 font-mono">Siswa:</div>
              <div className="text-sm font-bold text-slate-900">{editingCell.studentName}</div>
              <div className="text-xs text-indigo-600 font-mono font-semibold">Tugas Nomor {editingCell.taskIndex + 1}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nilai Siswa (0 - 100):
              </label>
              <input
                type="number"
                min={0}
                max={100}
                autoFocus
                value={inputScore}
                onChange={(e) => setInputScore(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveScore();
                  if (e.key === 'Escape') setEditingCell(null);
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-600 text-center"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingCell(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveScore}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Nilai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
