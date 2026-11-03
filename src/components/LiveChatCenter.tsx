/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pusat Pemantauan Siswa Login & Ruang Live Chat Real-Time
 * Khusus Guru & Siswa KKA SMK (SMK Negeri 1 Singkawang & SMK Mudita)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime, UserPresence } from '../context/RealtimeContext';
import { STUDENTS_DATA, SCHOOL_OPTIONS, CLASS_OPTIONS } from '../data/studentsData';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Radio, 
  Search, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight,
  Flame,
  Volume2,
  Code2,
  GraduationCap
} from 'lucide-react';

export const LiveChatCenter: React.FC = () => {
  const { role, currentStudent, teacherUser } = useAuth();
  const { 
    onlineUsers, 
    onlineStudents, 
    messages, 
    sendMessage, 
    selectedChatUser, 
    setSelectedChatUser,
    resetUnreadCount,
    isConnected
  } = useRealtime();

  // Mode Tampilan: 'presence_monitor' (khusus guru memantau) | 'live_chat'
  const [activeView, setActiveView] = useState<'presence_monitor' | 'live_chat'>(
    role === 'GURU' ? 'presence_monitor' : 'live_chat'
  );

  // Filter Pemantauan Siswa
  const [filterClass, setFilterClass] = useState<string>('SEMUA KELAS');
  const [filterSchool, setFilterSchool] = useState<string>('SEMUA SEKOLAH');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ONLINE_ONLY'>('ALL');
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');

  // State Pesan Chat
  const [chatChannel, setChatChannel] = useState<'public' | 'direct' | 'broadcast'>('public');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    resetUnreadCount();
  }, [messages, activeView, chatChannel, selectedChatUser, resetUnreadCount]);

  // Handle Switch to Direct Chat with a Student
  const handleStartDirectChat = (studentPresence: UserPresence) => {
    setSelectedChatUser(studentPresence);
    setChatChannel('direct');
    setActiveView('live_chat');
  };

  // Filter Data Siswa dengan Status Online
  const onlineMap = React.useMemo(() => {
    const map = new Map<string, UserPresence>();
    onlineUsers.forEach((u) => {
      map.set(u.id, u);
    });
    return map;
  }, [onlineUsers]);

  const filteredStudentList = STUDENTS_DATA.filter((s) => {
    const matchSchool = filterSchool === 'SEMUA SEKOLAH' || s.school === filterSchool;
    const matchClass = filterClass === 'SEMUA KELAS' || s.className === filterClass;
    const isOnline = onlineMap.has(s.id);
    const matchStatus = filterStatus === 'ALL' || isOnline;
    const q = searchStudentQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.noAbsen.includes(q) ||
      s.className.toLowerCase().includes(q);

    return matchSchool && matchClass && matchStatus && matchQuery;
  });

  // Filtered Messages based on Channel
  const displayMessages = messages.filter((m) => {
    if (chatChannel === 'broadcast') {
      return m.type === 'broadcast';
    }
    if (chatChannel === 'public') {
      return m.type === 'public' || m.type === 'broadcast';
    }
    if (chatChannel === 'direct') {
      if (role === 'GURU') {
        if (!selectedChatUser) return true;
        return (
          (m.senderId === selectedChatUser.id && m.recipientId?.startsWith('guru')) ||
          (m.senderId?.startsWith('guru') && m.recipientId === selectedChatUser.id)
        );
      } else {
        // Siswa chatting with teacher
        return (
          (m.senderId === currentStudent?.id && m.recipientId?.startsWith('guru')) ||
          (m.senderId?.startsWith('guru') && m.recipientId === currentStudent?.id)
        );
      }
    }
    return true;
  });

  // Send Chat Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    let recipientId = 'all';
    let recipientName = undefined;
    let type: 'public' | 'direct' | 'broadcast' = 'public';

    if (chatChannel === 'broadcast' && role === 'GURU') {
      type = 'broadcast';
      recipientId = 'all';
    } else if (chatChannel === 'direct') {
      type = 'direct';
      if (role === 'GURU' && selectedChatUser) {
        recipientId = selectedChatUser.id;
        recipientName = selectedChatUser.name;
      } else {
        recipientId = 'guru-simon';
        recipientName = 'Simon Murd (Guru Mapel)';
      }
    }

    await sendMessage(content, recipientId, recipientName, type);
    setIsSending(false);
  };

  // Quick Preset Prompts for Teacher
  const teacherPresets = [
    "Halo! Apakah ada kendala dalam memahami logika modul ini?",
    "Gunakan fungsi Math.atan2(dy, dx) untuk menghitung sudut rotasi objek.",
    "Perhatikan waktu pengerjaan CBT 60 menit, periksa kembali soal ragu-ragu!",
    "Bagus sekali! Logika koding dan state machine Anda sudah tepat."
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>WebSockets Live Service • {isConnected ? 'Terhubung Real-Time' : 'Mode Polling Sinkron'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {role === 'GURU' ? 'Monitoring Kehadiran Siswa & Live Chat Kelas' : 'Ruang Live Chat & Konsultasi Guru'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {role === 'GURU'
                ? 'Pantau secara langsung siapa saja siswa yang sedang login, durasi aktif, modul yang sedang dipelajari, serta kirim pesan atau bimbingan langsung.'
                : 'Tanyakan langsung kendala materi modul atau soal ujian kepada Guru Simon Murd secara real-time.'}
            </p>
          </div>

          {/* Online Counter Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-200 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400">Status Kehadiran Live</div>
              <div className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
                <span>{onlineStudents.length}</span>
                <span className="text-xs font-normal text-slate-500">/ 106 Siswa Online</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{onlineUsers.length} Total Pengguna Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-6">
          {role === 'GURU' && (
            <button
              onClick={() => setActiveView('presence_monitor')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all border ${
                activeView === 'presence_monitor'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Pemantauan Siswa Login (Live Presence)</span>
            </button>
          )}

          <button
            onClick={() => setActiveView('live_chat')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all border ${
              activeView === 'live_chat'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            } ${role !== 'GURU' ? 'col-span-2' : ''}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ruang Live Chat Interaktif</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW: PEMANTAUAN SISWA LOGIN REAL-TIME (KHUSUS GURU)                   */}
      {/* ========================================================================= */}
      {role === 'GURU' && activeView === 'presence_monitor' && (
        <div className="space-y-6">
          
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Quick Tab Filter: Semua vs Sedang Online */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    filterStatus === 'ALL'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Semua Siswa (106)
                </button>
                <button
                  onClick={() => setFilterStatus('ONLINE_ONLY')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    filterStatus === 'ONLINE_ONLY'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Sedang Login Sekarang ({onlineStudents.length})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama atau absen siswa..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

            </div>

            {/* Dropdown Filters (Sekolah & Kelas) */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sekolah:</span>
                <select
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {SCHOOL_OPTIONS.map((sc, i) => (
                    <option key={i} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Kelas:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  {CLASS_OPTIONS.map((cl, i) => (
                    <option key={i} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Daftar Siswa dengan Live Presence Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudentList.map((s) => {
              const livePresence = onlineMap.get(s.id);
              const isOnline = !!livePresence;

              return (
                <div
                  key={s.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isOnline
                      ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${
                        isOnline
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {s.noAbsen}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {s.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {s.className} • {s.school.includes('MUDITA') ? 'SMK Mudita' : 'SMKN 1 Singkawang'}
                        </div>
                      </div>
                    </div>

                    {/* Badge Status */}
                    <div>
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold font-mono">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>ONLINE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono">
                          OFFLINE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info Aktivitas Siswa Jika Online */}
                  {isOnline && livePresence && (
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-2.5 text-xs text-slate-700 space-y-1 mb-3">
                      <div className="flex items-center justify-between text-[10px] text-emerald-800 font-mono">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>Login sejak:</span>
                        </span>
                        <span>{new Date(livePresence.loginTime).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[11px] text-slate-800 font-medium">
                        Aktivitas: <strong className="text-indigo-600">{livePresence.currentModuleName || 'Eksplorasi Platform KKA'}</strong>
                      </div>
                    </div>
                  )}

                  {/* Tombol Aksi Langsung */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleStartDirectChat(livePresence || {
                        id: s.id,
                        name: s.name,
                        role: 'SISWA',
                        school: s.school,
                        className: s.className,
                        noAbsen: s.noAbsen,
                        status: 'online',
                        loginTime: new Date().toISOString(),
                        lastActive: new Date().toISOString()
                      })}
                      className="w-full py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chat Siswa Ini</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: RUANG LIVE CHAT KELAS & KONSULTASI 1-ON-1                         */}
      {/* ========================================================================= */}
      {activeView === 'live_chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Kolom Saluran Chat (4/12) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Saluran Percakapan Real-Time
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pilih ruang siaran atau obrolan langsung.
              </p>
            </div>

            <div className="space-y-2">
              
              {/* Channel 1: Public Class Room */}
              <button
                onClick={() => {
                  setChatChannel('public');
                  setSelectedChatUser(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  chatChannel === 'public'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Ruang Kelas Umum</div>
                    <div className="text-[10px] text-slate-500">Terbuka untuk seluruh siswa</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  Live
                </span>
              </button>

              {/* Channel 2: Broadcast Pengumuman Guru */}
              <button
                onClick={() => {
                  setChatChannel('broadcast');
                  setSelectedChatUser(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  chatChannel === 'broadcast'
                    ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Siaran Pengumuman Guru</div>
                    <div className="text-[10px] text-slate-500">Pesan penting & instruksi ujian</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  Pengumuman
                </span>
              </button>

              {/* Channel 3: Direct 1-on-1 */}
              <button
                onClick={() => setChatChannel('direct')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  chatChannel === 'direct'
                    ? 'bg-violet-50 border-violet-300 text-violet-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {role === 'GURU' ? (selectedChatUser ? `Private: ${selectedChatUser.name}` : 'Pesan Pribadi Siswa') : 'Konsultasi Guru Simon'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {role === 'GURU' ? (selectedChatUser ? `${selectedChatUser.className}` : 'Pilih siswa untuk chat') : 'Tanya langsung ke guru'}
                    </div>
                  </div>
                </div>
              </button>

            </div>

            {/* List Siswa Online Cepat untuk Direct Chat */}
            {role === 'GURU' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Siswa Online Sekarang:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {onlineStudents.length === 0 ? (
                    <div className="text-xs text-slate-400 p-2 text-center">Belum ada siswa lain yang online.</div>
                  ) : (
                    onlineStudents.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleStartDirectChat(u)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                          selectedChatUser?.id === u.id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{u.className}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Kolom Jendela Obrolan (8/12) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
            
            {/* Header Chat Window */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {chatChannel === 'broadcast' ? '📢' : chatChannel === 'direct' ? '👤' : '💬'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {chatChannel === 'broadcast'
                      ? 'Saluran Pengumuman Resmi Guru'
                      : chatChannel === 'direct'
                      ? (role === 'GURU' ? `Percakapan Pribadi: ${selectedChatUser?.name || 'Siswa'}` : 'Konsultasi Privat dengan Simon Murd (Guru Mapel)')
                      : 'Forum Diskusi Kelas KKA'}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Tersambung ke server WebSockets real-time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Pesan Chat Stream */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {displayMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 opacity-30 text-indigo-600" />
                  <p className="text-xs">Belum ada pesan di saluran ini. Mulai percakapan sekarang!</p>
                </div>
              ) : (
                displayMessages.map((msg) => {
                  const isMe = role === 'GURU' ? msg.senderRole === 'GURU' : msg.senderId === currentStudent?.id;
                  const isBroadcast = msg.type === 'broadcast';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1">
                        <span className={`font-bold ${msg.senderRole === 'GURU' ? 'text-amber-700' : 'text-indigo-600'}`}>
                          {msg.senderName}
                        </span>
                        {msg.senderClass && <span>({msg.senderClass})</span>}
                        <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isBroadcast
                            ? 'bg-amber-100 text-amber-950 border border-amber-300 font-medium'
                            : isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {isBroadcast && (
                          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Radio className="w-3 h-3 text-amber-600" />
                            <span>PENGUMUMAN RESMI</span>
                          </div>
                        )}
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Presets for Teacher */}
            {role === 'GURU' && (
              <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-[10px] text-slate-400 font-mono shrink-0 px-1">Respon Cepat:</span>
                {teacherPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputMessage(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-slate-200 text-[11px] whitespace-nowrap transition-all shrink-0"
                  >
                    {preset.slice(0, 32)}...
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar Form */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  chatChannel === 'broadcast'
                    ? "Tulis pengumuman kelas yang akan disiarkan ke seluruh siswa..."
                    : "Ketik pesan live chat di sini..."
                }
                className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
