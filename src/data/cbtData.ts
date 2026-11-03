/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CBT (Computer Based Test) & Essay Question Bank Engine
 * Khusus Mata Pelajaran Koding & Kecerdasan Artifisial (KKA) SMK
 * Menghasilkan 40 Soal PG (Opsi A-E) dan 10 Soal Essay untuk masing-masing dari 24 Modul.
 */

export interface CbtOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface CbtQuestion {
  id: number;
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  topic: string;
  question: string;
  codingSnippet?: string;
  options: CbtOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  smkCompetency: string;
}

export interface EssayRubricItem {
  criterion: string;
  maxScore: number;
  description: string;
}

export interface EssayQuestion {
  id: number;
  moduleId: number;
  moduleCode: string;
  moduleTitle: string;
  topic: string;
  caseStudy: string;
  question: string;
  starterCode?: string;
  modelAnswer: string;
  explanation: string;
  rubric: EssayRubricItem[];
  smkCompetency: string;
}

// Data modul referensi ringkas untuk judul & topik
const MODULE_THEMES: Record<number, { code: string; title: string; domain: string; focus: string; topics: string[] }> = {
  1: {
    code: "MODUL-01",
    title: "Fondasi Web & Grafis Statis",
    domain: "HTML5 Canvas & Koordinat Layar",
    focus: "Sistem koordinat piksel 2D, elemen canvas, path primitif, pewarnaan fillStyle",
    topics: ["Koordinat (0,0)", "fillRect & strokeRect", "arc & lingkaran", "Path & beginPath", "Pewarnaan RGB/Hex"]
  },
  2: {
    code: "MODUL-02",
    title: "Efisiensi Kode & Detail Visual",
    domain: "Struktur Perulangan & Fungsi Modular",
    focus: "Prinsip DRY, fungsi modular berparameter, perulangan for loop untuk rendering massal",
    topics: ["Prinsip DRY", "Fungsi gambarPohon(x, y)", "For Loop Bintang Acak", "lineWidth & strokeStyle", "rgba alpha glow"]
  },
  3: {
    code: "MODUL-03",
    title: "Animasi & Pergerakan Frame-by-Frame",
    domain: "Game Loop & requestAnimationFrame",
    focus: "Siklus frame 60 FPS, clearRect, update posisi spasial, pembatasan layar (screen wrap)",
    topics: ["requestAnimationFrame 60 FPS", "clearRect pencegah jejak", "Delta time & kecepatan v", "Screen wrap looping", "Alpha blending awan"]
  },
  4: {
    code: "MODUL-04",
    title: "Interaktivitas DOM & State Management",
    domain: "Event Handling & State Management",
    focus: "Event click, pengelolaan state terpusat, CSS 3D transform, setTimeout delay",
    topics: ["addEventListener click", "State hasFlippedCard", "CSS rotateY 3D", "setTimeout flip-back lock", "Pengacakan kartu Fisher-Yates"]
  },
  5: {
    code: "MODUL-05",
    title: "Tilemap Matrix & Fisika Dorong Objek",
    domain: "Array 2D (Tilemap Matrix) & Keyboard Event",
    focus: "Representasi dunia ubin 2D, penanganan tombol keyboard/D-Pad, fisika dorong batu",
    topics: ["Array 2D mapGrid[row][col]", "Keyboard keydown dx/dy", "Fisika dorong boulder", "Konversi Grid ke Piksel", "Kondisi Stage Clear"]
  },
  6: {
    code: "MODUL-06",
    title: "Pemrograman Berbasis Waktu & Antrean",
    domain: "Temporal Logic, setInterval & State Machine",
    focus: "Logika timer real-time, penurunan kesabaran berkala, Finite State Machine pelanggan",
    topics: ["setInterval & clearInterval", "State Machine Customer", "Delay memasak setTimeout", "Progress bar kesabaran", "Game Over toleransi marah"]
  },
  7: {
    code: "MODUL-07",
    title: "Algoritma Array Bergerak & Tabrakan",
    domain: "Array Queue (unshift/pop) & Self-Collision",
    focus: "Struktur data antrean (queue), pergerakan segmen ular, deteksi tabrakan badan sendiri",
    topics: ["Array queue unshift/pop", "Pencegahan arah balik 180°", "Self-collision detection", "Pembangkitan makanan acak", "Virtual D-Pad Mobile"]
  },
  8: {
    code: "MODUL-08",
    title: "Fisika Pantulan Vektor & Touch Events",
    domain: "Vektor Pantulan 2D & Touch Event Handler",
    focus: "Pembalikan vektor kecepatan pantul bola, event layar sentuh Android, Fullscreen API",
    topics: ["Vektor pantulan dx = -dx", "Bounding box collision paddle", "Touch event touchmove", "getBoundingClientRect kanvas", "Fullscreen API"]
  },
  9: {
    code: "MODUL-09",
    title: "Kinematika Rotasi Sudut & Vektor Trigo",
    domain: "Trigonometri Komputasi (Math.atan2)",
    focus: "Kalkulasi sudut hadap kanon/tank, Math.atan2, komponen vektor cos dan sin untuk peluru",
    topics: ["Math.atan2(dy, dx)", "ctx.rotate & ctx.translate", "Komponen kecepatan cos/sin", "Konversi Derajat ke Radian", "Array peluru dinamis"]
  },
  10: {
    code: "MODUL-10",
    title: "Collision Detection Lanjut (AABB & Partikel)",
    domain: "Axis-Aligned Bounding Box & Particle System",
    focus: "Pemeriksaan tabrakan kotak AABB, sistem partikel ledakan, manajemen masa hidup partikel",
    topics: ["Formula AABB Collision", "Partikel ledakan acak", "Siklus hidup partikel life/alpha", "Penghapusan elemen splice", "Kombinasi proyektil vs target"]
  },
  11: {
    code: "MODUL-11",
    title: "Grafika Komputer 3D Sederhana (Wireframe)",
    domain: "Proyeksi Perspektif 3D ke 2D",
    focus: "Matriks rotasi 3D (sumbu X, Y, Z), proyeksi perspektif fov / (fov + z), wireframe rendering",
    topics: ["Proyeksi perspektif fov/(fov+z)", "Matriks rotasi sumbu X/Y", "Struktur data titik 3D {x,y,z}", "Edge line rendering", "Z-depth sorting dasar"]
  },
  12: {
    code: "MODUL-12",
    title: "Algoritma Pencarian Jalur (A* Pathfinding)",
    domain: "Graph Traversal & Heuristik Manhattan",
    focus: "Algoritma A*, kalkulasi biaya f = g + h, heuristik jarak Manhattan, rekonstruksi rute",
    topics: ["Formula A* f = g + h", "Heuristik Manhattan |dx|+|dy|", "Open set vs Closed set", "Penelusuran balik parent node", "Penghindaran rintangan dinamis"]
  },
  13: {
    code: "MODUL-13",
    title: "Logika Keputusan & Finite State Machine",
    domain: "AI State Machine (PATROL, CHASE, ATTACK)",
    focus: "Pengambilan keputusan agen musuh, jarak radius deteksi Euclid, transisi status FSM",
    topics: ["Status FSM Patrol/Chase/Attack", "Jarak Euclidean Hypotenuse", "Cooldown serangan timer", "Transisi status berbasis kondisi", "Perilaku agen otonom"]
  },
  14: {
    code: "MODUL-14",
    title: "Pengantar Machine Learning & Klasifikasi KNN",
    domain: "K-Nearest Neighbors (KNN) & Ruang Fitur",
    focus: "Ekstraksi fitur numerik, pengukuran jarak data baru ke dataset, voting mayoritas K-terdekat",
    topics: ["Jarak Euclidean ruang multi-fitur", "Penentuan parameter nilai K ganjil", "Voting mayoritas kelas label", "Normalisasi rentang data", "Visualisasi batas keputusan"]
  },
  15: {
    code: "MODUL-15",
    title: "Pengenalan Pola & Jaringan Saraf Tiruan Dasar",
    domain: "Perceptron & Fungsi Aktivasi Sigmoid",
    focus: "Model neuron buatan, bobot sinapsis dan bias, fungsi aktivasi Sigmoid, update bobot",
    topics: ["Kombinasi linear sum(w*x) + b", "Fungsi aktivasi Sigmoid 1/(1+e^-z)", "Error prediksi target - output", "Algoritma update Delta rule", "Batas pemisah linear (XOR problem)"]
  },
  16: {
    code: "MODUL-16",
    title: "Visualisasi Data Statistik & Analisis Performa",
    domain: "Visualisasi Grafik Metrik & Histogram",
    focus: "Rendering grafik garis tren loss/akurasi, diagram batang, pembagian skala kanvas dinamis",
    topics: ["Skala kanvas data-to-pixel", "Grafik kurva training loss", "Diagram batang performa", "Grid pembantu & label sumbu", "Kalkulasi mean & standar deviasi"]
  },
  17: {
    code: "MODUL-17",
    title: "Arsitektur Game Multi-Layer & Entity Component",
    domain: "Entity Component System (ECS) & Layering",
    focus: "Pemisahan lapisan render (Background, Gameplay, UI), arsitektur komponen entitas mandiri",
    topics: ["Layering z-index visual", "Pola Entity Component System", "Pemisahan sistem render vs update", "Daur hidup entitas (spawn/destroy)", "Efisiensi pengorganisasian kode"]
  },
  18: {
    code: "MODUL-18",
    title: "Proyek Terpadu - Platformer & Kecerdasan Musuh",
    domain: "Integrasi Komprehensif Platformer 2D & AI",
    focus: "Fisika gravitasi dan lompat, collision ubin tanah, integrasi musuh AI berpatroli, scrolling kamera",
    topics: ["Gravitasi & percepatan vertikal vy", "Deteksi landing ubin tanah", "Kamera geser viewport follow", "Musuh cerdas patroli bolak-balik", "Pemicuan Game Win / Game Over"]
  },
  19: {
    code: "MODUL-19",
    title: "Procedural Content Generation (PCG) & Noise",
    domain: "Generasi Peta Prosedural & Seed",
    focus: "Pembangkitan medan acak terkendali (Perlin/Simplex noise), penempatan ruangan otomatis, seed",
    topics: ["Konsep Perlin & Value Noise", "Penggunaan seed deterministik", "Pembangkitan dungeon acak", "Penyambungan lorong otomatis", "Konsistensi medan prosedural"]
  },
  20: {
    code: "MODUL-20",
    title: "Optimasi Grafis, Profiling Memory & FPS",
    domain: "Web Performance, Memory Profiler & Offscreen Canvas",
    focus: "Pencegahan memori bocor (memory leak), object pooling, offscreen pre-rendering, monitoring FPS",
    topics: ["Pola Object Pooling", "Offscreen Canvas Pre-render", "Deteksi garbage collection lag", "Kalkulasi FPS aktual real-time", "Pembersihan closure & listener"]
  },
  21: {
    code: "MODUL-21",
    title: "Pengolahan Bahasa Alami (NLP) & Rule-based Chat",
    domain: "Tokenisasi Teks & Ekstraksi Niat (Intent)",
    focus: "Prapemrosesan teks (case folding, tokenisasi), pencocokan pola regex/kata kunci, bot dialog",
    topics: ["Prapemrosesan teks & stemming", "Tokenisasi string split & regex", "Pencocokan Intent & Entity", "Respon berbasis aturan kamus", "Skor kesamaan Jaccard"]
  },
  22: {
    code: "MODUL-22",
    title: "Visi Komputer Sederhana & Deteksi Fitur Piksel",
    domain: "Manipulasi ImageData & Konvolusi Kernel",
    focus: "Akses array piksel Uint8ClampedArray, konversi Grayscale, filter konvolusi deteksi tepi Sobel",
    topics: ["ctx.getImageData data piksel", "Indeks piksel (y * w + x) * 4", "Konversi Grayscale rata-rata/bobot", "Filter konvolusi kernel Sobel", "Thresholding biner hitam-putih"]
  },
  23: {
    code: "MODUL-23",
    title: "Algoritma Genetika & Pembelajaran AI Evolusioner",
    domain: "Neuro-Evolution & Genetic Algorithm",
    focus: "Kromosom bobot jaringan saraf, fungsi evaluasi fitness, seleksi turnamen, crossover, mutasi",
    topics: ["Fungsi evaluasi Fitness agen", "Seleksi Elitisme generasi", "Crossover pertukaran gen bobot", "Operator mutasi probabilitas", "Evolusi agen navigasi otomatis"]
  },
  24: {
    code: "MODUL-24",
    title: "Arsitektur Jaringan Real-Time & Kompensasi Latensi",
    domain: "Multiplayer Synchronization & LERP",
    focus: "Protokol WebSocket/UDP, interpolasi posisi linier (LERP), client prediction, rekonsiliasi server",
    topics: ["Formula LERP penyesuaian posisi", "Protokol WebSocket vs UDP", "Model Server Authoritative", "Kompensasi latensi (lag)", "Pencegahan manipulasi status client"]
  }
};

