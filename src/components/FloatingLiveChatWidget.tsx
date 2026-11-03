/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Floating Live Chat Quick Widget
 * Memungkinkan siswa berkonsultasi langsung ke guru atau melihat pengumuman
 * dari mana saja tanpa meninggalkan kanvas koding atau lembar CBT.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  Users, 
  Radio, 
  ChevronUp, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const FloatingLiveChatWidget: React.FC = () => {
  const { role, currentStudent } = useAuth();
  const { 
    messages, 
    sendMessage, 
    unreadCount, 
    resetUnreadCount, 
    onlineStudents, 
    isConnected 
  } = useRealtime();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleOpen = () => {
    if (!isOpen) resetUnreadCount();
    setIsOpen(!isOpen);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    const text = inputText.trim();
    setInputText('');

    if (role === 'GURU') {
      await sendMessage(text, 'all', undefined, 'public');
    } else {
      await sendMessage(text, 'guru-simon', 'Simon Murd (Guru Mapel)', 'direct');
    }
    setIsSending(false);
  };

  const recentMessages = messages.slice(-15);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-white/20"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-indigo-600 animate-pulse"></span>
          </div>

          <div className="flex flex-col text-left">
            <span className="font-bold leading-tight">Live Chat &amp; Bantuan</span>
            <span className="text-[10px] text-indigo-200 font-mono">
              {role === 'GURU' ? `${onlineStudents.length} Siswa Online` : 'Guru Simon Online'}
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono flex items-center justify-center animate-bounce shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Popup Window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">
                  {role === 'GURU' ? 'Live Chat Kelas KKA' : 'Konsultasi Guru Simon'}
                </h4>
                <div className="text-[10px] text-indigo-100 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{isConnected ? 'Terhubung' : 'Sinkronisasi'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={toggleOpen}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {recentMessages.map((m) => {
              const isMe = role === 'GURU' ? m.senderRole === 'GURU' : m.senderId === currentStudent?.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
                >
                  <span className="text-[9px] font-mono text-slate-400">
                    {m.senderName} ({m.senderRole === 'GURU' ? 'Guru' : 'Siswa'})
                  </span>
                  <div
                    className={`max-w-[85%] p-2.5 rounded-2xl leading-relaxed ${
                      m.type === 'broadcast'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-medium'
                        : isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={role === 'GURU' ? "Ketik pesan kelas..." : "Tanya Guru Simon..."}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
