/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kartu Hasil Belajar & Rapor Capaian KKA Siswa (Kurikulum Merdeka SMK)
 * Memuat breakdown nilai, portofolio koding 24 modul, analisis kompetensi, dan cetak PDF/Print.
 */

import React from 'react';
import { Student } from '../data/studentsData';
import { StudentProgress } from '../context/AuthContext';
import { 
  X, 
  Printer, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Code2, 
  GraduationCap, 
  ShieldCheck,
  Calendar,
  User,
  School
} from 'lucide-react';

interface StudentReportCardModalProps {
  student: Student;
  progress?: StudentProgress;
  onClose: () => void;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  student,
  progress,
  onClose
}) => {
  const practicedModules = progress?.practicedModules || [];
  const moduleCount = practicedModules.length;
  const rawQuizScore = progress?.quizScore || 0;

  // Formula Perhitungan Nilai Rapor KKA SMK
  // 1. Nilai Praktik Koding (NPK): 40% (berdasarkan ketuntasan modul dan lab koding 24 modul)
  const npk = Math.min(100, Math.round((moduleCount / 24) * 100));
  
  // 2. Nilai Formatif CBT (NFC): 30% (kuis pemahaman modul)
  const nfc = rawQuizScore > 0 ? rawQuizScore : (moduleCount > 0 ? Math.min(95, 70 + moduleCount) : 0);
  
  // 3. Nilai Sumatif / Proyek Akhir (NSP): 30%
  const nsp = rawQuizScore > 0 ? Math.min(100, rawQuizScore + 2) : (moduleCount >= 12 ? 80 : 0);

  // Nilai Akhir (NA)
  const finalScore = (moduleCount === 0 && rawQuizScore === 0) 
    ? 0 
    : Math.round((npk * 0.4) + (nfc * 0.3) + (nsp * 0.3));

  const kkm = 75;
  const isPassed = finalScore >= kkm;

  let gradeLetter = 'D';
  let predicateLabel = 'Perlu Bimbingan Khusus';
  if (finalScore >= 90) {
    gradeLetter = 'A';
    predicateLabel = 'Sangat Baik (Istimewa)';
  } else if (finalScore >= 80) {
    gradeLetter = 'B';
    predicateLabel = 'Baik (Kompeten)';
  } else if (finalScore >= 75) {
    gradeLetter = 'C';
    predicateLabel = 'Cukup (Memenuhi KKM)';
  }

  // Capaian 4 Domain KKA
  const domain1Count = practicedModules.filter(m => m >= 1 && m <= 6).length;
  const domain2Count = practicedModules.filter(m => m >= 7 && m <= 12).length;
  const domain3Count = practicedModules.filter(m => m >= 13 && m <= 18).length;
  const domain4Count = practicedModules.filter(m => m >= 19 && m <= 24).length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Toolbar (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm tracking-wide">Kartu Hasil Belajar &amp; Rapor KKA Siswa</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Card Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0 print:overflow-visible">
          
          {/* Official School Header Kop */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative">
            <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
              PEMERINTAH PROVINSI KALIMANTAN BARAT &bull; DINAS PENDIDIKAN
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
              {student.school}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              KONSENTRASI KEAHLIAN TEKNIK JARINGAN KOMPUTER &amp; TELEKOMUNIKASI (TJKT) &amp; REKAYASA PERANGKAT LUNAK (RPL)
            </p>
            <div className="text-xs font-mono font-semibold text-indigo-700 mt-1 uppercase">
              LEMBAR PENILAIAN CAPAIAN PEMBELAJARAN KODING &amp; KECERDASAN ARTIFISIAL (KKA)
            </div>
          </div>

          {/* Student Biodata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-mono text-[10px] uppercase">Nama Lengkap Siswa</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.name}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono text-[10px] uppercase">Nomor Absen / NIS</div>
              <div className="font-bold font-mono text-indigo-700 text-sm mt-0.5">{student.noAbsen}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono text-[10px] uppercase">Rombel Kelas</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.className}</div>
            </div>
            <div>
              <div className="text-slate-400 font-mono text-[10px] uppercase">Tahun Ajaran / Semester</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">2026/2027 &bull; Ganjil</div>
            </div>
          </div>

          {/* Nilai Akhir & Predikat Highlight Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-semibold mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Hasil Asesmen Kurikulum Merdeka</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Status Ketuntasan: <span className={isPassed ? "text-emerald-400" : "text-rose-400"}>{isPassed ? "TUNTAS KOMPETEN" : "PERLU REMEDIAL"}</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
                Kriteria Ketuntasan Minimal (KKM) Mata Pelajaran KKA SMK Negeri 1 Singkawang adalah <span className="font-bold text-white font-mono">75.00</span>.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-center">
                <div className="text-[10px] font-mono text-slate-300 uppercase">Nilai Akhir (NA)</div>
                <div className="text-3xl font-black font-mono text-amber-400 mt-0.5">{finalScore}</div>
              </div>
              <div className="h-10 w-[1px] bg-white/20"></div>
              <div className="text-center">
                <div className="text-[10px] font-mono text-slate-300 uppercase">Predikat</div>
                <div className="text-3xl font-black font-mono text-white mt-0.5">{gradeLetter}</div>
              </div>
            </div>
          </div>

          {/* Breakdown Komponen Penilaian */}
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-600 uppercase tracking-wider mb-3">
              1. Rincian Komponen Penilaian KKA
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 font-mono uppercase">
                  <tr>
                    <th className="p-3 w-12 text-center">No</th>
                    <th className="p-3">Aspek Penilaian</th>
                    <th className="p-3 w-28 text-center">Bobot (%)</th>
                    <th className="p-3 w-28 text-center">Nilai Angka</th>
                    <th className="p-3 w-32 text-center">Nilai Tertimbang</th>
                    <th className="p-3 w-36 text-center">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-center font-mono font-bold text-slate-400">1</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">Praktik Koding &amp; Portofolio Modul</div>
                      <div className="text-[11px] text-slate-500">Penyelesaian {moduleCount} dari 24 Modul KKA Canvas 2D</div>
                    </td>
                    <td className="p-3 text-center font-mono">40%</td>
                    <td className="p-3 text-center font-mono font-bold">{npk}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-700">{(npk * 0.4).toFixed(1)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold">
                        {moduleCount >= 18 ? "Lengkap" : "Sedang Berjalan"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center font-mono font-bold text-slate-400">2</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">Formatif CBT &amp; Kuis Logika</div>
                      <div className="text-[11px] text-slate-500">Pemahaman konsep algoritma per topik modul</div>
                    </td>
                    <td className="p-3 text-center font-mono">30%</td>
                    <td className="p-3 text-center font-mono font-bold">{nfc}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-700">{(nfc * 0.3).toFixed(1)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${nfc >= kkm ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {nfc >= kkm ? "Tuntas" : "Remedial"}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-center font-mono font-bold text-slate-400">3</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">Sumatif Ujian Komprehensif &amp; Essay</div>
                      <div className="text-[11px] text-slate-500">Ujian 40 Soal Pilihan Ganda &amp; 10 Soal Essay Industri</div>
                    </td>
                    <td className="p-3 text-center font-mono">30%</td>
                    <td className="p-3 text-center font-mono font-bold">{nsp}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-700">{(nsp * 0.3).toFixed(1)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${nsp >= kkm ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {nsp >= kkm ? "Tuntas" : "Remedial"}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80 font-bold">
                    <td colSpan={2} className="p-3 text-right uppercase font-mono">Total Nilai Akhir (NA):</td>
                    <td className="p-3 text-center font-mono">100%</td>
                    <td className="p-3 text-center font-mono text-slate-400">-</td>
                    <td className="p-3 text-center font-mono text-base text-indigo-700">{finalScore}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {predicateLabel}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Penguasaan 4 Domain Kurikulum KKA */}
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-600 uppercase tracking-wider mb-3">
              2. Capaian Penguasaan 4 Domain Pembelajaran KKA SMK
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Domain 1: Fondasi &amp; Grafis</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{domain1Count} / 6 Modul</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(domain1Count / 6) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Domain 2: Simulasi &amp; Jaringan</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{domain2Count} / 6 Modul</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(domain2Count / 6) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Domain 3: Web App &amp; RPL</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{domain3Count} / 6 Modul</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(domain3Count / 6) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Domain 4: AI &amp; Machine Learning</div>
                <div className="text-sm font-bold text-slate-900 mt-1">{domain4Count} / 6 Modul</div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full" style={{ width: `${(domain4Count / 6) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi Capaian Kompetensi Kurikulum Merdeka */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
            <div className="font-bold text-indigo-950 font-mono text-[11px] uppercase mb-1">
              Deskripsi Capaian Kompetensi (Untuk Rapor Kurikulum Merdeka):
            </div>
            <p className="text-indigo-900 leading-relaxed">
              {isPassed ? (
                <>
                  Peserta didik <strong>{student.name}</strong> menunjukkan penguasaan yang <strong>{predicateLabel.toLowerCase()}</strong> dalam mengimplementasikan logika berpikir komputasional, manipulasi algoritma HTML5 Canvas 2D, pemodelan sistem jaringan TJKT, serta pemahaman dasar model kecerdasan artifisial (AI/ML). Mampu menyelesaikan {moduleCount} dari 24 modul praktikum dengan baik dan tuntas dalam ujian asesmen CBT.
                </>
              ) : (
                <>
                  Peserta didik <strong>{student.name}</strong> perlu pendampingan dan bimbingan lebih lanjut dalam penguasaan materi koding modular serta pemecahan masalah logika komputasional. Direkomendasikan mengikuti sesi pengayaan dan remedial pada modul dasar sebelum melanjutkan asesmen berikutnya.
                </>
              )}
            </p>
          </div>

          {/* Tanda Tangan Resmi Pengesahan */}
          <div className="grid grid-cols-2 pt-6 text-xs text-center border-t border-slate-200">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800">Orang Tua / Wali Siswa</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900">( ............................................ )</p>
            </div>
            <div>
              <p className="text-slate-500">Singkawang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold text-slate-800">Guru Pengampu Mata Pelajaran KKA</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 underline">SIMON MURD, S.Kom</p>
              <p className="text-[10px] font-mono text-slate-500">NIP. Guru Pengampu KKA SMK</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
