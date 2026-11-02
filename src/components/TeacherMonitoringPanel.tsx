import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDENTS_DATA, SCHOOL_OPTIONS, CLASS_OPTIONS } from '../data/studentsData';
import { generateCSV, downloadFile } from '../services/sheetsSyncService';
import { 
  Search, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const TeacherMonitoringPanel: React.FC = () => {
  const { studentProgressMap } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSchool, setFilterSchool] = useState<string>('SEMUA SEKOLAH');
  const [filterClass, setFilterClass] = useState<string>('SEMUA KELAS');
  const [copiedTSV, setCopiedTSV] = useState(false);

  const filteredStudents = STUDENTS_DATA.filter((s) => {
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

  const totalStudents = STUDENTS_DATA.length;
  const activeStudentsCount = Object.keys(studentProgressMap).length;
  
  const handleCopyRekapTSV = () => {
    const headers = [
      "No",
      "No_Absen",
      "Nama_Siswa",
      "Kelas",
      "Sekolah",
      "Jumlah_Modul_Selesai",
      "Daftar_Modul",
      "Skor_Kuis_Tertinggi",
      "Terakhir_Aktif"
    ];

    const rows = STUDENTS_DATA.map((s, idx) => {
      const p = studentProgressMap[s.id] || {
        practicedModules: [],
        quizScore: 0,
        lastActive: "-"
      };

      return [
        (idx + 1).toString(),
        s.noAbsen,
        s.name,
        s.className,
        s.school,
        p.practicedModules.length.toString(),
        p.practicedModules.length > 0 ? p.practicedModules.join(",") : "-",
        p.quizScore.toString(),
        p.lastActive !== "-" ? new Date(p.lastActive).toLocaleDateString() : "-"
      ];
    });

    const tsv = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedTSV(true);
      setTimeout(() => setCopiedTSV(false), 3000);
    });
  };

  const handleDownloadRekapCSV = () => {
    const headers = [
      "No", "No_Absen", "Nama_Siswa", "Kelas", "Sekolah",
      "Jumlah_Modul_Selesai", "Daftar_Modul", "Skor_Kuis_Tertinggi", "Terakhir_Aktif"
    ];

    const rows = STUDENTS_DATA.map((s, idx) => {
      const p = studentProgressMap[s.id] || {
        practicedModules: [],
        quizScore: 0,
        lastActive: "-"
      };

      return [
        idx + 1,
        s.noAbsen,
        s.name,
        s.className,
        s.school,
        p.practicedModules.length,
        p.practicedModules.length > 0 ? p.practicedModules.join(";") : "-",
        p.quizScore,
        p.lastActive !== "-" ? new Date(p.lastActive).toLocaleDateString() : "-"
      ];
    });

    const csv = generateCSV(headers, rows);
    downloadFile(csv, "Rekap_Nilai_Siswa_KKA.csv");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Teacher Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Dashboard Administrasi Guru (Pengampu KKA)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Monitoring Progres & <span className="text-indigo-600">Rekap Nilai Siswa</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Memantau aktivitas belajar, kemajuan modul, dan pencapaian kuis seluruh 106 siswa dari SMK Negeri 1 Singkawang dan SMK Mudita Singkawang.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyRekapTSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              {copiedTSV ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedTSV ? 'Rekap TSV Tersalin!' : 'Salin Rekap untuk Google Sheets'}</span>
            </button>

            <button
              onClick={handleDownloadRekapCSV}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-300 transition"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Total Siswa Terdata</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">SMKN 1 & Mudita</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Rombel Kelas</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">3 Kelas</div>
          <div className="text-[11px] text-slate-400 mt-0.5">X TJK, XI TJK, XI TJKT</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Siswa Aktif Belajar</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{activeStudentsCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Tercatat di sistem</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="text-xs text-slate-500 uppercase font-semibold">Kurikulum KKA</div>
          <div className="text-2xl font-bold font-mono text-violet-600 mt-1">18 Modul</div>
          <div className="text-[11px] text-slate-400 mt-0.5">360 Tugas & 54 Soal</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        
        <div className="flex flex-wrap items-center gap-2">
          {/* School Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Sekolah:</span>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
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
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {CLASS_OPTIONS.map((cl, idx) => (
                <option key={idx} value={cl}>{cl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa atau absen..."
            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-56"
          />
        </div>

      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12">No</th>
                <th className="p-3.5 w-16 text-center">Absen</th>
                <th className="p-3.5 w-64">Nama Siswa</th>
                <th className="p-3.5 w-24 text-center">Kelas</th>
                <th className="p-3.5 w-64">Sekolah</th>
                <th className="p-3.5 w-40 text-center">Modul Selesai</th>
                <th className="p-3.5 w-32 text-center">Skor Kuis</th>
                <th className="p-3.5 w-36 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const prog = studentProgressMap[s.id];
                const practicedCount = prog ? prog.practicedModules.length : 0;
                const score = prog ? prog.quizScore : 0;
                const isOnline = prog !== undefined;

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-indigo-600">{s.noAbsen}</td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">{s.name}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-indigo-700 font-semibold border border-slate-200">
                        {s.className}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{s.school}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                      {practicedCount} / 24
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-600">
                      {score > 0 ? `${score} Poin` : '-'}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                          Belum Mulai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between px-4">
          <span>Menampilkan {filteredStudents.length} siswa</span>
          <span>Format siap disinkronkan ke Google Sheets tab Rekap_Nilai</span>
        </div>
      </div>

    </div>
  );
};
