import React, { useState, useRef, useEffect } from 'react';
import { MODULES_DATA, ModuleItem } from '../data/modulesData';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  BookOpen, 
  HelpCircle, 
  Code2, 
  GraduationCap, 
  FileText, 
  RefreshCw,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const TeacherAiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Halo Bapak/Ibu Guru! 👋\n\nSaya adalah **DevCore Guru AI**, asisten cerdas khusus pengampu mata pelajaran **Koding dan Kecerdasan Artifisial (KKA)** di SMK (jurusan **TJKT & RPL**).\n\nSaya siap membantu Bapak/Ibu dalam:\n- 📝 **Menyusun Modul Ajar (RPP)** dan skenario praktikum kelas untuk ke-24 modul.\n- 🎯 **Membuat butir soal baru** (PG Biasa, PG Kompleks, atau Essay Koding) lengkap dengan kunci jawaban & rubrik penilaian.\n- 🐞 **Mendiagnosa kesalahan koding siswa** (HTML5 Canvas, koordinat, AABB collision, A*, KNN, dll).\n- 💡 **Merancang strategi pembelajaran aktif**, analogi materi ramah anak SMK, serta program pengayaan/remedial.\n\nSilakan pilih modul acuan di bawah atau ketik langsung pertanyaan Bapak/Ibu!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedModule: ModuleItem | undefined = MODULES_DATA.find((m) => m.id === selectedModuleId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build history for backend API
      const conversationHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/teacher-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          selectedModuleInfo: selectedModule
            ? {
                id: selectedModule.id,
                title: selectedModule.title,
                domainCategory: selectedModule.domainCategory,
                smkSummary: selectedModule.smkSummary,
              }
            : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak menerima respons.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(
        err.message || 'Gagal menghubungi server asisten AI. Pastikan server dev berjalan dengan normal.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleClearChat = () => {
    if (window.confirm('Bersihkan seluruh percakapan asisten?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Percakapan telah diatur ulang. Ada topik modul ajar, soal, atau kendala koding apa yang ingin Bapak/Ibu diskusikan sekarang?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setErrorMessage(null);
    }
  };

  const promptStarters = [
    {
      title: '🎯 Buat 3 Soal Baru untuk Modul Ini',
      prompt: `Tolong buatkan 3 butir soal latihan baru untuk Modul ${selectedModuleId}: ${selectedModule?.title}. Format mencakup: 1 butir PG Biasa, 1 butir PG Kompleks, dan 1 butir Essay Koding dengan pembahasan dan rubrik penilaian.`,
      icon: GraduationCap,
    },
    {
      title: '📋 Rancangan Modul Ajar (RPP)',
      prompt: `Buatkan draf Modul Ajar ringkas (2 Jam Pelajaran) untuk Modul ${selectedModuleId}: ${selectedModule?.title}. Sertakan Tujuan Pembelajaran, Pertanyaan Pemantik, Kegiatan Inti Koding Bertahap, dan Asesmen Formatif untuk siswa SMK.`,
      icon: FileText,
    },
    {
      title: '🐞 Panduan Diagnosa Error Koding',
      prompt: `Apa saja kesalahan logika koding paling sering dilakukan siswa SMK pada Modul ${selectedModuleId}: ${selectedModule?.title}, dan bagaimana cara membimbing siswa menemukan solusinya tanpa langsung memberi tahu kode jadinya?`,
      icon: Code2,
    },
    {
      title: '💡 Ide Analogi Materi Konsep Sulit',
      prompt: `Berikan analogi dunia nyata yang sangat mudah dipahami siswa SMK kelas X/XI TJKT & RPL untuk konsep utama pada Modul ${selectedModuleId}: ${selectedModule?.title}.`,
      icon: Lightbulb,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Bot className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Didukung Gemini 3.8 Flash
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  Eksklusif Portal Guru
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
                Asisten Cerdas Guru KKA SMK
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Mitra pedagogis untuk menyusun modul ajar, bank soal baru, diagnosa koding, dan strategi pengajaran TJKT/RPL.
              </p>
            </div>
          </div>

          {/* Module Context Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modul Acuan Aktif:</div>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(Number(e.target.value))}
                  className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {MODULES_DATA.map((m) => (
                    <option key={m.id} value={m.id}>
                      Modul {m.id}: {m.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200 transition text-xs flex items-center justify-center gap-1.5"
              title="Bersihkan Percakapan"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {promptStarters.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              disabled={isLoading}
              className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 text-left transition shadow-sm hover:shadow group disabled:opacity-50"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition mb-1">
                <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">{item.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages Stream Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10">
                    <span className={`text-[10px] font-bold uppercase font-mono ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {isUser ? 'Bapak/Ibu Guru' : 'DevCore Guru AI'}
                    </span>
                    <span className={`text-[10px] font-mono ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Body with clean markdown/whitespace rendering */}
                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                    {msg.content}
                  </div>

                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Model: gemini-3.8-flash
                      </span>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-semibold transition"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Disalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Teks</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-mono font-bold text-xs shadow-sm">
                    👨‍🏫
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>DevCore Guru AI sedang merumuskan jawaban & bahan ajar...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Tanyakan apa saja seputar Modul ${selectedModuleId} (${selectedModule?.shortTitle}), pembuatan soal, analisis error koding, atau RPP...`}
                rows={2}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition shadow-sm"
              />
              <div className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 hidden sm:block">
                Shift + Enter untuk baris baru
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/20 transition disabled:opacity-50 shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
