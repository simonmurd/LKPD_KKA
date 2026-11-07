/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RealtimeProvider, useRealtime } from './context/RealtimeContext';
import { Navbar, NavTab } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { ModuleList } from './components/ModuleList';
import { ModuleDetailModal } from './components/ModuleDetailModal';
import { InteractiveRunner } from './components/InteractiveRunner';
import { QuizPractice } from './components/QuizPractice';
import { StudentProgressCard } from './components/StudentProgressCard';
import { TeacherMonitoringPanel } from './components/TeacherMonitoringPanel';
import { TeacherAiAssistant } from './components/TeacherAiAssistant';
import { LiveChatCenter } from './components/LiveChatCenter';
import { FloatingLiveChatWidget } from './components/FloatingLiveChatWidget';
import { MODULES_DATA, ModuleItem } from './data/modulesData';

function MainAppContent() {
  const { role, currentStudent, teacherUser, recordModulePractice } = useAuth();
  const { updateActivity } = useRealtime();
  
  const [activeTab, setActiveTab] = useState<NavTab>(role === 'GURU' ? 'teacher_monitoring' : 'syllabus');
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [modalModule, setModalModule] = useState<ModuleItem | null>(null);

  // Sync real-time activity when user switches tabs or modules
  useEffect(() => {
    if (!role) return;
    const currentMod = MODULES_DATA.find((m) => m.id === selectedModuleId);
    let statusText: 'online' | 'coding' | 'exam' | 'idle' = 'online';
    if (activeTab === 'simulator') statusText = 'coding';
    if (activeTab === 'quiz') statusText = 'exam';

    updateActivity(
      selectedModuleId,
      currentMod ? currentMod.shortTitle : undefined,
      activeTab,
      statusText
    );
  }, [role, activeTab, selectedModuleId, updateActivity]);

  // If not authenticated, render Login Portal
  if (!role) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 bg-grid-dot flex flex-col font-sans">
        <LoginPortal />
      </div>
    );
  }

  // Security guard: If Siswa attempts to access admin/teacher tabs, redirect to syllabus
  if (role === 'SISWA' && (activeTab === 'teacher_monitoring' || activeTab === 'teacher_ai')) {
    setActiveTab('syllabus');
  }

  const handleLaunchSimulator = (moduleId: number) => {
    setSelectedModuleId(moduleId);
    recordModulePractice(moduleId);
    setActiveTab('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white bg-grid-dot">
      
      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        selectedModuleId={selectedModuleId} 
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 w-full">
        
        {/* GURU ONLY: Monitoring Rekap Siswa */}
        {role === 'GURU' && activeTab === 'teacher_monitoring' && (
          <TeacherMonitoringPanel />
        )}

        {/* Real-Time Live Chat & Monitoring Siswa Login */}
        {activeTab === 'live_chat' && (
          <LiveChatCenter />
        )}

        {/* SISWA ONLY: Lembar Kemajuan Belajar */}
        {role === 'SISWA' && activeTab === 'student_progress' && (
          <StudentProgressCard 
            onContinueLearning={() => {
              setActiveTab('simulator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToQuiz={() => {
              setActiveTab('quiz');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLaunchModule={handleLaunchSimulator}
          />
        )}

        {/* Common: Silabus 24 Modul */}
        {activeTab === 'syllabus' && (
          <ModuleList 
            onSelectModule={(mod) => setModalModule(mod)}
            onLaunchSimulator={handleLaunchSimulator}
          />
        )}

        {/* Common: Lab Koding & Game Runner (STRICTLY 2 PARTS: KODING & 20 TUGAS + BAGIAN HASIL) */}
        {activeTab === 'simulator' && (
          <InteractiveRunner 
            initialModuleId={selectedModuleId}
            onSelectModule={(mod) => setModalModule(mod)}
          />
        )}

        {/* Common: Ujian CBT 40 PG & Essay */}
        {activeTab === 'quiz' && (
          <QuizPractice />
        )}

        {/* GURU ONLY: Asisten Guru AI */}
        {role === 'GURU' && activeTab === 'teacher_ai' && (
          <TeacherAiAssistant />
        )}

      </main>

      {/* Floating Quick Live Chat Launcher for Quick Consultations */}
      {activeTab !== 'live_chat' && (
        <FloatingLiveChatWidget />
      )}

      {/* GURU ONLY: Floating Quick AI Launcher */}
      {role === 'GURU' && activeTab !== 'teacher_ai' && activeTab !== 'live_chat' && (
        <button
          onClick={() => {
            setActiveTab('teacher_ai');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-20 right-6 z-40 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-lg border border-slate-200 flex items-center gap-2.5 transition hover:scale-105 active:scale-95 group"
          title="Buka Asisten Chat Bot Guru AI"
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-sans">Asisten AI Guru</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </button>
      )}

      {/* Detail Modal */}
      <ModuleDetailModal 
        module={modalModule}
        onClose={() => setModalModule(null)}
        onLaunchSimulator={handleLaunchSimulator}
      />

      {/* Footer (White Minimalist) */}
      <footer className="border-t border-slate-200/90 bg-white/95 backdrop-blur-md py-6 relative z-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs">
              &lt;/&gt;
            </div>
            <div>
              <span className="font-bold text-slate-800">
                DevCore KKA — {role === 'GURU' ? 'Dashboard Guru (Pak Simon)' : `Dashboard Siswa (${currentStudent?.name || ''})`}
              </span>
              <p className="text-[11px] text-slate-500">
                SMK Negeri 1 Singkawang (X &amp; XI TJK) &amp; SMK Mudita Singkawang (XI &amp; XII TJKT) — 139 Siswa
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            &copy; 2026 Kurikulum Koding &amp; Kecerdasan Artifisial SMK. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <MainAppContent />
      </RealtimeProvider>
    </AuthProvider>
  );
}
