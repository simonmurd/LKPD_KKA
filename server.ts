import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'AIza-dummy-key-for-init',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ================= REAL-TIME PRESENCE & LIVE CHAT STATE =================

export interface UserPresence {
  id: string; // student ID or teacher username
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

// In-memory state
const onlineUsers = new Map<string, UserPresence>();
const socketUserMap = new Map<WebSocket, string>();

const chatMessages: ChatMessage[] = [
  {
    id: 'msg-init-1',
    senderId: 'guru-simon',
    senderName: 'Simon Murd (Guru Mapel)',
    senderRole: 'GURU',
    senderClass: 'Pengampu KKA',
    recipientId: 'all',
    content: 'Selamat datang di Ruang Live Chat KKA SMK. Seluruh aktivitas koding dan asesmen terpantau secara real-time. Jika ada kesulitan atau pertanyaan mengenai modul dan ujian CBT, silakan tanyakan langsung di sini!',
    timestamp: new Date().toISOString(),
    type: 'broadcast'
  }
];

let globalWss: WebSocketServer | null = null;

function broadcastPresence() {
  if (!globalWss) return;
  const usersList = Array.from(onlineUsers.values());
  const payload = JSON.stringify({
    type: 'presence:update',
    users: usersList,
    onlineCount: usersList.length,
    timestamp: new Date().toISOString()
  });

  globalWss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastChatMessage(msg: ChatMessage) {
  if (!globalWss) return;
  const payload = JSON.stringify({
    type: 'chat:new',
    message: msg
  });

  globalWss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      const clientUserId = socketUserMap.get(client);
      // Send if public/broadcast, or if client is sender, or if client is recipient, or if client is teacher
      if (
        msg.recipientId === 'all' ||
        msg.type === 'broadcast' ||
        clientUserId === msg.senderId ||
        clientUserId === msg.recipientId ||
        clientUserId?.startsWith('guru')
      ) {
        client.send(payload);
      }
    }
  });
}

// ================= REST API ROUTES FOR LIVE PRESENCE & CHAT =================

// 1. Get Live Presence
app.get('/api/live/presence', (_req: Request, res: Response) => {
  return res.json({
    users: Array.from(onlineUsers.values()),
    onlineCount: onlineUsers.size,
    timestamp: new Date().toISOString()
  });
});

// 2. Post Heartbeat / Update Presence
app.post('/api/live/presence', (req: Request, res: Response) => {
  const user = req.body as UserPresence;
  if (!user || !user.id) {
    return res.status(400).json({ error: 'Data identitas user tidak valid.' });
  }

  const existing = onlineUsers.get(user.id);
  const updatedUser: UserPresence = {
    ...user,
    loginTime: existing?.loginTime || user.loginTime || new Date().toISOString(),
    lastActive: new Date().toISOString()
  };

  onlineUsers.set(user.id, updatedUser);
  broadcastPresence();

  return res.json({ success: true, user: updatedUser });
});

// 3. User Logout / Offline announcement
app.post('/api/live/logout', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId && onlineUsers.has(userId)) {
    onlineUsers.delete(userId);
    broadcastPresence();
  }
  return res.json({ success: true });
});

// 4. Get Chat Messages
app.get('/api/live/chat', (req: Request, res: Response) => {
  const { userId, role } = req.query;
  
  if (role === 'GURU') {
    // Teachers see all messages
    return res.json({ messages: chatMessages });
  }

  // Students see public/broadcast messages and messages specifically for or from them
  const filtered = chatMessages.filter(
    (m) =>
      m.recipientId === 'all' ||
      m.type === 'broadcast' ||
      m.senderId === userId ||
      m.recipientId === userId
  );

  return res.json({ messages: filtered });
});

