/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Data Rekapitulasi Nilai & Ceklis Sumatif Lingkup Materi
 * Berdasarkan Format Resmi Spreadsheet Guru Pengampu:
 * SIMON MURDANI YUSUF, S.ST
 * Mata Pelajaran: DASAR - DASAR KEJURUAN
 * Program Keahlian: TEKNIK KOMPUTER DAN JARINGAN
 */

import { STUDENTS_DATA, Student } from './studentsData';

export interface StudentGradeRow {
  studentId: string;
  noAbsen: string;
  name: string;
  className: string;
  scores: number[]; // 20 task scores
  totalScore: number;
  na: number; // Nilai Akhir
  rank: number;
  isPassed: boolean;
}

// 33 Data Nilai Siswa X TJK Sesuai Spreadsheet Asli Pak Simon Murdani Yusuf, S.ST
export const RAW_X_TJK_SCORES: number[][] = [
  // 01 ALVINO
  [65, 0, 86, 84, 90, 86, 0, 84, 86, 90, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 02 DEBORA RATU GIASTA GULTOM
  [65, 88, 84, 90, 86, 84, 92, 86, 84, 86, 82, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 03 DENIS
  [73, 84, 0, 86, 80, 84, 92, 82, 82, 80, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 04 DEO REVALDY AHMAD
  [0, 0, 80, 80, 80, 86, 0, 88, 92, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 05 EVAN KRESNA LEE
  [75, 86, 92, 86, 84, 92, 86, 92, 84, 84, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 06 FEBRIYANTO
  [0, 0, 82, 82, 90, 80, 0, 84, 88, 90, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 07 HERKULANUS PERDY
  [75, 86, 90, 84, 82, 90, 0, 84, 84, 82, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 08 HIQMAL LIONEL ALVIANO
  [75, 86, 84, 82, 92, 92, 92, 0, 88, 92, 86, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 09 INDRA KESUMAH
  [73, 92, 84, 92, 84, 92, 92, 92, 92, 84, 82, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 10 JERRY KURNIAWAN
  [75, 90, 88, 84, 75, 90, 0, 90, 0, 75, 82, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 11 KABILA SYIFA
  [73, 90, 90, 86, 75, 92, 82, 80, 92, 0, 75, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 12 KEYLA KIRANA PUTRI
  [71, 84, 92, 90, 0, 84, 92, 92, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 13 KRISTIAN DAFI
  [65, 84, 0, 80, 80, 82, 0, 82, 80, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 14 LIONEL VAN EXAUDI HUTABARAT
  [73, 92, 92, 88, 92, 90, 0, 0, 80, 92, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 15 MIRATUL TASYA RAMADHANI
  [73, 82, 86, 90, 90, 80, 0, 90, 82, 90, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 16 MUHAMMAD RAYHAN AL GHIFARY
  [73, 92, 92, 92, 80, 92, 92, 84, 92, 80, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 17 MUHAMMAD ZAKY RAFANANDO
  [65, 84, 92, 84, 82, 88, 92, 90, 84, 82, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 18 NATARI KEYZA JUNIAR
  [71, 90, 82, 92, 92, 75, 0, 92, 92, 92, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 19 NAZUA KASTINA
  [73, 88, 86, 90, 88, 80, 92, 92, 90, 88, 80, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 20 NUR AZANI
  [71, 92, 88, 84, 92, 84, 86, 82, 92, 86, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 21 NURAINI
  [73, 0, 92, 92, 88, 82, 92, 92, 84, 88, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 22 PIRANDA RAMADANI
  [0, 0, 80, 80, 0, 92, 92, 84, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 23 REBHELIA
  [73, 88, 92, 88, 88, 92, 92, 88, 92, 88, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 24 REVAN
  [65, 92, 80, 86, 86, 80, 92, 92, 84, 86, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 25 RIA ADHA
  [65, 0, 84, 92, 75, 0, 0, 0, 0, 75, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 26 RINDU PRANITA NUARI
  [65, 0, 75, 82, 75, 82, 0, 92, 80, 75, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 27 RIVALDO RANGGA SAPUTRA
  [75, 90, 90, 92, 90, 90, 92, 86, 90, 90, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 28 SELVIA
  [65, 84, 75, 80, 82, 84, 92, 0, 90, 82, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 29 SITI MARIYAM
  [71, 84, 90, 84, 84, 86, 92, 82, 86, 84, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 30 SYIFA FAHIRA
  [65, 92, 84, 92, 80, 88, 92, 84, 84, 80, 84, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 31 WULANDARI
  [75, 92, 92, 92, 84, 88, 92, 92, 86, 84, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 32 YULIANTI
  [71, 92, 80, 88, 86, 86, 92, 90, 86, 86, 90, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  // 33 YUNKHI
  [65, 86, 0, 75, 86, 92, 92, 88, 92, 86, 88, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Helper kalkulasi baris nilai dan ranking (Mulai Kosong, Otomatis Terisi Saat Siswa Mengerjakan)
export function buildClassGradeRows(
  className: string, 
  customScoresMap?: Record<string, number[]>,
  activeTasksEvaluatedCount: number = 11
): StudentGradeRow[] {
  const students = STUDENTS_DATA.filter(s => s.className === className);

  const rawRows = students.map((student) => {
    let scores: number[];
    if (customScoresMap && customScoresMap[student.id]) {
      scores = [...customScoresMap[student.id]];
    } else {
      // Default: Tabel KOSONG (0) karena siswa baru akan mengerjakan tugas
      scores = Array(20).fill(0);
    }

    // Pastikan tepat 20 kolom tugas
    while (scores.length < 20) scores.push(0);

    const totalScore = scores.reduce((sum, val) => sum + val, 0);
    const divisor = Math.max(1, activeTasksEvaluatedCount);
    // Hanya hitung NA jika ada nilai tugas yang masuk (> 0)
    const na = totalScore > 0 ? Math.round(totalScore / divisor) : 0;
    const isPassed = totalScore > 0 && na >= 75;

    return {
      studentId: student.id,
      noAbsen: student.noAbsen,
      name: student.name,
      className: student.className,
      scores,
      totalScore,
      na,
      rank: 0, // dihitung di bawah untuk siswa yang sudah mengumpulkan
      isPassed
    };
  });

  // Kalkulasi ranking kompetisi HANYA untuk siswa yang sudah mengerjakan (totalScore > 0)
  const submittedRows = rawRows
    .filter(r => r.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);
    
  const rankMap = new Map<string, number>();
  submittedRows.forEach((item, index) => {
    if (index > 0 && item.totalScore === submittedRows[index - 1].totalScore) {
      rankMap.set(item.studentId, rankMap.get(submittedRows[index - 1].studentId)!);
    } else {
      rankMap.set(item.studentId, index + 1);
    }
  });

  return rawRows.map(row => ({
    ...row,
    rank: rankMap.get(row.studentId) || 0
  }));
}
