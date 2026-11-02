import React from 'react';
import { ModuleItem } from '../data/modulesData';
import { X, Play, Code, CheckCircle, ExternalLink, Lightbulb, Target } from 'lucide-react';

interface ModuleDetailModalProps {
  module: ModuleItem | null;
  onClose: () => void;
  onLaunchSimulator: (moduleId: number) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  onClose,
  onLaunchSimulator,
}) => {
  if (!module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold font-mono">
              {module.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              {module.groupLabel}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-sans text-slate-900 mb-1">
            {module.title}
          </h2>
          <p className="text-xs text-indigo-600 font-medium">
            Kategori Domain: {module.domainCategory}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-600 text-xs sm:text-sm leading-relaxed">
          
          {/* Fokus Utama */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Target className="w-4 h-4 text-indigo-600" /> Fokus Pembelajaran:
            </h4>
            <p className="text-slate-700 font-medium">
              {module.focus}
            </p>
          </div>

          {/* Intisari Materi Ramah SMK (TJKT/RPL) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2 mb-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-600" /> Intisari Materi SMK (TJKT & RPL):
            </h4>
            <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
              {module.smkSummary}
            </p>
          </div>

          {/* Logika Koding & Konsep Pemrograman Kunci */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-2.5">
              <Code className="w-4 h-4 text-indigo-600" /> Logika Pemrograman & JavaScript Canvas:
            </h4>
            <ul className="space-y-1.5">
              {module.codingLogic.map((logic, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 font-mono text-[11px] leading-relaxed">{logic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hasil Proyek Nyata */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              🛠️ Hasil Akhir Praktikum Siswa:
            </h4>
            <p className="text-xs sm:text-sm font-medium">
              {module.projectResult}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onClose();
              onLaunchSimulator(module.id);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Buka Lab Koding & Game</span>
          </button>
        </div>

      </div>
    </div>
  );
};
