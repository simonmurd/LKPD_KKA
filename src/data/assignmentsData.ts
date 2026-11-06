/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Data Tugas & Praktik KKA SMK (Teacher Assignments)
 * Diberikan oleh Guru (Simon Murd, S.Kom) untuk siswa SMK Negeri 1 Singkawang
 */

export interface Assignment {
  id: string;
  code: string;
  title: string;
  description: string;
  taskType?: 'coding' | 'cbt'; // 'coding' = Praktik Koding Lab, 'cbt' = Ujian CBT / Kuis Modul
  moduleScope?: 'single' | 'all'; // 'single' = Per Modul / Part Tertentu, 'all' = Seluruh Modul (1-24)
  moduleId: number;
  moduleCode: string;
  assignedDate: string;
  dueDate: string;
  targetCriteria: string;
  maxScore: number;
  targetClass?: string; // 'SEMUA KELAS' | 'X TJK' | 'XI TJK' | 'XI TJKT'
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentAbsen?: string;
  submittedAt: string;
  notes?: string;
  submittedCode?: string; // Kodingan siswa yang dikirim langsung dari Lab Koding
  status: 'submitted' | 'graded' | 'needs_revision';
  score?: number;
  grade?: 'A' | 'B' | 'C' | 'D';
  teacherFeedback?: string;
  speedCategory?: string;
}

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'tugas-1',
    code: 'TUGAS-01',
    title: 'Praktik 1: Eksplorasi Kanvas & Koordinat Grafis',
    description: 'Buka Lab Koding Modul 1. Jalankan kode simulasi kanvas rumah dan pemandangan, modifikasi warna langit atau posisi matahari, lalu kumpulkan hasil simulasi Anda.',
    moduleId: 1,
    moduleCode: 'MODUL-01',
    assignedDate: '2026-11-01',
    dueDate: '2026-11-08',
    targetCriteria: 'Rendering kanvas visual 2D, pemahaman koordinat X & Y, dan kode berjalan tanpa error.',
    maxScore: 100
  },
  {
    id: 'tugas-2',
    code: 'TUGAS-02',
    title: 'Praktik 2: Efisiensi Kode Modular & Perulangan Loop',
    description: 'Buka Lab Koding Modul 2. Buat fungsi modular gambarPohon(x, y) dan implementasikan for-loop untuk merender bintang malam acak secara efisien.',
    moduleId: 2,
    moduleCode: 'MODUL-02',
    assignedDate: '2026-11-03',
    dueDate: '2026-11-10',
    targetCriteria: 'Penerapan konsep DRY (Don\'t Repeat Yourself), fungsi modular berparameter, dan loop bintang.',
    maxScore: 100
  },
  {
    id: 'tugas-3',
    code: 'TUGAS-03',
    title: 'Praktik 3: Animasi Game Loop & Gerak Dinamis',
    description: 'Buka Lab Koding Modul 3. Jalankan siklus requestAnimationFrame, amati pergerakan bola memantul (bouncing ball) dengan variabel kecepatan dinamis.',
    moduleId: 3,
    moduleCode: 'MODUL-03',
    assignedDate: '2026-11-05',
    dueDate: '2026-11-12',
    targetCriteria: 'Animasi kontinu halus 60 FPS, delta time, dan pembersihan kanvas (clearRect).',
    maxScore: 100
  },
  {
    id: 'tugas-4',
    code: 'TUGAS-04',
    title: 'Praktik 4: Kontrol Interaktif Keyboard & Mouse',
    description: 'Buka Lab Koding Modul 4. Sambungkan event listener keydown dan mousemove untuk mengendalikan pesawat karakter pemain melintasi layar kanvas.',
    moduleId: 4,
    moduleCode: 'MODUL-04',
    assignedDate: '2026-11-07',
    dueDate: '2026-11-15',
    targetCriteria: 'Responsivitas kontrol tombol panah / WASD dan batasan area layar (clamping).',
    maxScore: 100
  },
  {
    id: 'tugas-5',
    code: 'TUGAS-05',
    title: 'Praktik 5: Logika Tabrakan (AABB Collision Detection)',
    description: 'Buka Lab Koding Modul 5. Terapkan algoritma deteksi benturan Axis-Aligned Bounding Box antara karakter pemain dan rintangan game.',
    moduleId: 5,
    moduleCode: 'MODUL-05',
    assignedDate: '2026-11-10',
    dueDate: '2026-11-18',
    targetCriteria: 'Akurasi deteksi tabrakan koordinat persegi dan perubahan skor ketika terjadi sentuhan.',
    maxScore: 100
  }
];