// 5. Post New Chat Message
app.post('/api/live/chat', (req: Request, res: Response) => {
  const { senderId, senderName, senderRole, senderClass, recipientId, recipientName, content, type } = req.body;

  if (!content || !content.trim() || !senderId || !senderName) {
    return res.status(400).json({ error: 'Konten pesan atau pengirim tidak valid.' });
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    senderId,
    senderName,
    senderRole: senderRole || 'SISWA',
    senderClass,
    recipientId: recipientId || 'all',
    recipientName,
    content: content.trim(),
    timestamp: new Date().toISOString(),
    type: type || (recipientId && recipientId !== 'all' ? 'direct' : 'public')
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 300) {
    chatMessages.shift();
  }

  broadcastChatMessage(newMsg);
  return res.json({ success: true, message: newMsg });
});

// ================= TEACHER AI ASSISTANT ROUTES =================

// Teacher AI Assistant Chatbot API Endpoint
app.post('/api/teacher-chat', async (req: Request, res: Response) => {
  try {
    const { messages, selectedModuleInfo } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Format pesan tidak valid. Array pesan dibutuhkan.' });
    }

    const systemInstruction = `Anda adalah "DevCore Guru AI" — Asisten Cerdas Khusus Guru Pengampu mata pelajaran Koding dan Kecerdasan Artifisial (KKA) di SMK (jurusan Teknik Jaringan Komputer & Telekomunikasi [TJKT] serta Rekayasa Perangkat Lunak [RPL]).

Konteks Platform:
Platform ini memiliki 24 Modul Pembelajaran KKA berbasis HTML5 Canvas 2D & JavaScript interaktif, dari koordinat dasar hingga Machine Learning KNN, Neuro-Evolution Flappy Bird, dan Game Jaringan 2D State Synchronization.
Ada 106 siswa dari SMK Negeri 1 Singkawang dan SMK Mudita Singkawang yang sedang menempuh kurikulum ini.

Peran & Tanggung Jawab Utama:
1. Membantu Guru merancang Modul Ajar (RPP), Alur Tujuan Pembelajaran (ATP), dan skenario praktikum kelas.
2. Membantu Guru menyusun butir soal evaluasi baru (Pilihan Ganda Biasa, PG Kompleks berbobot, Studi Kasus, atau Soal Essay Koding) lengkap dengan kunci jawaban dan rubrik penilaian.
3. Memberikan analisis kendala koding siswa SMK (Canvas 2D, loop, AABB collision, vector math, state machine, AI algoritma).
4. Memberikan ide proyek kreatif, game logika komputasional, atau tantangan koding berjenjang.
5. Membantu guru membuat materi remedial bagi siswa yang tertinggal dan materi pengayaan bagi siswa yang cepat paham.

Pedoman Gaya Bahasa:
- Gunakan Bahasa Indonesia yang santun, profesional, ramah, dan solutif.
- Jika memberikan kode, berikan kode JavaScript yang bersih, berikan komentar penjelasan, dan gunakan paradigma yang ramah anak SMK.
- Gunakan format markdown rapi dengan bullet points, headers, dan block code jika menampilkan struktur modul atau kode.`;

    // Map conversation history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If teacher attached specific module info as context, inject to the last prompt or prompt context
    if (selectedModuleInfo && contents.length > 0) {
      const lastItem = contents[contents.length - 1];
      const contextPrefix = `[Konteks Modul Terpilih Guru: Modul ${selectedModuleInfo.id} - ${selectedModuleInfo.title} (${selectedModuleInfo.domainCategory})]\n`;
      lastItem.parts[0].text = contextPrefix + lastItem.parts[0].text;
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: 'Halo Pak Simon! Kunci API Gemini belum disetel pada server. Anda tetap dapat menggunakan seluruh 24 modul koding, CBT Exam Center, dan rekap nilai secara offline/penuh. Untuk mengaktifkan obrolan AI ini, pasang variabel GEMINI_API_KEY di environment.'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const replyText = response.text || 'Maaf, saya tidak dapat menghasilkan respon saat ini.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Teacher Chatbot Error:', error);
    return res.status(500).json({
      error: error.message || 'Terjadi kesalahan pada server saat menghubungi asisten AI.',
    });
  }
});

