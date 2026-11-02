import React, { useState } from 'react';
import { MODULES_DATA, ModuleItem } from '../data/modulesData';
import { 
  Search, 
  Play, 
  Info
} from 'lucide-react';

interface ModuleListProps {
  onSelectModule: (module: ModuleItem) => void;
  onLaunchSimulator: (moduleId: number) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  onSelectModule,
  onLaunchSimulator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');

  const groups = [
    { id: 'all', label: 'Semua Modul (24)' },
    { id: 1, label: 'K1: Fondasi & Grafis (1-3)' },
    { id: 2, label: 'K2: DOM & State (4-6)' },
    { id: 3, label: 'K3: Struktur Data & Fisika (7-8)' },
    { id: 4, label: 'K4: Matriks & Multi-Objek (9-11)' },
    { id: 5, label: 'K5: Game AI & Capstone (12-14)' },
    { id: 6, label: 'K6: Advanced Platformer (15-18)' },
    { id: 7, label: 'K7: AI, Fisika & Jaringan (19-24)' },
  ];

  const filteredModules = MODULES_DATA.filter((m) => {
    const matchesGroup = selectedGroup === 'all' || m.groupNumber === selectedGroup;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.domainCategory.toLowerCase().includes(q) ||
      m.focus.toLowerCase().includes(q) ||
      m.smkSummary.toLowerCase().includes(q) ||
      m.codingLogic.some((c) => c.toLowerCase().includes(q));

    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Hero Intro Header (White Minimalist) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3 font-mono">
            <span>Silabus KKA SMK 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>TJKT & RPL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3 font-sans">
            24 Modul Koding & Game 2D <br />
            <span className="text-indigo-600">HTML5 Canvas & Kecerdasan Artifisial</span>
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Silabus 24 modul interaktif berbasis proyek: dari koordinat kanvas dasar, logika DOM, matriks 2D, game platformer akrobatik, hingga pathfinding A*, particle physics, visual KNN ML, neuro-evolution AI, dan sinkronisasi jaringan 2D.
          </p>

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-bold font-mono text-slate-900">24 Modul</div>
              <div className="text-xs text-slate-500">Praktikum Lengkap</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-bold font-mono text-indigo-600">480 Tugas</div>
              <div className="text-xs text-slate-500">20 Tugas per Modul</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-bold font-mono text-violet-600">72 Soal</div>
              <div className="text-xs text-slate-500">Bank Soal KKA (PG & Essay)</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xl font-bold font-mono text-emerald-600">100% Praktik</div>
              <div className="text-xs text-slate-500">Berbasis Proyek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul atau konsep koding (misal: matriks, AABB, state, timer)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-sm"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500 self-center">
            Menampilkan <span className="text-indigo-600 font-bold">{filteredModules.length}</span> dari 18 Modul
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroup(g.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGroup === g.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
          >
            {/* Top Accent Bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${item.accentColor}`} />

            <div className="p-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                  {item.id < 10 ? `0${item.id}` : item.id}
                </span>

                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {item.groupLabel}
                </span>
              </div>

              {/* Title & Domain */}
              <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-indigo-600 font-mono mb-3">
                {item.domainCategory}
              </p>

              {/* Focus Box */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-3.5">
                <strong className="text-slate-800 block mb-0.5">🎯 Fokus Utama:</strong>
                <p className="line-clamp-2">{item.focus}</p>
              </div>

              {/* Coding Logic Points */}
              <div className="space-y-1 mb-3.5">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                  Logika Koding Utama:
                </span>
                {item.codingLogic.slice(0, 2).map((logic, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-500 font-mono">
                    <span className="text-indigo-500">•</span>
                    <span className="line-clamp-1">{logic}</span>
                  </div>
                ))}
              </div>

              {/* Project Result */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                <strong className="text-emerald-900">🛠️ Proyek: </strong>
                <span className="line-clamp-1">{item.projectResult}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => onSelectModule(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Detail Intisari</span>
              </button>

              <button
                onClick={() => onLaunchSimulator(item.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Lab Koding</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
