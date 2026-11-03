import React, { useState } from 'react';
import { MODULES_DATA } from '../data/modulesData';
import { BANK_SOAL_DATA, QuestionType } from '../data/bankSoalData';
import { 
  generateModulesTSV, 
  generateQuestionsTSV, 
  generateCSV, 
  downloadFile 
} from '../services/sheetsSyncService';
import { 
  Table2, 
  Copy, 
  Download, 
  Check, 
  Search, 
  ExternalLink, 
  FileSpreadsheet,
  HelpCircle
} from 'lucide-react';

export const SheetsTableViewer: React.FC = () => {
  const [activeSheetTab, setActiveSheetTab] = useState<'modul' | 'soal'>('modul');
  const [copiedSuccess, setCopiedSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<QuestionType | 'ALL'>('ALL');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('ALL');

  const handleCopyTSV = (sheetName: 'Modul_Materi' | 'Bank_Soal') => {
    let tsvContent = '';
    if (sheetName === 'Modul_Materi') {
      tsvContent = generateModulesTSV();
    } else {
      tsvContent = generateQuestionsTSV();
    }

    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedSuccess(sheetName);
      setTimeout(() => setCopiedSuccess(null), 3000);
    });
  };

  const handleDownloadCSV = (sheetName: 'Modul_Materi' | 'Bank_Soal') => {
    if (sheetName === 'Modul_Materi') {
      const headers = [
        "No", "Kode_Modul", "Judul_Modul", "Kelompok_Domain", "Kategori_Teknis",
        "Fokus_Utama", "Intisari_Materi_SMK", "Logika_Koding_Utama", "Proyek_Hasil_Praktik", "Link_Simulasi"
      ];
      const rows = MODULES_DATA.map((m) => [
        m.id, m.code, m.title, m.groupLabel, m.domainCategory,
        m.focus, m.smkSummary, m.codingLogic.join(" | "), m.projectResult,
        new URL(m.assetFile, window.location.href).href
      ]);
      const csv = generateCSV(headers, rows);
      downloadFile(csv, "Modul_Materi_KKA_SMK.csv");
    } else {
      const headers = [
        "No", "Kode_Modul", "Topik_Materi", "Tipe_Soal", "Kompetensi_SMK",
        "Butir_Pertanyaan", "Pilihan_Opsi", "Kunci_Jawaban", "Pembahasan_Teknis", "Cuplikan_Kode_JS"
      ];
      const rows = BANK_SOAL_DATA.map((q) => [
        q.id, q.moduleCode, q.topic, q.type, q.smkCompetency,
        q.question, q.options ? q.options.join(" | ") : "-", q.correctAnswer,
        q.explanation, q.codingSnippet || "-"
      ]);
      const csv = generateCSV(headers, rows);
      downloadFile(csv, "Bank_Soal_KKA_SMK.csv");
    }
  };

  const filteredModules = MODULES_DATA.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.domainCategory.toLowerCase().includes(q) ||
      m.focus.toLowerCase().includes(q) ||
      m.smkSummary.toLowerCase().includes(q)
    );
  });

  const filteredQuestions = BANK_SOAL_DATA.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesModule = selectedModuleFilter === 'ALL' || item.moduleCode === selectedModuleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.topic.toLowerCase().includes(q) ||
      item.moduleCode.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.smkCompetency.toLowerCase().includes(q);

    return matchesType && matchesModule && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3 font-mono">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Format Google Sheets Siap Tempel (1-Click Paste)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Data Tabel <span className="text-indigo-600">Modul_Materi</span> & <span className="text-amber-600">Bank_Soal</span>
            </h2>
            <p className="text-sm text-slate-500 max-w-2xl mt-1 leading-relaxed">
              Seluruh ringkasan 24 modul dan 72 butir soal latihan diformat rapi sesuai struktur kolom Google Sheets Anda.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleCopyTSV(activeSheetTab === 'modul' ? 'Modul_Materi' : 'Bank_Soal')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Format TSV Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Tab {activeSheetTab === 'modul' ? 'Modul_Materi' : 'Bank_Soal'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadCSV(activeSheetTab === 'modul' ? 'Modul_Materi' : 'Bank_Soal')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-2 border border-slate-300 transition"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>💡 Cara Tempel ke Google Sheets:</strong> Klik tombol <em>"Salin Tab"</em> di atas, lalu buka lembar kerja Google Sheets Anda pada tab <code>{activeSheetTab === 'modul' ? 'Modul_Materi' : 'Bank_Soal'}</code>, klik sel <strong>A1</strong>, dan tekan <strong>Ctrl + V</strong>.
          </span>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
          <button
            onClick={() => setActiveSheetTab('modul')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSheetTab === 'modul'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Tab: Modul_Materi (24 Baris)</span>
          </button>

          <button
            onClick={() => setActiveSheetTab('soal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeSheetTab === 'soal'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>Tab: Bank_Soal (72 Baris)</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {activeSheetTab === 'soal' && (
            <>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Semua Tipe Soal (54)</option>
                <option value="PG Biasa">PG Biasa (18)</option>
                <option value="PG Kompleks">PG Kompleks (18)</option>
                <option value="Essay">Essay Koding (18)</option>
              </select>

              <select
                value={selectedModuleFilter}
                onChange={(e) => setSelectedModuleFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Semua Modul</option>
                {MODULES_DATA.map((m) => (
                  <option key={m.id} value={m.code}>
                    {m.code}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari di tabel..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* TABLE 1: MODUL_MATERI */}
      {activeSheetTab === 'modul' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 w-24">Kode</th>
                  <th className="p-3.5 w-56">Judul Modul</th>
                  <th className="p-3.5 w-44">Kelompok Domain</th>
                  <th className="p-3.5 w-64">Intisari Materi SMK</th>
                  <th className="p-3.5 w-72">Logika Koding Utama</th>
                  <th className="p-3.5 w-52">Proyek Hasil</th>
                  <th className="p-3.5 w-28 text-center">Simulasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">{m.id}</td>
                    <td className="p-3.5 font-mono font-semibold text-indigo-600 whitespace-nowrap">{m.code}</td>
                    <td className="p-3.5 font-bold text-slate-900 leading-snug">{m.title}</td>
                    <td className="p-3.5 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                        {m.groupLabel}
                      </span>
                    </td>
                    <td className="p-3.5 leading-relaxed text-slate-600">{m.smkSummary}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-600">
                      <ul className="list-disc pl-3.5 space-y-1">
                        {m.codingLogic.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3.5 text-emerald-800 font-medium">{m.projectResult}</td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <a
                        href={m.assetFile}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition"
                      >
                        <span>Jalankan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right pr-4">
            Total {filteredModules.length} Modul Terdata
          </div>
        </div>
      )}

      {/* TABLE 2: BANK_SOAL */}
      {activeSheetTab === 'soal' && (
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5 w-24">Kode</th>
                  <th className="p-3.5 w-28">Tipe Soal</th>
                  <th className="p-3.5 w-40">Topik</th>
                  <th className="p-3.5 w-48">Kompetensi SMK</th>
                  <th className="p-3.5 w-80">Butir Pertanyaan</th>
                  <th className="p-3.5 w-72">Opsi / Solusi Kode</th>
                  <th className="p-3.5 w-32 font-bold text-center text-emerald-700">Kunci</th>
                  <th className="p-3.5 w-72">Pembahasan Teknis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-center font-mono font-bold text-slate-400">{q.id}</td>
                    <td className="p-3.5 font-mono font-semibold text-indigo-600 whitespace-nowrap">{q.moduleCode}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                        q.type === 'PG Biasa'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : q.type === 'PG Kompleks'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {q.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{q.topic}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">{q.smkCompetency}</td>
                    <td className="p-3.5 text-slate-700 leading-relaxed font-sans">{q.question}</td>
                    <td className="p-3.5 text-[11px] text-slate-600">
                      {q.options && q.options.length > 0 ? (
                        <div className="space-y-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className="leading-snug">{opt}</div>
                          ))}
                        </div>
                      ) : q.codingSnippet ? (
                        <pre className="p-2 rounded-lg bg-slate-900 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                          {q.codingSnippet}
                        </pre>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-700 font-mono bg-emerald-50/50 whitespace-nowrap">
                      {q.correctAnswer}
                    </td>
                    <td className="p-3.5 text-slate-600 leading-relaxed text-[11px]">{q.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right pr-4">
            Total {filteredQuestions.length} Soal Latihan Terdata
          </div>
        </div>
      )}

    </div>
  );
};