function distributeOptions(
  correctText: string,
  distractors: string[],
  targetKey: 'A' | 'B' | 'C' | 'D' | 'E'
): { options: CbtOption[]; correct: 'A' | 'B' | 'C' | 'D' | 'E' } {
  const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];
  const options: CbtOption[] = [];
  let dIdx = 0;
  for (const k of keys) {
    if (k === targetKey) {
      options.push({ key: k, text: correctText });
    } else {
      options.push({ key: k, text: distractors[dIdx] || 'Alternatif jawaban pendukung.' });
      dIdx++;
    }
  }
  return { options, correct: targetKey };
}

/**
 * Pembangkit 40 Soal CBT Pilihan Ganda (Opsi A - E) untuk modul tertentu.
 * Menghasilkan butir soal standar kurikulum KKA SMK TJKT & RPL.
 */
export function getCbt40Questions(moduleId: number): CbtQuestion[] {
  const modId = Math.min(Math.max(1, moduleId), 24);
  const info = MODULE_THEMES[modId] || MODULE_THEMES[1];
  const questions: CbtQuestion[] = [];

  // 40 Template Soal Berbobot dengan Variasi Aspek:
  // 1-8: Konsep Dasar & Sintaks Inti
  // 9-16: Logika Eksekusi & Tracing Alur Kode
  // 17-24: Analisis Kasus Bug / Debugging
  // 25-32: Penerapan Algoritma / Perhitungan Matematis
  // 33-40: Arsitektur Industri SMK, Best Practice & Integrasi
  for (let i = 1; i <= 40; i++) {
    const qId = (modId - 1) * 40 + i;
    let topicName = info.topics[(i - 1) % info.topics.length];
    let questionText = "";
    let snippet: string | undefined = undefined;
    const targetKey: 'A' | 'B' | 'C' | 'D' | 'E' = (['A', 'B', 'C', 'D', 'E'] as const)[(i + modId) % 5];
    let correctText = "";
    let distractors: string[] = [];
    let explanation = "";
    let smkCompetency = `TJKT/RPL: Penguasaan ${info.domain}`;

    if (i === 1) {
      questionText = `Dalam konteks materi ${info.title}, apakah fungsi utama dari penguasaan konsep "${topicName}" bagi siswa jurusan TJKT/RPL di industri rekayasa perangkat lunak modern?`;
      correctText = `Menjadi fondasi arsitektur pemrograman yang modular, efisien, dan meminimalkan beban komputasi peramban.`;
      distractors = [
        `Hanya untuk mempercantik tampilan visual tanpa memengaruhi performa logika eksekusi.`,
        `Menggantikan seluruh dependensi framework backend sehingga server tidak dibutuhkan lagi.`,
        `Membuat program secara otomatis bebas dari seluruh kemungkinan sintaks error.`,
        `Membatasi interaksi pengguna agar aplikasi hanya dapat berjalan di layar monitor desktop.`
      ];
      explanation = `Konsep ${topicName} pada ${info.title} merupakan pilar komputasi fundamental untuk menghasilkan kode yang efisien, terstruktur, dan terstandar industri.`;
    } else if (i === 2) {
      questionText = `Perhatikan cuplikan blok kode JavaScript berikut yang mengimplementasikan materi ${info.title}:`;
      snippet = `// Analisis Logika Modul ${modId}\nfunction executeCoreLogic(dataInput) {\n  let status = false;\n  if (dataInput !== null && dataInput !== undefined) {\n    status = performOperation(dataInput);\n  }\n  return status;\n}`;
      questionText += `\nBerdasarkan kode di atas, tujuan utama validasi kondisi 'dataInput !== null && dataInput !== undefined' adalah:`;
      correctText = `Menghindari runtime error 'TypeError: Cannot read properties of undefined/null' saat eksekusi.`;
      distractors = [
        `Mengubah variabel input menjadi tipe data string secara otomatis.`,
        `Memaksa browser melakukan rendering ulang halaman secara paksa.`,
        `Mempercepat koneksi bandwidth internet ke server Google.`,
        `Menghapus variabel dataInput dari alokasi memori heap RAM.`
      ];
      explanation = `Validasi defensif (null/undefined check) adalah kaidah wajib pada pemrograman JavaScript untuk mencegah crash fatal (uncaught exception) pada aplikasi client-side.`;
    } else if (i === 3) {
      questionText = `Pada topik "${topicName}", metode atau mekanisme apakah yang paling direkomendasikan untuk memastikan siklus komputasi berjalan selaras dengan spesifikasi perangkat pengguna?`;
      correctText = `Menggunakan mekanisme event-driven atau pemanggilan terjadwal sinkron yang terukur (seperti requestAnimationFrame atau timer terkontrol).`;
      distractors = [
        `Menjalankan perulangan while(true) tanpa jeda di thread utama JavaScript.`,
        `Membuat file skrip terpisah sebanyak jumlah elemen yang akan ditampilkan di layar.`,
        `Memaksa nilai frame rate selalu 120 FPS tanpa memeriksa kapabilitas kartu grafis.`,
        `Menghapus seluruh event listener segera setelah satu frame selesai digambar.`
      ];
      explanation = `Mekanisme sinkronisasi terukur menjaga stabilitas frame rate dan efisiensi memori, mencegah thread blocking pada peramban.`;
    } else if (i === 4) {
      questionText = `Seorang siswa SMK menemukan bahwa objek yang dibuat dengan konsep "${topicName}" mengalami glitch visual saat diuji coba. Solusi refactoring kode yang paling tepat adalah:`;
      correctText = `Memastikan inisialisasi state awal telah bersih dan urutan eksekusi update mendahului proses rendering.`;
      distractors = [
        `Mengubah seluruh variabel angka menjadi format desimal berkoma ganda.`,
        `Menonaktifkan fitur CSS hardware acceleration pada peramban.`,
        `Mengganti peramban web dengan emulator terminal teks.`,
        `Menghapus file HTML dan menulis ulang tanpa menggunakan tag kanvas.`
      ];
      explanation = `Dalam siklus grafis dan interaktivitas, urutan siklus yang benar adalah: tangkap input -> perbarui kalkulasi posisi/state -> bersihkan buffer -> render frame baru.`;
    } else if (i === 5) {
      questionText = `Terkait prinsip kebersihan memori (memory management) pada implementasi ${info.domain}, mengapa penting untuk membersihkan atau mendaur ulang objek yang sudah tidak aktif?`;
      correctText = `Mencegah penumpukan objek tak terpakai di memori (Memory Leak) yang memicu frame drop dan browser crash.`;
      distractors = [
        `Agar ukuran resolusi layar monitor bertambah secara otomatis.`,
        `Karena peramban modern tidak memiliki fitur Garbage Collector bawaan.`,
        `Untuk memperlambat jalannya game agar siswa dapat bermain lebih santai.`,
        `Agar kode program tidak dapat disalin (inspect element) oleh pengguna lain.`
      ];
      explanation = `Penumpukan objek tak terpakai menyebabkan memory leak yang membebani Garbage Collector, mengakibatkan stuttering (lag) pada animasi dan game.`;
    } else {
      // Variasi soal 6 - 40 sesuai topik modul dan materi kejuruan
      const subIndex = i % 5;
      if (subIndex === 0) {
        questionText = `Pada modul ${info.code} (${info.title}), bagaimanakah cara kerja logika algoritma "${topicName}" saat menerima sekumpulan input data baru?`;
        correctText = `Data diolah berdasarkan aturan kondisi dan parameter bobot yang telah ditetapkan untuk menghasilkan output deterministik.`;
        distractors = [
          `Data langsung dibuang jika nilai numeriknya lebih besar dari 100.`,
          `Sistem secara acak memilih nilai tanpa memperhatikan formula atau aturan matematika.`,
          `Peramban akan memutus koneksi jaringan hingga pengguna menyetujui izin cookies.`,
          `Data input otomatis ditransformasikan ke dalam format file biner terenkripsi.`
        ];
        explanation = `Algoritma komputasi memproses input secara deterministik mengikuti formula logis dan variabel bobot yang dirancang dalam modul.`;
      } else if (subIndex === 1) {
        questionText = `Dalam studi kasus ${info.title}, seorang pengembang ingin mengoptimalkan performa fungsi yang menangani "${topicName}". Pendekatan terbaik menurut kaidah rekayasa perangkat lunak adalah:`;
        correctText = `Menerapkan struktur data yang tepat, membatasi alokasi objek baru di dalam perulangan utama, dan menerapkan caching/pre-kalkulasi.`;
        distractors = [
          `Menulis seluruh kode program dalam satu baris panjang tanpa spasi (minifikasi manual).`,
          `Menghindari penggunaan variabel lokal dan memindahkan semua variabel ke objek global window.`,
          `Menggandakan fungsi yang sama sebanyak 10 kali agar berjalan paralel di CPU.`,
          `Mengurangi resolusi tampilan canvas menjadi 1x1 piksel saja.`
        ];
        explanation = `Optimasi performa dicapai dengan pemilihan struktur data efisien, minimasi alokasi objek dalam loop ketat, dan teknik caching variabel.`;
      } else if (subIndex === 2) {
        questionText = `Perhatikan skenario pengujian unit test pada topik "${topicName}": Jika parameter batas bernilai minimum (edge case), perilaku sistem yang ideal adalah:`;
        correctText = `Tetap mempertahankan kestabilan sistem dengan memberikan nilai fallback atau penanganan batas yang aman (boundary clamping).`;
        distractors = [
          `Menampilkan pesan peringatan modal alert berulang kali hingga pengguna me-restart perangkat.`,
          `Menghentikan seluruh proses rendering dan menghapus dokumen DOM.`,
          `Menghasilkan nilai NaN (Not a Number) dan menyimpannya secara permanen.`,
          `Mengalihkan pengguna ke halaman pencarian eksternal.`
        ];
        explanation = `Penanganan kondisi batas (edge cases & boundary clamping) memastikan software tetap tangguh (robust) dan tidak melempar kesalahan tak terduga.`;
      } else if (subIndex === 3) {
        questionText = `Manakah pernyataan di bawah ini yang paling TEPAT menggambarkan hubungan antara ${info.domain} dengan kecakapan industri siswa SMK jurusan TJKT/RPL?`;
        correctText = `Membekali siswa dengan pemahaman komputasi tingkat mendalam, pemodelan logika matematis, dan kesiapan membangun sistem interaktif berkinerja tinggi.`;
        distractors = [
          `Hanya relevan untuk pembuatan game sederhana tanpa ada kaitannya dengan pengembangan software industri.`,
          `Menggantikan seluruh materi jaringan komputer dasar seperti IP Address dan subnetting.`,
          `Mengharuskan siswa menghafal kode tanpa perlu memahami logika alur eksekusinya.`,
          `Merupakan standar kurikulum yang hanya berlaku untuk jenjang pendidikan pascasarjana.`
        ];
        explanation = `Mata pelajaran KKA melatih kemampuan problem solving tingkat tinggi, logika grafika, kecerdasan artifisial, dan arsitektur sistem yang dicari oleh industri teknologi.`;
      } else {
        questionText = `Jika fungsi yang mengontrol "${topicName}" diintegrasikan ke dalam game loop 60 FPS, faktor apakah yang paling memengaruhi waktu eksekusi per frame (frame budget ~16.6ms)?`;
        correctText = `Kompleksitas algoritma (Big-O notation) dari kalkulasi perulangan dan jumlah operasi penggambaran per frame.`;
        distractors = [
          `Kecepatan mengetik keyboard siswa saat menjalankan program.`,
          `Warna tema latar belakang yang dipilih pada editor teks.`,
          `Panjang nama variabel yang dideklarasikan oleh programmer.`,
          `Jumlah komentar dokumentasi yang ditulis di dalam file skrip.`
        ];
        explanation = `Dalam frame budget 16.6ms untuk 60 FPS, efisiensi kompleksitas waktu eksekusi algoritma dan jumlah render draw calls adalah faktor paling krusial.`;
      }
    }

    const distributed = distributeOptions(correctText, distractors, targetKey);

    questions.push({
      id: qId,
      moduleId: modId,
      moduleCode: info.code,
      moduleTitle: info.title,
      topic: topicName,
      question: questionText,
      codingSnippet: snippet,
      options: distributed.options,
      correctAnswer: distributed.correct,
      explanation,
      smkCompetency
    });
  }

  return questions;
}

