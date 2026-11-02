import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Code2, 
  Table2, 
  Send, 
  GraduationCap, 
  Sparkles,
  LogOut,
  Users,
  Trophy,
  Bot
} from 'lucide-react';

export type NavTab = 
  | 'syllabus' 
  | 'simulator' 
  | 'quiz' 
  | 'student_progress' 
  | 'teacher_monitoring' 
  | 'teacher_ai'
  | 'tables' 
  | 'sync';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedModuleId: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { role, currentStudent, teacherUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Platform Info */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveTab(role === 'GURU' ? 'teacher_monitoring' : 'syllabus')}
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-mono font-bold text-lg border border-white/40 hover:scale-105 transition-transform shrink-0">
              &lt;/&gt;
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                  DevCore <span className="text-indigo-600">KKA SMK</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border hidden sm:inline-flex items-center gap-1 font-semibold ${
                  role === 'GURU' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}>
                  {role === 'GURU' ? 'Portal Guru' : 'Dashboard Siswa'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Platform Koding & Kecerdasan Artifisial SMK (TJKT & RPL)
              </p>
            </div>
          </div>

          {/* Role-Based Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80">
            
            {/* GURU ONLY: Monitoring Siswa & Asisten Guru AI */}
            {role === 'GURU' && (
              <>
                <button
                  onClick={() => setActiveTab('teacher_monitoring')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'teacher_monitoring'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Monitoring Siswa (106)</span>
                </button>

                <button
                  onClick={() => setActiveTab('teacher_ai')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'teacher_ai'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Asisten AI</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2 text-indigo-600" /> Guru
                  </span>
                </button>
              </>
            )}

            {/* Common: Silabus 24 Modul */}
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'syllabus'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Silabus 24 Modul</span>
            </button>

            {/* Common: Lab Koding & Game */}
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>Lab Koding & Game</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            {/* Common: Kuis Mandiri */}
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              <span>Kuis Mandiri (72)</span>
            </button>

            {/* SISWA ONLY: Progres Belajar Saya */}
            {role === 'SISWA' && (
              <button
                onClick={() => setActiveTab('student_progress')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'student_progress'
                    ? 'bg-white text-indigo-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Progres Saya</span>
              </button>
            )}

            {/* GURU ONLY: Tabel Google Sheets & Sinkron Webhook */}
            {role === 'GURU' && (
              <>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'tables'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Table2 className="w-4 h-4 text-slate-500" />
                  <span>Tabel Sheets</span>
                </button>

                <button
                  onClick={() => setActiveTab('sync')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'sync'
                      ? 'bg-white text-indigo-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Send className="w-4 h-4 text-slate-500" />
                  <span>Sync Webhook</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">Auto</span>
                </button>
              </>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            
            {/* If Logged in as Student */}
            {role === 'SISWA' && currentStudent && (
              <div 
                onClick={() => setActiveTab('student_progress')}
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-indigo-400 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-bold text-xs border border-indigo-200">
                  {currentStudent.noAbsen}
                </div>
                <div className="text-left text-xs max-w-[130px]">
                  <div className="font-bold text-slate-800 truncate">{currentStudent.name}</div>
                  <div className="text-[10px] text-indigo-600 font-mono truncate">{currentStudent.className}</div>
                </div>
              </div>
            )}

            {/* If Logged in as Teacher */}
            {role === 'GURU' && teacherUser && (
              <div 
                onClick={() => setActiveTab('teacher_monitoring')}
                className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:border-amber-400 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-xs border border-amber-300">
                  👨‍🏫
                </div>
                <div className="text-left text-xs max-w-[130px]">
                  <div className="font-bold text-slate-800 truncate">{teacherUser.username}</div>
                  <div className="text-[10px] text-amber-700 font-medium truncate">Guru Pengampu</div>
                </div>
              </div>
            )}

            {/* Logout / Switch Role Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden pb-3 pt-1 border-t border-slate-200 flex items-center justify-between gap-1 overflow-x-auto text-[11px]">
          {role === 'GURU' && (
            <>
              <button
                onClick={() => setActiveTab('teacher_monitoring')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'teacher_monitoring' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Monitoring
              </button>

              <button
                onClick={() => setActiveTab('teacher_ai')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1 ${
                  activeTab === 'teacher_ai' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>Asisten AI</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'syllabus' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Silabus
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'simulator' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lab Koding
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Kuis (72)
          </button>

          {role === 'SISWA' && (
            <button
              onClick={() => setActiveTab('student_progress')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === 'student_progress' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Progres Saya
            </button>
          )}

          {role === 'GURU' && (
            <>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'tables' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tabel Sheets
              </button>

              <button
                onClick={() => setActiveTab('sync')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'sync' ? 'bg-indigo-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sync Webhook
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
