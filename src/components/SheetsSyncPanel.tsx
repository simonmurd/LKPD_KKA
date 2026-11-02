import React, { useState } from 'react';
import { 
  DEFAULT_WEBHOOK_URL, 
  DEFAULT_API_KEY, 
  sendToGoogleSheets, 
  buildSyncPayload,
  RECOMMENDED_APPS_SCRIPT_CODE,
  SyncResult
} from '../services/sheetsSyncService';
import { 
  Send, 
  Key, 
  Link, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export const SheetsSyncPanel: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState(DEFAULT_WEBHOOK_URL);
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY);
  const [isLoading, setIsLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<Array<{
    timestamp: string;
    action: string;
    result: SyncResult;
  }>>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  const handleExecuteSync = async (action: 'sync_all' | 'sync_modules' | 'sync_questions') => {
    setIsLoading(true);
    const result = await sendToGoogleSheets(webhookUrl, apiKey, action);
    setIsLoading(false);

    setSyncLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        action: action === 'sync_all' ? 'Sinkronisasi Lengkap (Semua Tab)' : action === 'sync_modules' ? 'Kirim Modul_Materi' : 'Kirim Bank_Soal',
        result,
      },
      ...prev,
    ]);
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(RECOMMENDED_APPS_SCRIPT_CODE).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    });
  };

  const payloadPreview = buildSyncPayload('sync_all', apiKey);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner (White Minimalist) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Google Apps Script Endpoint Automation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
            Integrasi Pengiriman Otomatis ke <span className="text-indigo-600">Google Sheets</span>
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Kirim data terstruktur 24 Modul KKA dan 72 Bank Soal secara otomatis ke Google Spreadsheet Anda melalui endpoint webhook Google Apps Script dengan otorisasi API Key resmi.
          </p>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Actions */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Link className="w-4 h-4 text-indigo-600" /> Konfigurasi Webhook & API Key
            </h3>
            <button
              onClick={() => {
                setWebhookUrl(DEFAULT_WEBHOOK_URL);
                setApiKey(DEFAULT_API_KEY);
              }}
              className="text-xs text-indigo-600 hover:underline transition"
              title="Kembalikan ke URL & Key Bawaan Anda"
            >
              Reset ke Default
            </button>
          </div>

          {/* Webhook URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Google Apps Script Webhook URL:</span>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">POST Executable</span>
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>API Key Otorisasi Pengiriman:</span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">Aktif</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-slate-400">
                <Key className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                placeholder="AQ.Ab8RN6..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => handleExecuteSync('sync_all')}
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Mengirim ke Google Sheets...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-white" />
                  <span>Sinkronkan Semua Data Sekaligus (Modul_Materi & Bank_Soal)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleExecuteSync('sync_modules')}
                disabled={isLoading}
                className="py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kirim Modul_Materi (24 Baris)</span>
              </button>

              <button
                onClick={() => handleExecuteSync('sync_questions')}
                disabled={isLoading}
                className="py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition flex items-center justify-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-600" />
                <span>Kirim Bank_Soal (72 Soal)</span>
              </button>
            </div>
          </div>

          {/* Preview Payload Toggle */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
            <span>Struktur Payload JSON:</span>
            <button
              onClick={() => setShowPayloadPreview(!showPayloadPreview)}
              className="text-indigo-600 hover:underline font-mono"
            >
              {showPayloadPreview ? 'Sembunyikan JSON' : 'Lihat JSON Payload (Preview)'}
            </button>
          </div>

          {showPayloadPreview && (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 max-h-52 overflow-y-auto scrollbar-thin">
              <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>
            </div>
          )}

        </div>

        {/* Right Column: Deployment Guide & Apps Script Code */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Troubleshooting Guide Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Panduan Izin Google Apps Script
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Jika pengiriman otomatis menampilkan pesan peringatan otorisasi, pastikan pengaturan deployment di Google Apps Script Anda telah diatur sebagai berikut:
            </p>

            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-600">
              <li>Buka Google Spreadsheet &gt; menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Klik tombol <strong>Terapkan (Deploy)</strong> &gt; <strong>Kelola penerapan</strong>.</li>
              <li>Klik ikon pensil <strong>Edit</strong>.</li>
              <li>Pada bagian <strong>Siapa yang memiliki akses (Who has access)</strong>, ubah menjadi <strong className="text-indigo-700">Siapa saja (Anyone)</strong>.</li>
              <li>Klik <strong>Terapkan</strong> dan gunakan URL baru yang dihasilkan.</li>
            </ol>

            <button
              onClick={() => setShowCodeModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <FileCode className="w-4 h-4" />
              <span>Lihat Kode Script Penerima Google Sheets (Code.gs)</span>
            </button>
          </div>

          {/* Quick Copy Fallback */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Alternatif 100% Bebas Kendala:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Gunakan tombol <strong>"Salin Tab"</strong> di menu <strong>Tabel Google Sheets</strong> untuk menempelkan data langsung ke Google Sheets sel A1 secara manual.
            </p>
          </div>

        </div>

      </div>

      {/* Sync Execution Logs Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" /> Log Aktivitas Pengiriman Webhook
          </h3>
          {syncLogs.length > 0 && (
            <button
              onClick={() => setSyncLogs([])}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Bersihkan Log
            </button>
          )}
        </div>

        {syncLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            Belum ada pengiriman yang dijalankan dalam sesi ini. Klik tombol sinkronisasi di atas untuk memulai.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin">
            {syncLogs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  log.result.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {log.result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>{log.action}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{log.timestamp}</span>
                </div>

                <p className="font-medium">{log.result.message}</p>

                {log.result.details && (
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white/60 p-2 rounded-lg border border-slate-200 font-mono">
                    {log.result.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Script Code.gs Ready-to-Paste */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-600" />
                  <span>Kode Google Apps Script Penerima (Code.gs)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Salin dan tempelkan ke editor Apps Script spreadsheet Anda.
                </p>
              </div>

              <button
                onClick={() => setShowCodeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
              <pre className="p-3.5 rounded-xl bg-slate-900 text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                {RECOMMENDED_APPS_SCRIPT_CODE}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Otomatis membuat tab <strong>Modul_Materi</strong> dan <strong>Bank_Soal</strong>
              </span>

              <button
                onClick={handleCopyScriptCode}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Script Tersalin!' : 'Salin Kode Script'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