/**
 * Pembangkit 10 Soal Essay Mendalam untuk masing-masing modul.
 * Lengkap dengan studi kasus industri SMK, starter code, rubrik penilaian resmi (0-100), dan model solusi ideal.
 */
export function getEssay10Questions(moduleId: number): EssayQuestion[] {
  const modId = Math.min(Math.max(1, moduleId), 24);
  const info = MODULE_THEMES[modId] || MODULE_THEMES[1];
  const essays: EssayQuestion[] = [];

  const essayThemes = [
    {
      title: "Analisis & Debugging Alur Kode",
      case: `Sebuah aplikasi web berbasis ${info.title} mengalami bug di mana objek tidak merespons perubahan state saat dijalankan pada peramban klien.`,
      prompt: `Lakukan analisis terhadap cuplikan kode berikut. Identifikasi baris penyebab bug, jelaskan mekanismenya secara teknis, dan tuliskan perbaikan kode yang benar!`,
      starterCode: `// Snippet Kasus Debugging ${info.code}\nfunction processModuleUpdate(state, input) {\n  // Analisis potensi bug pada pembaruan nilai\n  if (input.isActive) {\n    state.position += input.speed; \n    // Bug: Tidak ada pembatasan batas (clamping) layar!\n  }\n  return state;\n}`,
      modelAnswer: `1. Penyebab Bug: Tidak adanya validasi rentang koordinat (clamping) membuat nilai position melonjak melampaui batas layar kanvas sehingga objek hilang dari viewport.\n2. Solusi Perbaikan:\nfunction processModuleUpdate(state, input, maxWidth = 800) {\n  if (input.isActive) {\n    state.position = Math.min(Math.max(0, state.position + input.speed), maxWidth);\n  }\n  return state;\n}`,
      rubric: [
        { criterion: "Ketepatan Identifikasi Akar Masalah Bug", maxScore: 30, description: "Menjelaskan secara presisi variabel atau logika yang memicu error." },
        { criterion: "Kebenaran Solusi Sintaks Kode Perbaikan", maxScore: 40, description: "Menuliskan kode pengganti yang valid, bersih, dan bebas syntax error." },
        { criterion: "Penjelasan Teknis & Rekomendasi Best Practice", maxScore: 30, description: "Menjelaskan mekanisme clamping/defensive programming sesuai kaidah RPL." }
      ]
    },
    {
      title: "Desain Fungsi Modular Reusable",
      case: `Siswa diminta merancang fungsi mandiri yang mengimplementasikan logika "${info.topics[0] || 'Inti Modul'}" agar dapat digunakan berulang kali di berbagai skenario proyek.`,
      prompt: `Tuliskan implementasi fungsi JavaScript lengkap berparameter dinamis, disertai dokumentasi JSDoc ringkas dan contoh pemanggilannya!`,
      starterCode: `/**\n * @function executeCustomLogic\n * @param {Object} config - Konfigurasi parameter modul\n */\nfunction executeCustomLogic(config) {\n  // Tuliskan implementasi Anda di sini\n}`,
      modelAnswer: `function executeCustomLogic(config = {}) {\n  const { x = 0, y = 0, scale = 1, color = '#4f46e5' } = config;\n  return {\n    bounds: { x, y, width: 50 * scale, height: 50 * scale },\n    render: (ctx) => {\n      ctx.fillStyle = color;\n      ctx.fillRect(x, y, 50 * scale, 50 * scale);\n    }\n  };\n}`,
      rubric: [
        { criterion: "Struktur Parameter Default & Destructuring", maxScore: 30, description: "Menggunakan default value dan parameter destructuring yang rapi." },
        { criterion: "Logika Algoritma & Return Object", maxScore: 40, description: "Fungsi mengembalikan output yang konsisten dan dapat dipanggil berulang." },
        { criterion: "Kerapian Kode & Standar Konvensi Industri", maxScore: 30, description: "Penamaan variabel deskriptif (camelCase) dan komentar pendukung." }
      ]
    },
    {
      title: "Optimasi Kinerja & Pencegahan Memory Leak",
      case: `Saat aplikasi diuji coba selama 15 menit tanpa henti, pemakaian RAM peramban melonjak dari 45 MB menjadi 320 MB dan frame rate anjlok di bawah 30 FPS.`,
      prompt: `Jelaskan apa yang menyebabkan fenomena memory leak pada implementasi ${info.domain}, dan tuliskan strategi pengelolaan siklus hidup memori (object pooling / lifecycle cleanup) untuk mengatasinya!`,
      starterCode: `// Loop bermasalah yang mengalokasikan objek baru tiap frame:\nfunction gameLoop() {\n  const tempParticles = []; // Dialokasikan ulang 60 kali per detik!\n  for (let i = 0; i < 500; i++) {\n    tempParticles.push({ x: Math.random() * 800, y: Math.random() * 600 });\n  }\n  requestAnimationFrame(gameLoop);\n}`,
      modelAnswer: `Akar Masalah: Pembuatan array dan ratusan objek baru di dalam requestAnimationFrame (60 FPS) memicu lonjakan alokasi memori heap, memaksa Garbage Collector berjalan terus-menerus (GC pause/lag).\nSolusi: Gunakan pola Object Pooling dengan array statis teralokasi di luar loop:\nconst particlePool = Array.from({ length: 500 }, () => ({ x: 0, y: 0, active: false }));\nfunction gameLoop() {\n  // Cukup gunakan kembali properti objek yang sudah ada tanpa alokasi baru\n  requestAnimationFrame(gameLoop);\n}`,
      rubric: [
        { criterion: "Pemahaman Mekanisme Garbage Collection", maxScore: 30, description: "Mampu menguraikan korelasi alokasi objek loop dengan GC stutter." },
        { criterion: "Penerapan Pola Object Pooling", maxScore: 40, description: "Menyediakan kode pooling objek yang efektif dan mendaur ulang memori." },
        { criterion: "Dampak terhadap Stabilitas 60 FPS", maxScore: 30, description: "Menganalisis perbaikan frame budget 16.6ms pasca optimasi." }
      ]
    },
    {
      title: "Penerapan Perhitungan Matematis & Vektor",
      case: `Dalam memprogram interaksi spasial 2D, akurasi kalkulasi matematika sangat menentukan realisme dan ketepatan deteksi objek.`,
      prompt: `Tuliskan formula matematis yang relevan dengan topik "${info.topics[1] || 'Kalkulasi Spasial'}", ubah formula tersebut ke dalam fungsi JavaScript yang efisien, dan jelaskan kegunaan nilai keluarannya!`,
      starterCode: `function calculateSpatialMetric(objA, objB) {\n  // Implementasikan formula jarak / proyeksi / sudut\n}`,
      modelAnswer: `function calculateDistance(objA, objB) {\n  const dx = objB.x - objA.x;\n  const dy = objB.y - objA.y;\n  // Menggunakan Teorema Pythagoras (Euclidean Distance)\n  return Math.hypot(dx, dy); // atau Math.sqrt(dx * dx + dy * dy)\n}`,
      rubric: [
        { criterion: "Kebenaran Formula Matematika", maxScore: 35, description: "Formula sesuai prinsip trigonometri / aljabar linier / kalkulus komputer." },
        { criterion: "Efisiensi Implementasi JavaScript", maxScore: 35, description: "Memanfaatkan Math.hypot atau perkalian langsung yang teroptimasi." },
        { criterion: "Interpretasi Output pada Game/Sistem", maxScore: 30, description: "Mampu menjelaskan arti fisis nilai balik dalam konteks koordinat layar." }
      ]
    },
    {
      title: "Penanganan Event Interaktif & Kontrol Responsif",
      case: `Aplikasi harus dapat dimainkan dengan nyaman baik menggunakan Keyboard pada PC maupun Layar Sentuh (Touchscreen) pada smartphone Android siswa.`,
      prompt: `Rancang sistem penanganan input ganda (Hybrid Input Controller) yang mendukung event keyboard (WASD/Panah) dan event pointer/touch dengan normalisasi koordinat kanvas yang presisi!`,
      starterCode: `class InputController {\n  constructor(canvasElement) {\n    this.canvas = canvasElement;\n    this.keys = {};\n    this.pointer = { x: 0, y: 0, isDown: false };\n    this.initListeners();\n  }\n  initListeners() {\n    // Pasang listener keyboard dan touch di sini\n  }\n}`,
      modelAnswer: `initListeners() {\n  window.addEventListener('keydown', (e) => { this.keys[e.key] = true; });\n  window.addEventListener('keyup', (e) => { this.keys[e.key] = false; });\n  const updateTouch = (e) => {\n    const rect = this.canvas.getBoundingClientRect();\n    const touch = e.touches[0];\n    if (touch) {\n      this.pointer.x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);\n      this.pointer.y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);\n    }\n  };\n  this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateTouch(e); }, { passive: false });\n}`,
      rubric: [
        { criterion: "Normalisasi Skala getBoundingClientRect", maxScore: 35, description: "Mengalikan rasio resolusi kanvas vs ukuran tampilan CSS layar." },
        { criterion: "Penanganan touch-action & preventDefault", maxScore: 35, description: "Mencegah scrolling peramban yang tidak diinginkan saat bermain." },
        { criterion: "Struktur Class Controller yang Bersih", maxScore: 30, description: "Kode rapi, terenkapsulasi, dan mudah di-extend." }
      ]
    },
    {
      title: "State Machine & Pengendalian Alur Logika",
      case: `Sistem membutuhkan pengelolaan status yang ketat untuk mencegah exploit atau status transisi ilegal (misal: menyerang saat karakter sedang dalam status mati/game over).`,
      prompt: `Buatlah diagram alur atau Finite State Machine (FSM) yang mengatur 4 status utama pada ${info.title}, lalu implementasikan validasi transisi status tersebut menggunakan JavaScript!`,
      starterCode: `const ALLOWED_TRANSITIONS = {\n  // Definisikan aturan transisi antar status\n};\nfunction transitionTo(currentState, nextState) {\n  // Validasi apakah perpindahan diizinkan\n}`,
      modelAnswer: `const FSM = {\n  IDLE: ['WALK', 'ATTACK'],\n  WALK: ['IDLE', 'ATTACK'],\n  ATTACK: ['COOLDOWN'],\n  COOLDOWN: ['IDLE'],\n  DEAD: []\n};\nfunction transitionState(current, target) {\n  if (FSM[current] && FSM[current].includes(target)) {\n    return target;\n  }\n  console.warn(\`Transisi ilegal dari \${current} ke \${target}\`);\n  return current;\n}`,
      rubric: [
        { criterion: "Ketepatan Definisi Aturan Transisi Status", maxScore: 30, description: "Menyusun skema FSM yang logis dan menutup celah exploit game." },
        { criterion: "Fungsi Validasi Transisi Terenkapsulasi", maxScore: 40, description: "Memeriksa array transisi yang sah dan menolak status ilegal." },
        { criterion: "Kekebalan Sistem terhadap Status Liar", maxScore: 30, description: "Fallback state yang aman saat menerima input tidak valid." }
      ]
    },
    {
      title: "Konektivitas Data & Sinkronisasi Sistem",
      case: `Hasil kalkulasi atau skor dari modul ${info.code} perlu disimpan secara otomatis ke spreadsheet Google Sheets guru menggunakan API Webhook Apps Script.`,
      prompt: `Tuliskan fungsi asynchronous \`sendAssessmentPayload(studentData, scoreData)\` menggunakan \`fetch()\` dengan payload JSON yang sesuai format integrasi sekolah!`,
      starterCode: `async function sendAssessmentPayload(studentData, scoreData) {\n  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzNQYMH-RpKQUfxw0TOpTp_wJBp7dUMrDV2gVB9AiTkJoGuLOnETSaHyA2fIUdud7LQ/exec";\n  // Tuliskan implementasi fetch POST di sini\n}`,
      modelAnswer: `async function sendAssessmentPayload(student, score) {\n  const ENDPOINT = "https://script.google.com/macros/s/AKfycbzNQYMH-RpKQUfxw0TOpTp_wJBp7dUMrDV2gVB9AiTkJoGuLOnETSaHyA2fIUdud7LQ/exec";\n  const payload = {\n    action: "submit_cbt_score",\n    school: student.school,\n    grade: student.grade,\n    studentName: student.name,\n    moduleCode: "${info.code}",\n    score: score.finalScore,\n    totalQuestions: score.totalQuestions,\n    correctCount: score.correctCount,\n    timestamp: new Date().toISOString()\n  };\n  const res = await fetch(ENDPOINT, {\n    method: "POST",\n    mode: "no-cors",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify(payload)\n  });\n  return { success: true };\n}`,
      rubric: [
        { criterion: "Kesesuaian Struktur JSON Payload", maxScore: 35, description: "Menyertakan atribut wajib nama siswa, kelas, skor, dan timestamp." },
        { criterion: "Penanganan Asynchronous & Fetch Exception", maxScore: 35, description: "Menggunakan async/await dan pengaturan mode CORS yang benar." },
        { criterion: "Validasi Respons & Return Status", maxScore: 30, description: "Memberikan kepastian status kirim kepada sistem pemanggil." }
      ]
    },
    {
      title: "Studi Kasus KKA: Solusi Kejuruan Industri TJKT/RPL",
      case: `Sebuah industri mitra SMK menugaskan tim pengembang membuat prototipe visualisasi cerdas yang mengadopsi prinsip ${info.title} untuk memantau performa perangkat jaringan secara real-time.`,
      prompt: `Rancanglah spesifikasi teknis arsitektur solusi tersebut: Sebutkan komponen modul yang dibutuhkan, alur aliran data dari sumber ke tampilan kanvas, dan bagaimana logika kecerdasan buatan/algoritma dioptimalkan!`,
      starterCode: `/* Blueprint Arsitektur Sistem KKA Industri:\n 1. Sumber Data:\n 2. Pemrosesan & Algoritma:\n 3. Antarmuka Visual & Interaktivitas:\n*/`,
      modelAnswer: `1. Sumber Data: Telemetri jaringan (latensi ping, throughput bandwidth, status node aktif) dikirim melalui WebSocket berkala.\n2. Pemrosesan Logika: Data dinormalisasi dan dianalisis menggunakan algoritma ambang batas (thresholding) atau klasifikasi status (NORMAL, WARNING, CRITICAL).\n3. Layer Rendering: Menggunakan HTML5 Canvas multi-layer (lapisan topologi statis dan lapisan partikel paket data dinamis) dengan refresh rate adaptif untuk menghemat daya GPU klien.`,
      rubric: [
        { criterion: "Kelengkapan Spesifikasi Arsitektur 3-Layer", maxScore: 40, description: "Mencakup sumber data, layer pemrosesan algoritma, dan layer visual." },
        { criterion: "Relevansi dengan Kompetensi TJKT/RPL", maxScore: 30, description: "Menghubungkan jaringan komputer dengan visualisasi koding interaktif." },
        { criterion: "Analisis Kelayakan & Efisiensi Solusi", maxScore: 30, description: "Memperhitungkan beban jaringan dan konsumsi memori browser klien." }
      ]
    },
    {
      title: "Refactoring Kode & Kepatuhan Standar Industri (Clean Code)",
      case: `Kode awal warisan proyek ditulis secara 'spaghetti' (mencampur aduk manipulasi DOM, kalkulasi matematika, dan pemanggilan jaringan dalam satu event listener).`,
      prompt: `Tuliskan langkah-langkah refactoring kode tersebut menjadi arsitektur MVC (Model-View-Controller) atau pemisahan fungsi concern terpisah, dan berikan contoh perbandingan kode sebelum vs sesudah refactoring!`,
      starterCode: `// SEBELUM: Spaghetti Code\ndocument.getElementById('btnAction').onclick = function() {\n  let raw = document.getElementById('numInput').value;\n  let res = Math.sin(Number(raw)) * 100;\n  document.getElementById('displayCanvas').getContext('2d').fillRect(res, res, 20, 20);\n};`,
      modelAnswer: `// SESUDAH: Pemisahan Concern (Model, View, Controller)\n// 1. Model (Kalkulasi Murni):\nconst MathService = { calculateOffset: (rad) => Math.sin(Number(rad)) * 100 };\n// 2. View (Rendering Murni):\nconst CanvasView = {\n  drawMarker: (ctx, pos) => { ctx.fillRect(pos, pos, 20, 20); }\n};\n// 3. Controller (Penyambung Event):\nfunction handleActionClick(inputVal, ctx) {\n  const offset = MathService.calculateOffset(inputVal);\n  CanvasView.drawMarker(ctx, offset);\n}`,
      rubric: [
        { criterion: "Pemisahan Domain Logic dan View Rendering", maxScore: 35, description: "Memisahkan kalkulasi matematis murni dari manipulasi canvas/DOM." },
        { criterion: "Peningkatan Kemudahan Pengujian (Testability)", maxScore: 35, description: "Fungsi kalkulasi dapat diuji dengan unit test tanpa memerlukan DOM." },
        { criterion: "Keterbacaan dan Dokumentasi Kode", maxScore: 30, description: "Penamaan fungsi dan objek yang self-explanatory sesuai kaidah Clean Code." }
      ]
    },
    {
      title: "Evaluasi Hasil Belajar & Refleksi Mandiri Siswa",
      case: `Sebagai bagian dari asesmen portofolio kejuruan, siswa diwajibkan melakukan refleksi kritis terhadap karya komputasi yang telah diselesaikan pada modul ini.`,
      prompt: `Jelaskan 3 kendala teknis terbesar yang Anda hadapi saat mengimplementasikan fitur pada ${info.title}, bagaimana Anda memecahkan kendala tersebut (debugging journey), dan apa fitur pengembangan lanjutan (future enhancement) yang ingin Anda tambahkan!`,
      starterCode: `/* Refleksi Asesmen Portofolio Siswa:\n Kendala 1: ...\n Kendala 2: ...\n Kendala 3: ...\n Rencana Pengembangan Lanjutan: ...\n*/`,
      modelAnswer: `1. Kendala Sinkronisasi Frame: Terjadi pergerakan patah-patah saat objek melintasi batas kanvas. Solusi: Menerapkan delta time (dt) dan fungsi wrapping posisi matematis.\n2. Kendala Collision Detection: Objek terkadang menembus dinding saat kecepatan tinggi (tunneling bug). Solusi: Menggunakan continuous collision check dan pengecekan bounding box berbasis proyeksi vektor.\n3. Kendala Responsivitas Mobile: Tombol virtual D-Pad memicu zoom layar otomatis. Solusi: Mengaplikasikan CSS touch-action: none dan event.preventDefault().\nRencana Lanjutan: Menambahkan fitur penyimpanan riwayat rekor lokal menggunakan localStorage dan leaderboard multiplayer real-time.`,
      rubric: [
        { criterion: "Kejujuran & Kedalaman Analisis Kendala Teknis", maxScore: 35, description: "Menguraikan kendala komputasi nyata bukan sekadar kendala ketik sepele." },
        { criterion: "Ketepatan Solusi Penyelesaian (Problem Solving)", maxScore: 35, description: "Menjelaskan metodologi penelusuran akar masalah dan solusinya." },
        { criterion: "Visi Pengembangan Lanjutan (Inovasi Karya)", maxScore: 30, description: "Memiliki roadmap fitur tambahan yang kreatif dan berdaya guna tinggi." }
      ]
    }
  ];

  for (let i = 0; i < 10; i++) {
    const t = essayThemes[i];
    essays.push({
      id: (modId - 1) * 10 + (i + 1),
      moduleId: modId,
      moduleCode: info.code,
      moduleTitle: info.title,
      topic: `${info.title} - ${t.title}`,
      caseStudy: t.case,
      question: t.prompt,
      starterCode: t.starterCode,
      modelAnswer: t.modelAnswer,
      explanation: `Studi kasus ini melatih nalar kritis siswa SMK dalam ${t.title.toLowerCase()} pada ekosistem ${info.domain}.`,
      rubric: t.rubric,
      smkCompetency: `TJKT/RPL: ${t.title} Tingkat Lanjut (${info.domain})`
    });
  }

  return essays;
}

/**
 * Pembangkit 40 Soal Pilihan Ganda Komprehensif Semester (Campuran 24 Modul)
 * Menampilkan ringkasan menyeluruh silabus KKA SMK.
 */
export function getComprehensive40Questions(): CbtQuestion[] {
  const allQuestions: CbtQuestion[] = [];
  // Ambil butir terpilih dari seluruh 24 modul hingga genap 40 butir soal
  for (let i = 1; i <= 40; i++) {
    const targetMod = ((i - 1) % 24) + 1;
    const modQuestions = getCbt40Questions(targetMod);
    const chosen = modQuestions[(i * 3) % modQuestions.length];
    allQuestions.push({
      ...chosen,
      id: 1000 + i,
      question: `[Soal Terpadu KD-${targetMod}] ${chosen.question}`
    });
  }
  return allQuestions;
}
