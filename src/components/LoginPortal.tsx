import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Student } from '../data/studentsData';
import { StudentCombobox } from './StudentCombobox';
import { 
  GraduationCap, 
  ShieldAlert, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Key, 
  AlertCircle
} from 'lucide-react';

export const LoginPortal: React.FC = () => {
  const { loginAsStudent, loginAsTeacher } = useAuth();
  
  const [activePortal, setActivePortal] = useState<'SISWA' | 'GURU'>('SISWA');
  
  // State Siswa
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // State Guru
  const [teacherUsername, setTeacherUsername] = useState('simonmurd');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherError, setTeacherError] = useState<string | null>(null);

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      loginAsStudent(selectedStudent);
    }
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);
    const result = loginAsTeacher(teacherUsername, teacherPassword);
    if (!result.success) {
      setTeacherError(result.message || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">
        
        {/* Top Header Card */}
        <div className="text-center mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Koding & Kecerdasan Artifisial (KKA)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
            Portal Akses Pembelajaran
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Silakan pilih peran Anda untuk masuk ke Dashboard Siswa atau Dashboard Guru.
          </p>

          {/* Role Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 max-w-sm mx-auto mt-4">
            <button
              type="button"
              onClick={() => setActivePortal('SISWA')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activePortal === 'SISWA'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Dashboard Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('GURU')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activePortal === 'GURU'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Portal Guru (Admin)</span>
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
          
          {/* TAB 1: PORTAL SISWA */}
          {activePortal === 'SISWA' && (
            <form onSubmit={handleStudentSubmit} className="space-y-6 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span>Pilih Identitas Siswa</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cari nama atau nomor absen Anda menggunakan kotak autocomplete di bawah.
                </p>
              </div>

              {/* Student Searchable Combobox */}
              <StudentCombobox
                selectedStudent={selectedStudent}
                onSelectStudent={setSelectedStudent}
              />

              {/* Scope Protection Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">🔒 Akses Siswa Terproteksi:</span>
                <p>
                  Siswa dapat mempelajari 18 modul, mengerjakan 20 tantangan koding di simulator, serta mengikuti kuis pemahaman tanpa risiko mengubah konfigurasi Google Sheets sistem.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedStudent}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Masuk ke Dashboard Siswa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: PORTAL GURU */}
          {activePortal === 'GURU' && (
            <form onSubmit={handleTeacherSubmit} className="space-y-5 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <span>Autentikasi Guru Pengampu</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Masuk dengan kredensial pengajar untuk mengakses manajemen Google Sheets, Webhook, dan pemantauan siswa.
                </p>
              </div>

              {teacherError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{teacherError}</span>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Username Guru:</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={teacherUsername}
                    onChange={(e) => setTeacherUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Password Guru:</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="Masukkan password guru"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <Key className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hak Akses Penuh:</strong> Guru memiliki kontrol penuh atas sinkronisasi Google Sheets Webhook, unduh rekap nilai siswa, serta manajemen master kurikulum.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Masuk ke Dashboard Guru</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
