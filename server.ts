import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server DevCore KKA running at http://0.0.0.0:${port}`);
  });
}

startServer();