// Quick question/quiz generator endpoint for teacher
app.post('/api/teacher-generate-quiz', async (req: Request, res: Response) => {
  try {
    const { moduleId, moduleTitle, topic, questionType } = req.body;

    const prompt = `Buatkan 1 butir soal latihan baru yang berkualitas tinggi untuk Modul ${moduleId}: ${moduleTitle} (Topik: ${topic || 'Konsep Koding & AI'}).
Tipe Soal yang diminta: ${questionType || 'PG Biasa'}.
Formatkan hasilnya dalam bentuk rapi:
1. Butir Pertanyaan
2. Pilihan Jawaban (jika PG)
3. Kunci Jawaban
4. Penjelasan / Pembahasan Teknis
5. Cuplikan Kode Solusi (jika ada)
6. Kaitan dengan Kompetensi SMK (TJKT/RPL)`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        result: `Contoh Soal Latihan (Mode Standar):\n1. Pertanyaan: Perhatikan kode berikut pada Modul ${moduleId}...\n2. Kunci: B\n3. Pembahasan: Logika komputasional memerlukan penataan fungsi secara modular.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah pakar kurikulum Koding & Kecerdasan Artifisial (KKA) SMK. Buat soal yang mendidik dan menguji logika komputasional.',
      },
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('Quiz Gen Error:', error);
    return res.status(500).json({
      error: error.message || 'Gagal menghasilkan soal latihan.',
    });
  }
});

// Setup Vite dev server or serve production dist
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = http.createServer(app);

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please check running processes.`);
    } else {
      console.error('HTTP server error:', err);
    }
  });

  // Initialize WebSocketServer attached to the HTTP server
  const wss = new WebSocketServer({ server, path: '/ws' });
  globalWss = wss;

  wss.on('error', (err) => {
    console.error('WebSocketServer instance error:', err);
  });

  wss.on('connection', (ws: WebSocket) => {
    // Send immediate initial sync
    const initPayload = JSON.stringify({
      type: 'init:sync',
      users: Array.from(onlineUsers.values()),
      onlineCount: onlineUsers.size,
      recentMessages: chatMessages.slice(-50),
      timestamp: new Date().toISOString()
    });
    ws.send(initPayload);

    ws.on('message', (data: string) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'auth:login') {
          const user = payload.user as UserPresence;
          if (user && user.id) {
            socketUserMap.set(ws, user.id);
            onlineUsers.set(user.id, {
              ...user,
              loginTime: user.loginTime || new Date().toISOString(),
              lastActive: new Date().toISOString()
            });
            broadcastPresence();
          }
        } else if (payload.type === 'presence:status') {
          const userId = socketUserMap.get(ws) || payload.userId;
          if (userId && onlineUsers.has(userId)) {
            const current = onlineUsers.get(userId)!;
            onlineUsers.set(userId, {
              ...current,
              currentModuleId: payload.currentModuleId ?? current.currentModuleId,
              currentModuleName: payload.currentModuleName ?? current.currentModuleName,
              currentTab: payload.currentTab ?? current.currentTab,
              status: payload.status ?? current.status,
              lastActive: new Date().toISOString()
            });
            broadcastPresence();
          }
        } else if (payload.type === 'chat:send') {
          const msg = payload.message as ChatMessage;
          if (msg && msg.content && msg.content.trim()) {
            const newMsg: ChatMessage = {
              ...msg,
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              timestamp: new Date().toISOString()
            };
            chatMessages.push(newMsg);
            if (chatMessages.length > 300) chatMessages.shift();
            broadcastChatMessage(newMsg);
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      const userId = socketUserMap.get(ws);
      if (userId) {
        socketUserMap.delete(ws);
        // Only remove if this was the last socket for this user
        let hasOtherSocket = false;
        for (const [sock, uId] of socketUserMap.entries()) {
          if (uId === userId && sock.readyState === WebSocket.OPEN) {
            hasOtherSocket = true;
            break;
          }
        }
        if (!hasOtherSocket) {
          onlineUsers.delete(userId);
          broadcastPresence();
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
    });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server DevCore KKA with Live WebSockets running at http://0.0.0.0:${port}`);
  });
}

startServer();
