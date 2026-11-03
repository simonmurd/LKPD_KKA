/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Real-Time Presence & Live Chat Context
 * Menyediakan sinkronisasi WebSockets + fallback REST untuk:
 * 1. Pemantauan status login siswa & guru secara live (kehadiran, modul aktif, durasi).
 * 2. Live Chat real-time antara Guru dan Siswa (Public, Direct 1-on-1, dan Broadcast).
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface UserPresence {
  id: string;
  name: string;
  role: 'SISWA' | 'GURU';
  school?: string;
  className?: string;
  noAbsen?: string;
  currentModuleId?: number;
  currentModuleName?: string;
  currentTab?: string;
  status: 'online' | 'coding' | 'exam' | 'idle';
  loginTime: string;
  lastActive: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'SISWA' | 'GURU';
  senderClass?: string;
  recipientId?: string; // 'all' for public room, or specific student/teacher ID
  recipientName?: string;
  content: string;
  timestamp: string;
  type: 'public' | 'direct' | 'broadcast';
}

interface RealtimeContextType {
  onlineUsers: UserPresence[];
  onlineStudents: UserPresence[];
  onlineCount: number;
  messages: ChatMessage[];
  unreadCount: number;
  isConnected: boolean;
  selectedChatUser: UserPresence | null;
  setSelectedChatUser: (user: UserPresence | null) => void;
  sendMessage: (content: string, recipientId?: string, recipientName?: string, type?: 'public' | 'direct' | 'broadcast') => Promise<void>;
  updateActivity: (currentModuleId?: number, currentModuleName?: string, currentTab?: string, status?: 'online' | 'coding' | 'exam' | 'idle') => void;
  resetUnreadCount: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, currentStudent, teacherUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [selectedChatUser, setSelectedChatUser] = useState<UserPresence | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const heartbeatIntervalRef = useRef<any>(null);

  // Ambil data identitas saat ini
  const currentUser: UserPresence | null = React.useMemo(() => {
    if (role === 'GURU' && teacherUser) {
      return {
        id: 'guru-simon',
        name: 'Simon Murd',
        role: 'GURU',
        school: 'SMK NEGERI 1 SINGKAWANG',
        className: 'Pengampu KKA',
        status: 'online',
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
    }
    if (role === 'SISWA' && currentStudent) {
      return {
        id: currentStudent.id,
        name: currentStudent.name,
        role: 'SISWA',
        school: currentStudent.school,
        className: currentStudent.className,
        noAbsen: currentStudent.noAbsen,
        status: 'online',
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
    }
    return null;
  }, [role, currentStudent, teacherUser]);

  // Connect WebSocket & Initial Sync
  useEffect(() => {
    if (!currentUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);

          // Announce login
          ws.send(JSON.stringify({
            type: 'auth:login',
            user: currentUser
          }));
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'init:sync') {
              if (Array.isArray(data.users)) {
                setOnlineUsers(data.users);
              }
              if (Array.isArray(data.recentMessages)) {
                setMessages(data.recentMessages);
              }
            } else if (data.type === 'presence:update') {
              if (Array.isArray(data.users)) {
                setOnlineUsers(data.users);
              }
            } else if (data.type === 'chat:new') {
              const newMsg = data.message as ChatMessage;
              if (newMsg) {
                setMessages((prev) => {
                  // Idempotent: avoid duplicates
                  if (prev.some((m) => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });

                // Increase unread count if sent by someone else
                if (newMsg.senderId !== currentUser.id) {
                  setUnreadCount((c) => c + 1);
                }
              }
            }
          } catch (e) {
            console.error('Realtime WS parsing error:', e);
          }
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          // Try reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        };
      } catch (err) {
        console.warn('WebSocket connection not available, falling back to HTTP polling:', err);
      }
    };

    connectWebSocket();

    // BroadcastChannel for static GitHub Pages & cross-tab syncing without backend
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('kka_live_channel');
        broadcastChannel.onmessage = (event) => {
          if (!isMounted) return;
          const { type, payload } = event.data || {};
          if (type === 'BC_PRESENCE_HEARTBEAT' && payload) {
            setOnlineUsers((prev) => {
              const existingIdx = prev.findIndex((u) => u.id === payload.id);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = { ...next[existingIdx], ...payload, lastActive: new Date().toISOString() };
                return next;
              } else {
                return [...prev, { ...payload, lastActive: new Date().toISOString() }];
              }
            });
          } else if (type === 'BC_CHAT_MESSAGE' && payload) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
            if (payload.senderId !== currentUser.id) {
              setUnreadCount((c) => c + 1);
            }
          }
        };

