import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MODULES_DATA } from '../data/modulesData';
import { 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Code2, 
  Award,
  ArrowRight
} from 'lucide-react';

interface StudentProgressCardProps {
  onContinueLearning: () => void;
  onGoToQuiz: () => void;
}

export const StudentProgressCard: React.FC<StudentProgressCardProps> = ({
  onContinueLearning,
  onGoToQuiz,
}) => {
  const { currentStudent, studentProgressMap } = useAuth();

  if (!currentStudent) return null;

  const progress = studentProgressMap[currentStudent.id] || {
    practicedModules: [1],
    quizScore: 0,
    quizTotal: 0,
    lastActive: new Date().toISOString(),
  };

  const practicedCount = progress.practicedModules.length;
  const progressPercent = Math.min(100, Math.round((practicedCount / 24) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Student Welcome Hero (White Minimalist) */}
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
                Dashboard Pembelajaran Mandiri KKA SMK.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onContinueLearning}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition"
            >
              <Code2 className="w-4 h-4" />
              <span>Lanjut Latihan Koding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Modul Selesai */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Modul Dipelajari</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {practicedCount} <span className="text-xs text-slate-500 font-normal">/ 24 Modul</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-indigo-600 font-mono block text-right font-bold">
            {progressPercent}% Kurikulum
          </span>
        </div>

        {/* Skor Kuis */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Pencapaian Kuis</span>
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
            <span>Buka Kuis Mandiri</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Lencana Siswa */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Status Sertifikasi</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>KKA Cadet Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Akses penuh ke semua laboratorium koding, editor canvas, dan simulasi 2D.
          </p>
        </div>

      </div>

      {/* Modules Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Lembar Kemajuan 24 Modul Saya
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

    </div>
  );
};