        // Broadcast current user presence immediately
        broadcastChannel.postMessage({
          type: 'BC_PRESENCE_HEARTBEAT',
          payload: { ...currentUser, ...latestActivityRef.current }
        });
      }
    } catch {
      // BroadcastChannel optional fallback
    }

    // Set connected to true for static GitHub Pages presence
    setIsConnected(true);

    // Regular HTTP heartbeat & polling fallback (runs every 6 seconds)
    heartbeatIntervalRef.current = setInterval(async () => {
      if (!isMounted || !currentUser) return;

      // Broadcast heartbeat cross-tab
      if (broadcastChannel) {
        broadcastChannel.postMessage({
          type: 'BC_PRESENCE_HEARTBEAT',
          payload: { ...currentUser, ...latestActivityRef.current }
        });
      }

      try {
        // Send heartbeat with latest active module & tab
        await fetch('/api/live/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentUser,
            ...latestActivityRef.current
          })
        });

        // Pull presence list
        const resPres = await fetch('/api/live/presence');
        if (resPres.ok) {
          const pData = await resPres.json();
          if (Array.isArray(pData.users)) {
            setOnlineUsers(pData.users);
          }
        }

        // Pull chat messages
        const resChat = await fetch(`/api/live/chat?userId=${currentUser.id}&role=${currentUser.role}`);
        if (resChat.ok) {
          const cData = await resChat.json();
          if (Array.isArray(cData.messages)) {
            setMessages(cData.messages);
          }
        }
      } catch {
        // Fallback for static hosts (GitHub Pages) where /api doesn't exist
      }
    }, 6000);

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (broadcastChannel) {
        try {
          broadcastChannel.close();
        } catch {}
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [currentUser]);

  const latestActivityRef = useRef<{
    currentModuleId?: number;
    currentModuleName?: string;
    currentTab?: string;
    status: 'online' | 'coding' | 'exam' | 'idle';
  }>({ status: 'online' });

  // Update Activity (Module, Tab, Status)
  const updateActivity = useCallback((
    currentModuleId?: number,
    currentModuleName?: string,
    currentTab?: string,
    status: 'online' | 'coding' | 'exam' | 'idle' = 'online'
  ) => {
    if (!currentUser) return;

    latestActivityRef.current = {
      currentModuleId,
      currentModuleName,
      currentTab,
      status
    };

    const payload = {
      type: 'presence:status',
      userId: currentUser.id,
      currentModuleId,
      currentModuleName,
      currentTab,
      status
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    }

    // Also update server via REST
    fetch('/api/live/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...currentUser,
        currentModuleId,
        currentModuleName,
        currentTab,
        status,
        lastActive: new Date().toISOString()
      })
    }).catch(() => {});
  }, [currentUser]);

  // Send Message
  const sendMessage = useCallback(async (
    content: string,
    recipientId: string = 'all',
    recipientName?: string,
    type: 'public' | 'direct' | 'broadcast' = 'public'
  ) => {
    if (!currentUser || !content.trim()) return;

    const msgPayload: ChatMessage = {
      id: `client-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderClass: currentUser.className,
      recipientId,
      recipientName,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      type
    };

    // Optimistic update
    setMessages((prev) => [...prev, msgPayload]);

    // Broadcast cross-tab (supports static GitHub Pages)
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kka_live_channel');
        bc.postMessage({ type: 'BC_CHAT_MESSAGE', payload: msgPayload });
        bc.close();
      }
    } catch {}

    // Send via WebSocket if connected
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'chat:send',
        message: msgPayload
      }));
    }

    // Also POST via HTTP to guarantee persistence
    try {
      await fetch('/api/live/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload)
      });
    } catch (err) {
      console.error('Failed to send chat via HTTP:', err);
    }
  }, [currentUser]);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const onlineStudents = React.useMemo(() => {
    return onlineUsers.filter((u) => u.role === 'SISWA');
  }, [onlineUsers]);

  return (
    <RealtimeContext.Provider
      value={{
        onlineUsers,
        onlineStudents,
        onlineCount: onlineUsers.length,
        messages,
        unreadCount,
        isConnected,
        selectedChatUser,
        setSelectedChatUser,
        sendMessage,
        updateActivity,
        resetUnreadCount
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};
