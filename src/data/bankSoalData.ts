export type QuestionType = "PG Biasa" | "PG Kompleks" | "Essay";

export interface QuestionItem {
  id: number;
  moduleId: number;
  moduleCode: string;
  topic: string;
  type: QuestionType;
  question: string;
  options?: string[]; // Untuk PG Biasa & PG Kompleks
  correctAnswer: string; // Misal: "B", "A, C", atau poin rubrik/solusi
  explanation: string;
  codingSnippet?: string;
  smkCompetency: string; // Kompetensi keahlian SMK (TJKT/RPL)
}

export const BANK_SOAL_DATA: QuestionItem[] = [
  // ================= MODUL 1 =================
  {
    id: 1,
    moduleId: 1,
    moduleCode: "MODUL-01",
    topic: "Sistem Koordinat Kanvas HTML5",
    type: "PG Biasa",
    question: "Pada elemen <canvas> HTML5 dengan ukuran width='600' dan height='400', di manakah posisi titik koordinat (0, 0) berada?",
    options: [
      "A. Titik tengah layar kanvas (pusat)",
      "B. Sudut kiri-bawah kanvas",
      "C. Sudut kiri-atas kanvas",
      "D. Sudut kanan-atas kanvas"
    ],
    correctAnswer: "C",
    explanation: "Sistem koordinat kanvas 2D pada peramban web berawal dari sudut kiri-atas (0,0). Nilai X bertambah ke arah kanan, dan nilai Y bertambah ke arah bawah.",
    smkCompetency: "RPL: Penguasaan Sistem Koordinat & Canvas 2D Context"
  },
  {
    id: 2,
    moduleId: 1,
    moduleCode: "MODUL-01",
    topic: "Metode Penggambaran Primitif Canvas 2D",
    type: "PG Kompleks",
    question: "Perhatikan pernyataan berikut terkait perintah rendering elemen canvas 2D di JavaScript:\n1. ctx.fillRect(x, y, w, h) langsung menggambar dan mengisi persegi panjang dengan warna aktif.\n2. ctx.arc(x, y, r, 0, Math.PI * 2) digunakan untuk membentuk jalur lingkaran penuh.\n3. Perintah ctx.beginPath() wajib dipanggil setelah ctx.fill() agar warna tidak bocor.\n4. Parameter koordinat Y yang semakin besar akan menggeser objek ke arah bawah layar.\nManakah kombinasi pernyataan yang BENAR?",
    options: [
      "A. 1, 2, dan 3",
      "B. 1, 2, dan 4",
      "C. 2, 3, dan 4",
      "D. Semua pernyataan benar"
    ],
    correctAnswer: "B",
    explanation: "Pernyataan 1, 2, dan 4 benar. Pernyataan 3 salah karena beginPath() dipanggil SEBELUM membuat sub-jalur baru (seperti arc atau moveTo), bukan sesudah fill().",
    smkCompetency: "TJKT/RPL: Logika Grafika Komputer Dasar"
  },
  {
    id: 3,
    moduleId: 1,
    moduleCode: "MODUL-01",
    topic: "Pembuatan Bentuk Poligon Segitiga",
    type: "Essay",
    question: "Seorang siswa RPL diminta menggambar atap rumah berbentuk segitiga sama kaki menggunakan Drawing Context 2D pada canvas berukuran 600x400. Titik puncak atap berada di (225, 100), titik kiri bawah di (130, 200), dan titik kanan bawah di (320, 200). Tulislah blok kode JavaScript lengkap untuk menggambar dan mewarnai atap tersebut dengan warna cokelat ('#8B4513')!",
    correctAnswer: "ctx.fillStyle = '#8B4513'; ctx.beginPath(); ctx.moveTo(130, 200); ctx.lineTo(225, 100); ctx.lineTo(320, 200); ctx.closePath(); ctx.fill();",
    explanation: "Blok kode harus mengatur fillStyle terlebih dahulu, memulai jalur baru dengan beginPath(), mengarahkan kuas ke titik awal dengan moveTo, menghubungkan dua titik lainnya dengan lineTo, menutup jalur dengan closePath(), dan mengisi warna dengan fill().",
    codingSnippet: `ctx.fillStyle = '#8B4513';\nctx.beginPath();\nctx.moveTo(130, 200); // Titik kiri bawah\nctx.lineTo(225, 100); // Titik puncak atap\nctx.lineTo(320, 200); // Titik kanan bawah\nctx.closePath();\nctx.fill();`,
    smkCompetency: "RPL: Konstruksi Path Geometri Canvas"
  },

  // ================= MODUL 2 =================
  {
    id: 4,
    moduleId: 2,
    moduleCode: "MODUL-02",
    topic: "Efisiensi Perulangan Objek Grafis",
    type: "PG Biasa",
    question: "Dalam Modul 2, untuk menggambar 150 bintang dengan ukuran dan koordinat acak di langit malam, struktur kontrol logika apakah yang paling efisien digunakan?",
    options: [
      "A. Switch-case bersarang dengan 150 cabang",
      "B. Pemanggilan fungsi manual ctx.fillRect() sebanyak 150 baris kode",
      "C. For Loop dengan batas i < 150 dipadu Math.random()",
      "D. Recursive function tanpa base case"
    ],
    correctAnswer: "C",
    explanation: "Menggunakan For Loop (for (let i = 0; i < 150; i++)) dengan Math.random() adalah prinsip efisiensi kode (DRY: Don't Repeat Yourself) untuk merender banyak elemen tanpa redundansi kode.",
    smkCompetency: "RPL: Algoritma Perulangan & Pembangkitan Data Acak"
  },
  {
    id: 5,
    moduleId: 2,
    moduleCode: "MODUL-02",
    topic: "Detail Visual Garis Tepi (Stroke & Alpha)",
    type: "PG Kompleks",
    question: "Manakah konfigurasi kode yang tepat jika seorang developer ingin membuat lingkaran bulan dengan warna kuning lembut dan garis tepi cahaya (glow ring) berketebalan 8 piksel dengan transparansi 40%?",
    options: [
      "A. ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)'; ctx.stroke();",
      "B. ctx.lineWidth = 0; ctx.fillStyle = 'rgba(254, 240, 138, 0.4)'; ctx.fill();",
      "C. ctx.border = '8px solid yellow'; ctx.stroke();",
      "D. ctx.lineWidth = 8; ctx.strokeStyle = 'transparent'; ctx.fill();"
    ],
    correctAnswer: "A",
    explanation: "Untuk mengatur garis tepi kanvas, gunakan ctx.lineWidth = 8, atur warna ber-alpha dengan ctx.strokeStyle = 'rgba(..., 0.4)', lalu aktifkan garis dengan memanggil method ctx.stroke().",
    smkCompetency: "RPL: Visual Styling & Alpha Channel Manipulation"
  },
  {
    id: 6,
    moduleId: 2,
    moduleCode: "MODUL-02",
    topic: "Fungsi Modular Reusable Berparameter",
    type: "Essay",
    question: "Jelaskan mengapa pembuatan fungsi modular seperti function gambarPohon(x, y) jauh lebih unggul dibandingkan menuliskan perintah gambar batang dan daun secara manual setiap kali ingin menanam pohon baru di kanvas! Berikan contoh pemanggilan fungsi tersebut dalam perulangan untuk menanam 5 pohon berjarak 70px!",
    correctAnswer: "Fungsi modular menerapkan prinsip modularitas dan DRY. Kode menjadi bersih, mudah di-maintain, dan dapat digunakan berulang hanya dengan mengubah parameter koordinat x dan y. Contoh loop: for(let x = 50; x <= 330; x += 70) { gambarPohon(x, 320); }",
    explanation: "Fungsi memisahkan logika cetakan gambar (blueprint) dari instansiasi posisi di layar kanvas.",
    codingSnippet: `// Loop menanam 5 pohon teratur berjarak 70px\nfor (let x = 50; x <= 330; x += 70) {\n    gambarPohon(x, canvas.height - 80);\n}`,
    smkCompetency: "RPL: Prinsip Modular Programming & Reusable Code"
  },

  // ================= MODUL 3 =================
  {
    id: 7,
    moduleId: 3,
    moduleCode: "MODUL-03",
    topic: "Pembersihan Frame pada Animasi Canvas",
    type: "PG Biasa",
    question: "Apa akibat yang terjadi pada animasi objek kanvas jika pemrogram lupa memanggil perintah ctx.clearRect(0, 0, canvas.width, canvas.height) pada awal setiap frame animasi?",
    options: [
      "A. Kanvas akan mengalami crash seketika dan peramban tertutup",
      "B. Objek akan meninggalkan jejak coretan (trails) seperti goresan kuas yang tidak pernah terhapus",
      "C. Kecepatan refresh monitor menurun menjadi 30 FPS",
      "D. Objek tidak akan terlihat sama sekali di layar"
    ],
    correctAnswer: "B",
    explanation: "Tanpa membersihkan kanvas menggunakan clearRect() pada tiap frame, piksel dari frame sebelumnya tetap tersimpan di buffer layar, sehingga pergerakan objek meninggalkan jejak sapuan.",
    smkCompetency: "RPL: Siklus Render Frame & Refresh Buffer"
  },
  {
    id: 8,
    moduleId: 3,
    moduleCode: "MODUL-03",
    topic: "Mekanisme requestAnimationFrame 60 FPS",
    type: "PG Kompleks",
    question: "Manakah alasan mengapa method window.requestAnimationFrame() lebih dianjurkan dibandingkan setInterval() untuk menjalankan game loop 60 FPS di peramban web modern? (Pilih pernyataan yang benar)",
    options: [
      "A. Sinkron dengan refresh rate layar monitor sehingga animasi lebih mulus dan bebas screen-tearing",
      "B. Otomatis berhenti/jeda saat tab browser tidak aktif sehingga menghemat daya CPU/GPU dan baterai",
      "C. Berjalan pada thread terpisah di web worker sehingga tidak memerlukan JavaScript",
      "D. Memanggil fungsi animasi secara rekursif tepat sebelum browser melakukan repainting berikutnya"
    ],
    correctAnswer: "A, B, D",
    explanation: "Pernyataan A, B, dan D adalah keunggulan utama requestAnimationFrame(). Pernyataan C salah karena requestAnimationFrame berjalan pada main rendering thread peramban.",
    smkCompetency: "TJKT/RPL: Optimasi Performa Rendering Web"
  },
  {
    id: 9,
    moduleId: 3,
    moduleCode: "MODUL-03",
    topic: "Logika Looping Batas Layar (Screen Wrapping)",
    type: "Essay",
    question: "Dalam animasi Modul 3, sebuah awan bergeser ke kanan dengan kecepatan posisiX_Awan += 1.5. Buatlah logika percabangan if agar ketika seluruh bagian awan (lebar awan = 80px) telah melintasi batas kanan kanvas (canvas.width), awan tersebut akan otomatis muncul kembali dari luar sisi kiri layar (-100px)!",
    correctAnswer: "if (posisiX_Awan > canvas.width + 100) { posisiX_Awan = -100; }",
    explanation: "Screen wrapping memeriksa posisi X objek. Jika nilai X sudah melebihi lebar layar kanvas ditambah offset ukuran objek, kembalikan posisi X ke nilai negatif di luar layar kiri agar kemunculan kembali terlihat natural.",
    codingSnippet: `// Geser awan ke kanan\nposisiX_Awan += 1.5;\n\n// Screen wrapping jika melewati batas kanan kanvas\nif (posisiX_Awan > canvas.width + 100) {\n    posisiX_Awan = -100;\n}`,
    smkCompetency: "RPL: Logika Percabangan Boundary Checking"
  },

  // ================= MODUL 4 =================
  {
    id: 10,
    moduleId: 4,
    moduleCode: "MODUL-04",
    topic: "Manipulasi DOM & State Management Memory Match",
    type: "PG Biasa",
    question: "Pada game Pairs / Memory Match Modul 4, apa fungsi utama dari variabel boolean 'isLocked' dalam manajemen status aplikasi?",
    options: [
      "A. Menghentikan game secara permanen saat pemain kalah",
      "B. Mencegah pemain membuka kartu ketiga atau kartu lain saat dua kartu yang salah sedang menunggu animasi tutup kembali",
      "C. Menyimpan nama pengguna ke dalam local storage",
      "D. Mengacak urutan ikon pada kartu permainan"
    ],
    correctAnswer: "B",
    explanation: "isLocked berfungsi sebagai kunci pengaman status (state mutex). Saat dua kartu terbuka dan tidak cocok, isLocked disetel ke true selama 1 detik (durasi setTimeout) agar pemain tidak bisa memicu event klik pada kartu lain.",
    smkCompetency: "RPL: State Management & Race Condition Prevention"
  },
  {
    id: 11,
    moduleId: 4,
    moduleCode: "MODUL-04",
    topic: "CSS 3D Transform & Event Handler",
    type: "PG Kompleks",
    question: "Dalam implementasi kartu bolak-balik (flip card) pada Modul 4, properti CSS dan JavaScript manakah yang berperan langsung dalam menghasilkan efek animasi putar 3D yang realistis?",
    options: [
      "A. CSS transform: rotateY(180deg) pada kelas .card.flip",
      "B. CSS backface-visibility: hidden pada sisi depan dan belakang kartu",
      "C. Penanganan bug klik ganda: if (this === firstCard) return;",
      "D. CSS display: inline-block tanpa perspective"
    ],
    correctAnswer: "A, B, C",
    explanation: "A memutar elemen 180 derajat pada sumbu Y, B menyembunyikan sisi belakang saat menghadap ke dalam sehingga tidak tembus pandang, dan C mencegah kartu yang sama dihitung sebagai pasangan cocok.",
    smkCompetency: "RPL: CSS 3D Transforms & Defensive Coding"
  },
  {
    id: 12,
    moduleId: 4,
    moduleCode: "MODUL-04",
    topic: "Validasi Pencocokan & Deteksi Kemenangan",
    type: "Essay",
    question: "Tuliskan fungsi checkForMatch() pada game Memory Match yang bertugas: (1) Memeriksa apakah firstCard.dataset.icon sama dengan secondCard.dataset.icon, (2) Jika cocok, panggil disableCards(), dan (3) Jika tidak cocok, panggil unflipCards()!",
    correctAnswer: "function checkForMatch() { let isMatch = firstCard.dataset.icon === secondCard.dataset.icon; if (isMatch) { disableCards(); } else { unflipCards(); } }",
    explanation: "Fungsi membandingkan nilai atribut dataset.icon kedua kartu yang sedang terbuka lalu mengarahkan alur eksekusi berdasarkan kecocokan.",
    codingSnippet: `function checkForMatch() {\n    // Membandingkan dataset icon kartu pertama dan kedua\n    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;\n    \n    if (isMatch) {\n        disableCards(); // Pasangan benar\n    } else {\n        unflipCards();  // Pasangan salah, tutup kembali\n    }\n}`,
    smkCompetency: "RPL: Data Attribute Matching & Conditional Flow"
  },

  // ================= MODUL 5 =================
  {
    id: 13,
    moduleId: 5,
    moduleCode: "MODUL-05",
    topic: "Representasi Peta Menggunakan Array 2D (Tilemap)",
    type: "PG Biasa",
    question: "Dalam game Diamond Rush (Modul 5), jika sebuah peta gua didefinisikan dengan let mapGrid = [[1, 0, 3], [1, 2, 0]], manakah nilai ekspresi untuk memeriksa ubin pada baris indeks 1 kolom indeks 1?",
    options: [
      "A. mapGrid[1][1] bernilai 2 (Batu Boulder)",
      "B. mapGrid[0][1] bernilai 0 (Tanah Kosong)",
      "C. mapGrid[1][0] bernilai 1 (Dinding Tembok)",
      "D. mapGrid[2][2] bernilai 3 (Berlian)"
    ],
    correctAnswer: "A",
    explanation: "Array 2D diakses dengan indeks mapGrid[baris][kolom]. Pada baris 1 kolom 1, nilainya adalah 2 yang merepresentasikan batu besar (boulder).",
    smkCompetency: "RPL: Pengindeksan Array Multi-Dimensi"
  },
  {
    id: 14,
    moduleId: 5,
    moduleCode: "MODUL-05",
    topic: "Logika Mendorong Batu (Boulder Push Physics)",
    type: "PG Kompleks",
    question: "Kondisi apa sajakah yang harus terpenuhi agar karakter pemain dalam Diamond Rush diizinkan mendorong batu besar (tile 2) satu petak ke depan?",
    options: [
      "A. Petak target langkah pemain berikutnya (nextX, nextY) berisi ubin bernilai 2 (batu)",
      "B. Petak tepat di balik batu (pushX = nextX + dx, pushY = nextY + dy) bernilai 0 (jalur tanah kosong)",
      "C. Petak di balik batu boleh berupa dinding tembok (nilai 1) asalkan pemain memiliki nyawa penuh",
      "D. Status permainan berada dalam keadaan 'PLAYING'"
    ],
    correctAnswer: "A, B, D",
    explanation: "Batu hanya dapat didorong jika petak di belakangnya kosong (nilai 0) dan game sedang aktif. Batu tidak dapat didorong menembus tembok (nilai 1).",
    smkCompetency: "RPL: Logika Vektor Spasial & Interaksi Ubin"
  },
  {
    id: 15,
    moduleId: 5,
    moduleCode: "MODUL-05",
    topic: "Interaksi Pengambilan Berlian & Pembaruan Matriks",
    type: "Essay",
    question: "Ketika karakter pemain melangkah ke petak yang berisi berlian (tile bernilai 3), dua hal penting harus diperbarui pada sistem: skor pemain bertambah 100 dan petak berlian tersebut harus dikosongkan. Tuliskan dua baris kode JavaScript untuk mengimplementasikan hal tersebut pada koordinat nextY dan nextX!",
    correctAnswer: "gameState.score += 100; mapGrid[nextY][nextX] = 0;",
    explanation: "Nilai skor ditambahkan secara akumulatif, dan nilai sel matriks pada koordinat target diubah menjadi 0 (ubin kosong) agar berlian tidak dapat diambil berulang kali.",
    codingSnippet: `// Kasus 2: Ambil Berlian (Diamond)\ngameState.score += 100;         // Tambah skor 100 poin\nmapGrid[nextY][nextX] = 0;     // Kosongkan petak menjadi jalur tanah`,
    smkCompetency: "RPL: Mutasi State & Pembaruan Elemen Matriks"
  },

  // ================= MODUL 6 =================
  {
    id: 16,
    moduleId: 6,
    moduleCode: "MODUL-06",
    topic: "Timer Kesabaran Pelanggan dengan setInterval",
    type: "PG Biasa",
    question: "Dalam simulasi restoran Cake Mania (Modul 6), method bawaan JavaScript apakah yang paling tepat digunakan untuk mengurangi tingkat kesabaran pelanggan sebesar 5 poin secara berkala setiap 1000 milidetik?",
    options: [
      "A. setTimeout(() => { ... }, 1000)",
      "B. setInterval(() => { ... }, 1000)",
      "C. requestAnimationFrame(1000)",
      "D. window.clearInterval(1000)"
    ],
    correctAnswer: "B",
    explanation: "setInterval menjalankan fungsi callback berulang-ulang setiap interval waktu yang ditentukan (1000ms = 1 detik), sedangkan setTimeout hanya mengeksekusinya satu kali.",
    smkCompetency: "RPL: Pengelolaan Timer Asinkron & Interval"
  },
  {
    id: 17,
    moduleId: 6,
    moduleCode: "MODUL-06",
    topic: "Siklus Status Pelanggan (State Machine)",
    type: "PG Kompleks",
    question: "Berikut adalah transisi status pelanggan dalam alur pelayanan restoran Cake Mania yang benar dari awal hingga akhir transaksi:",
    options: [
      "A. WAITING_ORDER: Pelanggan baru duduk di meja dan menunggu pelayan mencatat pesanan",
      "B. COOKING: Koki sedang memproses pesanan kue di dapur dengan durasi setTimeout",
      "C. READY_TO_SERVE: Makanan telah siap saji dan menunggu diantar ke meja pelanggan",
      "D. EATING: Pelanggan sedang menikmati kue, lalu menambah uang kasir sebelum meja kosong kembali"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh tahapan tersebut merupakan state machine berurutan dalam game time management Cake Mania / Diner Dash.",
    smkCompetency: "RPL: Pemodelan Finite State Machine Sistem Layanan"
  },
  {
    id: 18,
    moduleId: 6,
    moduleCode: "MODUL-06",
    topic: "Pembersihan Interval & Penanganan Pelanggan Marah",
    type: "Essay",
    question: "Mengapa pemanggilan clearInterval(timerInterval) mutlak harus dilakukan saat kesabaran pelanggan habis (patience <= 0) atau saat pelanggan telah selesai makan? Apa risiko yang terjadi pada memori aplikasi jika pemanggilan clearInterval diabaikan?",
    correctAnswer: "clearInterval() wajib dipanggil untuk menghentikan timer yang berjalan di background. Jika diabaikan, timer akan terus berjalan (memory leak), mengonsumsi sumber daya CPU, dan berpotensi memicu error karena memanipulasi objek pelanggan yang sudah tidak ada.",
    explanation: "Setiap interval yang dibuat dengan setInterval harus dibersihkan dengan clearInterval saat siklus hidup objek berakhir.",
    codingSnippet: `if (customer.patience <= 0) {\n    customer.status = 'ANGRY';\n    clearInterval(timerInterval); // Hentikan timer agar tidak memory leak!\n    handleCustomerAngry(customer);\n}`,
    smkCompetency: "TJKT/RPL: Garbage Collection & Manajemen Sumber Daya Asinkron"
  },

  // ================= MODUL 7 =================
  {
    id: 19,
    moduleId: 7,
    moduleCode: "MODUL-07",
    topic: "Pencegahan Bug Balik Arah pada Snake Game",
    type: "PG Biasa",
    question: "Mengapa pada kontrol game Snake (Modul 7), saat ular sedang melaju ke arah KANAN (gameState.dx === 1), pemain dilarang langsung berbelok ke arah KIRI (gameState.dx = -1)?",
    options: [
      "A. Karena layar kanvas tidak mendukung pergerakan horizontal negatif",
      "B. Karena ular akan langsung menabrak leher/badannya sendiri dan menyebabkan Game Over seketika",
      "C. Karena tombol panah kiri otomatis dinonaktifkan oleh CSS",
      "D. Karena skor pemain akan berkurang menjadi minus"
    ],
    correctAnswer: "B",
    explanation: "Membalik arah 180 derajat secara instan akan membuat kepala ular menabrak segmen badan tepat di belakangnya. Oleh karena itu, belok kiri hanya diizinkan jika gameState.dx !== 1.",
    smkCompetency: "RPL: Defensive Programming & Validasi Input"
  },
  {
    id: 20,
    moduleId: 7,
    moduleCode: "MODUL-07",
    topic: "Struktur Data Array Segmen Ular (Queue)",
    type: "PG Kompleks",
    question: "Manakah pernyataan yang BENAR mengenai manipulasi array badan ular: gameState.snake = [{x, y}, ...]? (Pilih pernyataan yang benar)",
    options: [
      "A. gameState.snake.unshift(head) digunakan untuk menambahkan kepala baru di awal array sesuai arah laju",
      "B. gameState.snake.pop() dipanggil untuk membuang segmen ekor terakhir jika ular tidak memakan makanan",
      "C. Saat ular memakan makanan (head.x === food.x && head.y === food.y), gameState.snake.pop() TIDAK dipanggil sehingga panjang ular bertambah",
      "D. Panjang ular hanya boleh bernilai ganjil agar rendering grid sejajar"
    ],
    correctAnswer: "A, B, C",
    explanation: "A, B, dan C mendeskripsikan algoritma antrean (queue) pergerakan ular. Pernyataan D salah karena panjang ular bisa bernilai genap maupun ganjil.",
    smkCompetency: "RPL: Struktur Data Array & Konsep Queue"
  },
  {
    id: 21,
    moduleId: 7,
    moduleCode: "MODUL-07",
    topic: "Deteksi Tabrakan Diri Sendiri (Self-Collision)",
    type: "Essay",
    question: "Tuliskan blok perulangan for dalam JavaScript untuk mendeteksi apakah kepala ular (head.x, head.y) menabrak salah satu segmen badannya sendiri (gameState.snake[i]), lalu panggil fungsi setGameOver() jika terjadi tabrakan!",
    correctAnswer: "for (let i = 0; i < gameState.snake.length; i++) { if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) { setGameOver(); return; } }",
    explanation: "Loop memeriksa setiap elemen segmen badan ular. Jika koordinat x dan y kepala sama persis dengan segmen tubuh mana pun, pemain dinyatakan menabrak diri sendiri.",
    codingSnippet: `// Deteksi Tabrakan Badan Sendiri (Self Collision)\nfor (let i = 0; i < gameState.snake.length; i++) {\n    if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {\n        setGameOver();\n        return;\n    }\n}`,
    smkCompetency: "RPL: Algoritma Pencarian Linear & Deteksi Kolisi"
  },

  // ================= MODUL 8 =================
  {
    id: 22,
    moduleId: 8,
    moduleCode: "MODUL-08",
    topic: "Fisika Pantulan Bounding Box Paddle",
    type: "PG Biasa",
    question: "Pada game Bounce (Modul 8), bola memantul ke atas ketika menyentuh papan pemantul (paddle). Persamaan logika JavaScript manakah yang memvalidasi bahwa koordinat X bola berada dalam rentang bidang paddle?",
    options: [
      "A. ball.x === paddle.x",
      "B. ball.x > paddle.x && ball.x < paddle.x + paddle.width",
      "C. ball.x + ball.radius === canvas.width",
      "D. ball.y > paddle.y + paddle.height"
    ],
    correctAnswer: "B",
    explanation: "Bola berada di atas paddle jika posisi horizontal ball.x lebih besar dari ujung kiri paddle (paddle.x) dan lebih kecil dari ujung kanan paddle (paddle.x + paddle.width).",
    smkCompetency: "RPL: Fisika Bounding Box 1D & Range Checking"
  },
  {
    id: 23,
    moduleId: 8,
    moduleCode: "MODUL-08",
    topic: "Penanganan Layar Sentuh Mobile (Touch Events)",
    type: "PG Kompleks",
    question: "Saat mengadaptasi game web kanvas agar dapat dimainkan dengan nyaman pada perangkat smartphone Android, langkah teknis apakah yang harus diterapkan?",
    options: [
      "A. Menggunakan listener 'touchmove' dan mengambil koordinat horizontal jari pertama via e.touches[0].clientX",
      "B. Memanggil e.preventDefault() pada touch event untuk mencegah halaman ikut ter-scroll saat menggeser jari",
      "C. Menambahkan properti CSS touch-action: none pada elemen canvas",
      "D. Menghapus elemen canvas dan menggantinya dengan tombol link HTML statis"
    ],
    correctAnswer: "A, B, C",
    explanation: "A, B, dan C merupakan standar integrasi antarmuka sentuh (mobile web touch) untuk game kanvas interaktif.",
    smkCompetency: "TJKT/RPL: Responsivitas Mobile & Event Touch API"
  },
  {
    id: 24,
    moduleId: 8,
    moduleCode: "MODUL-08",
    topic: "Pembalikan Vektor Kecepatan Bola",
    type: "Essay",
    question: "Tuliskan kode logika pembalikan arah pantulan bola saat menabrak dinding kiri atau dinding kanan kanvas, dengan memperhitungkan radius bola (ball.radius) agar bola tidak tembus ke luar batas kanvas!",
    correctAnswer: "if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) { ball.dx = -ball.dx; }",
    explanation: "Jika posisi X berikutnya melebihi batas kanan atau kurang dari batas kiri sebesar radius bola, inversikan tanda kecepatan horizontal (dx = -dx).",
    codingSnippet: `// Pantulan Dinding Kiri & Kanan\nif (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {\n    ball.dx = -ball.dx; // Balikkan arah horizontal\n}`,
    smkCompetency: "RPL: Vektor Fisika Pantulan 2D"
  },

  // ================= MODUL 9 =================
  {
    id: 25,
    moduleId: 9,
    moduleCode: "MODUL-09",
    topic: "Algoritma Rotasi Matriks 90 Derajat",
    type: "PG Biasa",
    question: "Dalam game Tetris (Modul 9), rumus matematis aljabar matriks apakah yang digunakan untuk memutar matriks berukuran N x N sebesar 90 derajat searah jarum jam (clockwise)?",
    options: [
      "A. result[r][c] = matrix[r][c]",
      "B. result[r][c] = matrix[c][r]",
      "C. result[r][c] = matrix[N - 1 - c][r]",
      "D. result[r][c] = matrix[r][N - 1 - c]"
    ],
    correctAnswer: "C",
    explanation: "Rumus rotasi 90 derajat searah jarum jam memetakan baris baru r dan kolom baru c dari elemen sumber pada baris N - 1 - c dan kolom r.",
    smkCompetency: "RPL: Transformasi Geometri & Aljabar Matriks"
  },
  {
    id: 26,
    moduleId: 9,
    moduleCode: "MODUL-09",
    topic: "Algoritma Penghapusan Baris Penuh (Line Clearing)",
    type: "PG Kompleks",
    question: "Bagaimanakah alur kerja algoritma line clearing saat sebuah baris pada papan Tetris telah terisi penuh balok? (Pilih pernyataan yang benar)",
    options: [
      "A. Memeriksa baris dari bawah ke atas menggunakan method array.every(cell => cell !== 0)",
      "B. Menghapus baris yang penuh dari matriks papan menggunakan gameState.board.splice(r, 1)",
      "C. Menyisipkan baris kosong baru di bagian paling atas papan menggunakan gameState.board.unshift(Array(10).fill(0))",
      "D. Menambah skor pemain dan menghitung kelipatan baris untuk kenaikan level permainan"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh langkah tersebut merupakan implementasi lengkap algoritma penghapusan baris pada game Tetris.",
    smkCompetency: "RPL: Algoritma Manipulasi Array Matriks"
  },
  {
    id: 27,
    moduleId: 9,
    moduleCode: "MODUL-09",
    topic: "Deteksi Benturan Rotasi Balok (Wall Kick / Collision Check)",
    type: "Essay",
    question: "Sebelum sebuah balok Tetris diizinkan berputar atau bergeser, fungsi isValidMove(piece, offsetX, offsetY, targetShape) harus dipanggil terlebih dahulu. Sebutkan minimal 3 kondisi batas yang diperiksa oleh fungsi tersebut agar balok tidak menabrak atau melanggar aturan permainan!",
    correctAnswer: "1. Batas Dinding Kiri (newX < 0), 2. Batas Dinding Kanan (newX >= BOARD_WIDTH), 3. Batas Lantai Dasar (newY >= BOARD_HEIGHT), 4. Tabrakan dengan balok lain yang sudah terkunci di papan (board[newY][newX] !== 0).",
    explanation: "Pemeriksaan benturan memastikan tidak ada sel aktif balok yang keluar dari koordinat papan atau bertumpuk dengan sel yang sudah terisi.",
    codingSnippet: `if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false;\nif (newY >= 0 && gameState.board[newY][newX] !== 0) return false;`,
    smkCompetency: "RPL: Boundary & Overlap Validation Logic"
  },

  // ================= MODUL 10 =================
  {
    id: 28,
    moduleId: 10,
    moduleCode: "MODUL-10",
    topic: "Garbage Collection pada Multi-Object Array",
    type: "PG Biasa",
    question: "Pada game Retro Space Impact (Modul 10), mengapa perulangan pembaruan dan penghapusan peluru (bullets) harus dilakukan dengan urutan indeks MUNDUR (for (let i = bullets.length - 1; i >= 0; i--))?",
    options: [
      "A. Karena JavaScript tidak mendukung perulangan maju pada array peluru",
      "B. Agar saat peluru dihapus menggunakan splice(i, 1), pergeseran indeks elemen tidak menyebabkan elemen berikutnya terlewatkan (skip)",
      "C. Agar peluru melaju lebih cepat dari kiri ke kanan",
      "D. Untuk mengaktifkan mode fullscreen otomatis"
    ],
    correctAnswer: "B",
    explanation: "Saat menghapus elemen dari array dengan splice() dalam perulangan maju, panjang array berkurang dan indeks bergeser ke kiri sehingga ada elemen yang terlewati. Perulangan mundur menyelesaikan masalah ini secara bersih.",
    smkCompetency: "RPL: Siklus Hidup Array Dinamis & Algoritma Penghapusan"
  },
  {
    id: 29,
    moduleId: 10,
    moduleCode: "MODUL-10",
    topic: "Deteksi Tabrakan Kotak AABB Multi-Objek",
    type: "PG Kompleks",
    question: "Dua objek kotak A dan B dikatakan bertabrakan secara AABB (Axis-Aligned Bounding Box) jika keempat kondisi tumpang-tindih (overlap) terpenuhi sekaligus. Manakah kondisi yang BENAR?",
    options: [
      "A. A.x < B.x + B.width (Sisi kiri A lebih kiri dari sisi kanan B)",
      "B. A.x + A.width > B.x (Sisi kanan A lebih kanan dari sisi kiri B)",
      "C. A.y < B.y + B.height (Sisi atas A lebih tinggi dari sisi bawah B)",
      "D. A.y + A.height > B.y (Sisi bawah A lebih rendah dari sisi atas B)"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Keempat pertidaksamaan ini adalah definisi matematika formal untuk deteksi tabrakan Axis-Aligned Bounding Box (AABB) 2D.",
    smkCompetency: "RPL: Algoritma Deteksi Tabrakan AABB 2D"
  },
  {
    id: 30,
    moduleId: 10,
    moduleCode: "MODUL-10",
    topic: "Mekanisme Penembakan Peluru Multi-Entity",
    type: "Essay",
    question: "Tuliskan kode fungsi fireBullet() yang menambahkan objek peluru baru ke dalam array gameState.bullets[] dengan properti koordinat X tepat di moncong pesawat (player.x + player.width), posisi Y di tengah badan pesawat, kecepatan speed = 7, dan ukuran width = 8, height = 4!",
    correctAnswer: "gameState.bullets.push({ x: gameState.player.x + gameState.player.width, y: gameState.player.y + gameState.player.height / 2 - 2, width: 8, height: 4, speed: 7 });",
    explanation: "Fungsi memicu penambahan objek proyektil ke antrean peluru aktif dengan koordinat kalkulatif moncong pesawat.",
    codingSnippet: `function fireBullet() {\n    if (gameState.status !== 'PLAYING') return;\n    gameState.bullets.push({\n        x: gameState.player.x + gameState.player.width,\n        y: gameState.player.y + gameState.player.height / 2 - 2,\n        width: 8,\n        height: 4,\n        speed: 7\n    });\n}`,
    smkCompetency: "RPL: Instansiasi Objek Dinamis & Koleksi Array"
  },

  // ================= MODUL 11 =================
  {
    id: 31,
    moduleId: 11,
    moduleCode: "MODUL-11",
    topic: "Status Balok pada Matriks Brick Breaker",
    type: "PG Biasa",
    question: "Dalam modul Retro Brick Breaker (Modul 11), objek balok bricks[c][r] memiliki properti status. Apa arti dari nilai status = 1 dan status = 0?",
    options: [
      "A. status = 1 berarti balok hancur, status = 0 berarti balok aktif",
      "B. status = 1 berarti balok aktif/belum hancur, status = 0 berarti balok sudah hancur/tidak dirender",
      "C. status = 1 berarti balok bergerak, status = 0 berarti balok diam",
      "D. status = 1 berarti balok bernilai bonus, status = 0 berarti balok beracun"
    ],
    correctAnswer: "B",
    explanation: "status = 1 menandakan balok masih utuh, harus digambar, dan dapat memantulkan bola. Saat bola menabraknya, status diubah menjadi 0 sehingga balok tidak lagi dirender dan diabaikan dari deteksi tabrakan.",
    smkCompetency: "RPL: Manajemen Status Entitas Matriks"
  },
  {
    id: 32,
    moduleId: 11,
    moduleCode: "MODUL-11",
    topic: "Deteksi Tabrakan Bola Lingkaran ke Kotak Balok",
    type: "PG Kompleks",
    question: "Kondisi apa sajakah yang memvalidasi bahwa titik pusat bola (ball.x, ball.y) telah mengenai area balok kotak b dengan dimensi brickConfig.width dan brickConfig.height?",
    options: [
      "A. ball.x > b.x",
      "B. ball.x < b.x + brickConfig.width",
      "C. ball.y > b.y",
      "D. ball.y < b.y + brickConfig.height"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Jika seluruh empat kondisi terpenuhi, pusat bola berada di dalam kotak pembatas balok, memicu pembalikan arah pantulan vertikal bola (dy = -dy).",
    smkCompetency: "RPL: Geometri Spasial Kolisi 2D"
  },
  {
    id: 33,
    moduleId: 11,
    moduleCode: "MODUL-11",
    topic: "Inisialisasi Grid Matriks Balok 2D",
    type: "Essay",
    question: "Tuliskan kode fungsi initBricks() untuk mengisi array 2 dimensi bricks[][] dengan jumlah kolom (columnCount = 5) dan jumlah baris (rowCount = 4), di mana setiap elemen menyimpan objek { x: 0, y: 0, status: 1 }!",
    correctAnswer: "function initBricks() { bricks = []; for (let c = 0; c < 5; c++) { bricks[c] = []; for (let r = 0; r < 4; r++) { bricks[c][r] = { x: 0, y: 0, status: 1 }; } } }",
    explanation: "Fungsi menggunakan dua perulangan for bersarang untuk membangun matriks 5 kolom x 4 baris yang masing-masing berisi objek status balok.",
    codingSnippet: `function initBricks() {\n    bricks = [];\n    for (let c = 0; c < brickConfig.columnCount; c++) {\n        bricks[c] = [];\n        for (let r = 0; r < brickConfig.rowCount; r++) {\n            bricks[c][r] = { x: 0, y: 0, status: 1 };\n        }\n    }\n}`,
    smkCompetency: "RPL: Konstruksi Struktur Data Matriks 2D"
  },

  // ================= MODUL 12 =================
  {
    id: 34,
    moduleId: 12,
    moduleCode: "MODUL-12",
    topic: "Input Buffering pada Navigasi Grid Pac-Man",
    type: "PG Biasa",
    question: "Mengapa pada game Pac-Man (Modul 12), perintah arah tombol keyboard pemain disimpan terlebih dahulu ke dalam variabel buffer (pacman.nextDx dan nextDy) daripada langsung mengubah arah seketika?",
    options: [
      "A. Karena JavaScript tidak dapat membaca tombol panah secara langsung",
      "B. Agar pergerakan Pac-Man tetap rapi terkunci pada lorong ubin grid (tile) dan hanya berbelok saat tiba di persimpangan ubin yang tidak terhalang dinding",
      "C. Untuk mempercepat game loop menjadi dua kali lipat",
      "D. Mencegah hantu bergerak mendekati pemain"
    ],
    correctAnswer: "B",
    explanation: "Input buffering memungkinkan pemain menekan tombol belok sebelum mencapai persimpangan. Pac-Man akan terus berjalan lurus hingga persimpangan ubin tercapai, lalu secara otomatis mengeksekusi belokan tanpa macet di dinding.",
    smkCompetency: "RPL: Desain Antarmuka Responsif & Input Buffer"
  },
  {
    id: 35,
    moduleId: 12,
    moduleCode: "MODUL-12",
    topic: "Finite State Machine Hantu (Ghost AI)",
    type: "PG Kompleks",
    question: "Ketika Pac-Man memakan Power Pellet (tile bernilai 3), perubahan status apakah yang terjadi pada sistem permainan?",
    options: [
      "A. Status mode permainan berubah dari 'CHASE' menjadi 'FRIGHTENED'",
      "B. Hantu berubah warna menjadi biru dan kecepatan geraknya melambat",
      "C. Jika Pac-Man bersentuhan dengan hantu dalam mode FRIGHTENED, Pac-Man memakan hantu (+200 skor) dan hantu terlempar kembali ke markas",
      "D. Timer otomatis mengembalikan mode hantu ke 'CHASE' setelah 7 detik"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Semua pernyataan di atas adalah karakteristik state machine mode panik (Frightened Mode) pada game Pac-Man klasik.",
    smkCompetency: "RPL: Penerapan Finite State Machine pada AI Game"
  },
  {
    id: 36,
    moduleId: 12,
    moduleCode: "MODUL-12",
    topic: "Fungsi Validasi Dinding Labirin",
    type: "Essay",
    question: "Tuliskan kode fungsi isWall(gx, gy) yang menerima parameter indeks koordinat grid (gx, gy) dan mengembalikan nilai boolean true jika koordinat tersebut berada di luar batas array peta atau jika grid[gy][gx] === 1 (dinding)!",
    correctAnswer: "function isWall(gx, gy) { if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) return true; return grid[gy][gx] === 1; }",
    explanation: "Fungsi memeriksa batas luar indeks (out-of-bound) terlebih dahulu untuk menghindari TypeError, kemudian mengembalikan true jika sel merupakan dinding.",
    codingSnippet: `function isWall(gx, gy) {\n    // Cek batas indeks array luar\n    if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) return true;\n    // Ubin bernilai 1 adalah dinding tembok labirin\n    return grid[gy][gx] === 1;\n}`,
    smkCompetency: "RPL: Defensive Coding & Array Bounds Checking"
  },

  // ================= MODUL 13 =================
  {
    id: 37,
    moduleId: 13,
    moduleCode: "MODUL-13",
    topic: "Ilusi Gerakan Cepat (Scrolling Movement)",
    type: "PG Biasa",
    question: "Pada game Nitro Street Racing (Modul 13), bagaimana cara pemrogram menciptakan ilusi bahwa mobil balap pemain sedang melaju kencang ke depan pada kecepatan tinggi?",
    options: [
      "A. Menggerakkan mobil pemain terus menerus ke bagian atas layar kanvas hingga keluar",
      "B. Menjaga mobil pemain tetap pada posisi vertikal yang stabil, lalu menggeser garis marka jalan dan mobil lawan ke arah bawah secara terus-menerus",
      "C. Memutar kanvas sebesar 360 derajat menggunakan transform CSS",
      "D. Memperbesar ukuran teks skor secara periodik"
    ],
    correctAnswer: "B",
    explanation: "Prinsip gerak relatif (relative motion): dengan menahan posisi pemain dan menggeser marka jalan serta rintangan ke arah bawah, otak manusia mempersepsikan mobil pemain melaju kencang ke depan.",
    smkCompetency: "RPL: Konsep Fisika Gerak Relatif & Parallax"
  },
  {
    id: 38,
    moduleId: 13,
    moduleCode: "MODUL-13",
    topic: "Manajemen Sumber Daya Nitro (Resource Drain & Regen)",
    type: "PG Kompleks",
    question: "Manakah aturan logika pengelolaan bahan bakar Nitro (gameState.nitroFuel) pada Modul 13 yang tepat?",
    options: [
      "A. Saat tombol Nitro (Spasi/Shift) aktif, kecepatan disetel ke maxSpeed dan bahan bakar berkurang (nitroFuel -= 1.5)",
      "B. Jika bahan bakar habis (nitroFuel <= 0), status Nitro otomatis mati dan kecepatan kembali ke normalSpeed",
      "C. Saat Nitro tidak digunakan dan bahan bakar di bawah 100%, sistem meregenerasi bahan bakar secara perlahan (nitroFuel += 0.2)",
      "D. Bahan bakar nitro hanya dapat diisi ulang dengan membeli item berbayar di toko"
    ],
    correctAnswer: "A, B, C",
    explanation: "A, B, dan C mendeskripsikan siklus resource drain dan passive regen pada game balapan arcade modern.",
    smkCompetency: "RPL: Resource Management & Nilai State Dinamis"
  },
  {
    id: 39,
    moduleId: 13,
    moduleCode: "MODUL-13",
    topic: "Perhitungan Jarak Tempuh & Skor",
    type: "Essay",
    question: "Dalam game balap jalanan, jarak tempuh (skor dalam meter) bertambah lebih cepat ketika pemain mengaktifkan Nitro Boost dibandingkan saat melaju normal. Tuliskan baris kode pembaruan skor di dalam game loop yang mengaitkan penambahan skor secara langsung dengan kecepatan mobil saat ini (gameState.speed)!",
    correctAnswer: "gameState.score += Math.floor(gameState.speed / 2);",
    explanation: "Dengan menambahkan fraksi kecepatan mobil ke skor pada setiap frame, mobil yang melaju pada kecepatan 12 (Nitro) akan menghasilkan poin skor jauh lebih cepat daripada mobil berkecepatan 5.",
    codingSnippet: `// Pembaruan skor berbanding lurus dengan kecepatan mobil saat ini\ngameState.score += Math.floor(gameState.speed / 2);`,
    smkCompetency: "RPL: Matematika Proporsional pada Game State"
  },

  // ================= MODUL 14 =================
  {
    id: 40,
    moduleId: 14,
    moduleCode: "MODUL-14",
    topic: "Trigonometri Arah Tembakan Meriam",
    type: "PG Biasa",
    question: "Dalam game Bubble Bash / Puzzle Bobble (Modul 14), fungsi matematika trigonometri apakah yang digunakan untuk menghitung sudut kemiringan meriam (angle) berdasarkan selisih koordinat mouse kursor dan posisi meriam?",
    options: [
      "A. Math.sqrt(mouseX + mouseY)",
      "B. Math.atan2(mouseY - shooter.y, mouseX - shooter.x)",
      "C. Math.sin(shooter.x) * Math.cos(shooter.y)",
      "D. Math.round(mouseX / mouseY)"
    ],
    correctAnswer: "B",
    explanation: "Math.atan2(dy, dx) mengembalikan sudut radian (arc tangent 2 kuadran) dari vektor selisih sumbu Y dan X secara akurat untuk rotasi objek membidik kursor.",
    smkCompetency: "RPL: Trigonometri & Kalkulasi Vektor Rotasi"
  },
  {
    id: 41,
    moduleId: 14,
    moduleCode: "MODUL-14",
    topic: "Algoritma Pencarian Kelompok (Flood Fill / Match-3+)",
    type: "PG Kompleks",
    question: "Bagaimanakah alur kerja algoritma Flood Fill (Breadth-First Search) saat mendeteksi kelompok gelembung berwarna sama yang meletus di Modul 14?",
    options: [
      "A. Memeriksa gelembung tetangga yang bersebelahan menggunakan fungsi getNeighbors(r, c)",
      "B. Menggunakan array antrean (queue) dan matriks boolean visited[][] untuk mencegah pengecekan berulang",
      "C. Memeriksa apakah warna gelembung tetangga sama persis dengan targetColor",
      "D. Jika jumlah kelompok yang terhubung (cluster.length) >= 3, seluruh gelembung dalam kelompok diubah nilainya menjadi 0 (meletus)"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh pernyataan merupakan implementasi standar algoritma graf Breadth-First Search (BFS) / Flood Fill untuk mekanika game Match-3 Bubble Shooter.",
    smkCompetency: "RPL: Algoritma Rekursif & Traversal Graf (BFS)"
  },
  {
    id: 42,
    moduleId: 14,
    moduleCode: "MODUL-14",
    topic: "Peruntuhan Gelembung Melayang (Floating Bubble Drop)",
    type: "Essay",
    question: "Jelaskan konsep algoritma 'dropFloatingBubbles()' dalam game puzzle penembak gelembung! Mengapa gelembung yang tidak lagi terhubung secara fisik ke langit-langit atap (baris 0) harus diruntuhkan, dan bagaimana algoritma mendeteksi hal tersebut?",
    correctAnswer: "Algoritma mencari semua gelembung yang terhubung ke baris paling atas (langit-langit) menggunakan BFS. Gelembung manapun di papan yang tidak terhubung ke atap dianggap 'menggantung' tanpa jangkar fisik (floating). Algoritma menghapus gelembung tersebut dan memberikan skor bonus kepada pemain.",
    explanation: "Pemeriksaan konektivitas komponen terhubung (connected component) ke simpul sumber di baris 0.",
    codingSnippet: `// Gelembung tanpa koneksi ke baris 0 diruntuhkan\nfor (let r = 0; r < GRID_ROWS; r++) {\n    for (let c = 0; c < GRID_COLS; c++) {\n        if (grid[r][c] !== 0 && !connectedToTop[r][c]) {\n            grid[r][c] = 0; // Hancurkan gelembung menggantung\n            gameState.score += 150;\n        }\n    }\n}`,
    smkCompetency: "RPL: Analisis Keterhubungan Graf & Logika Gravitasi"
  },

  // ================= MODUL 15 =================
  {
    id: 43,
    moduleId: 15,
    moduleCode: "MODUL-15",
    topic: "Fisika Gravitasi Parabola Game Platformer",
    type: "PG Biasa",
    question: "Dalam implementasi game action platformer Contra (Modul 15), bagaimanakah cara kerja variabel gravitasi (player.gravity = 0.5) terhadap kecepatan vertikal pemain (player.dy)?",
    options: [
      "A. Nilai dy dikurangi setiap frame agar pemain terus melayang ke atas",
      "B. Nilai dy ditambah secara konstan setiap frame (player.dy += player.gravity) sehingga kecepatan jatuh pemain bertambah cepat (akselerasi gravitasi)",
      "C. Gravitasi langsung mengubah koordinat player.x ke nilai 0",
      "D. Gravitasi mematikan listener keyboard pemain"
    ],
    correctAnswer: "B",
    explanation: "Dalam fisika komputasi, percepatan gravitasi dimodelkan dengan menambahkan nilai akselerasi konstan (gravity) ke kecepatan vertikal (dy) pada setiap frame, menciptakan kurva parabola lompatan alami.",
    smkCompetency: "RPL: Pemodelan Fisika Gravitasi Kinematika 2D"
  },
  {
    id: 44,
    moduleId: 15,
    moduleCode: "MODUL-15",
    topic: "Deteksi Pendaratan di Platform Melayang",
    type: "PG Kompleks",
    question: "Kondisi apa sajakah yang harus dipenuhi agar karakter tentara Contra dapat mendarat di atas platform melayang tanpa tembus ke bawahnya?",
    options: [
      "A. Pemain sedang bergerak jatuh ke bawah (player.dy > 0)",
      "B. Posisi horizontal pemain berada dalam rentang lebar platform (player.x + player.width > plat.x && player.x < plat.x + plat.width)",
      "C. Kaki pemain berada tepat menyentuh permukaan atas platform (player.y + player.height >= plat.y)",
      "D. Variabel player.dy disetel ke 0 dan player.isGrounded disetel ke true saat mendarat"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh kondisi ini memvalidasi pendaratan one-way platform (pijakan satu arah) agar pemain bisa melompat dari bawah platform dan mendarat di atasnya.",
    smkCompetency: "RPL: Collision Detection Platformer & State Grounded"
  },
  {
    id: 45,
    moduleId: 15,
    moduleCode: "MODUL-15",
    topic: "Logika Arah Tembakan Proyektil Multi-Directional",
    type: "Essay",
    question: "Tuliskan kode penentuan kecepatan peluru (bDx dan bDy) saat fungsi fireBullet() dipanggil, di mana peluru meluncur vertikal ke atas jika tombol panah atas ditekan (keys['ArrowUp']), meluncur ke kiri jika player.facing === 'LEFT', dan meluncur ke kanan pada kondisi lainnya!",
    correctAnswer: "if (keys['ArrowUp']) { bDy = -bulletSpeed; } else if (player.facing === 'LEFT') { bDx = -bulletSpeed; } else { bDx = bulletSpeed; }",
    explanation: "Percabangan mengevaluasi input arah sebelum menambahkan peluru ke array playerBullets[].",
    codingSnippet: `let bDx = 0, bDy = 0;\nconst bulletSpeed = 8;\n\nif (keys['ArrowUp'] || keys['w']) {\n    bDy = -bulletSpeed; // Tembak lurus ke atas\n} else if (player.facing === 'LEFT') {\n    bDx = -bulletSpeed; // Tembak ke kiri\n} else {\n    bDx = bulletSpeed;  // Tembak ke kanan\n}`,
    smkCompetency: "RPL: Multi-Directional Vector Shooting Logic"
  },

  // ================= MODUL 16 =================
  {
    id: 46,
    moduleId: 16,
    moduleCode: "MODUL-16",
    topic: "Waypoint Distance Interpolation pada Jalur Melengkung",
    type: "PG Biasa",
    question: "Pada game Zuma (Modul 16), bagaimana posisi koordinat (x, y) dari setiap bola di rantai ditentukan saat bergerak melintasi kurva lintasan berliku?",
    options: [
      "A. Menggunakan perulangan for acak tanpa lintasan terdefinisi",
      "B. Menggunakan fungsi interpolasi getPointAtDistance(distance) yang menghitung posisi titik (x,y) proporsional di sepanjang segmen waypoint",
      "C. Menempatkan seluruh bola pada posisi koordinat statis (0, 0)",
      "D. Menghitung sudut rotasi layar kanvas"
    ],
    correctAnswer: "B",
    explanation: "Lintasan Zuma dimodelkan sebagai rangkaian titik koordinat (waypoints). Setiap bola menyimpan jarak tempuh kumulatif (distance) dan fungsi interpolasi mengonversinya ke posisi piksel (x,y).",
    smkCompetency: "RPL: Kurva Parametrik & Interpolasi Spasial Waypoint"
  },
  {
    id: 47,
    moduleId: 16,
    moduleCode: "MODUL-16",
    topic: "Manipulasi Array Rantai Bola Zuma (Insertion & Match-3)",
    type: "PG Kompleks",
    question: "Manakah operasi array yang terjadi ketika bola yang ditembakkan menabrak rantai bola yang sedang berjalan pada Modul 16?",
    options: [
      "A. Menggeser nilai jarak (distance) seluruh bola di belakang indeks tabrakan sebesar diameter bola (BALL_RADIUS * 2)",
      "B. Menyisipkan bola baru ke dalam array rantai menggunakan ballChain.splice(j, 0, newBall)",
      "C. Menghapus bola tembak dari array firedBalls via firedBalls.splice(i, 1)",
      "D. Memeriksa apakah bola yang baru disisipkan menghasilkan deretan 3 atau lebih bola sewarna berturut-turut untuk dihancurkan"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh tahapan tersebut merupakan logika presisi penyisipan elemen ke rantai dan pemicuan ledakan Match-3 pada Zuma.",
    smkCompetency: "RPL: Manipulasi Array Dinamis & Reaksi Berantai"
  },
  {
    id: 48,
    moduleId: 16,
    moduleCode: "MODUL-16",
    topic: "Deteksi Kondisi Game Over Jalur Akhir",
    type: "Essay",
    question: "Tuliskan logika pemeriksaan kondisi Game Over pada game loop Zuma jika terdapat salah satu bola pada array rantai (ballChain) yang jarak tempuhnya telah mencapai atau melampaui panjang maksimal lintasan (getMaxPathDistance())!",
    correctAnswer: "const maxDist = getMaxPathDistance(); ballChain.forEach(ball => { if (ball.distance >= maxDist) { gameState.status = 'GAME_OVER'; } });",
    explanation: "Jika ada bola yang menempuh jarak sama dengan atau lebih besar dari panjang total jalur waypoints, bola tersebut telah memasuki lubang tengkorak akhir, sehingga memicu status GAME_OVER.",
    codingSnippet: `const maxDist = getMaxPathDistance();\nballChain.forEach(ball => {\n    ball.distance += 0.8; // Majukan bola\n    if (ball.distance >= maxDist) {\n        gameState.status = 'GAME_OVER'; // Bola masuk ke lubang akhir!\n    }\n});`,
    smkCompetency: "RPL: Evaluasi State Kemenangan & Kekalahan Game"
  },

  // ================= MODUL 17 =================
  {
    id: 49,
    moduleId: 17,
    moduleCode: "MODUL-17",
    topic: "Viewport Camera Scrolling Transform",
    type: "PG Biasa",
    question: "Pada game Super Mario Bros (Modul 17), method konteks kanvas apakah yang digunakan untuk menggeser sudut pandang kamera (viewport) ke arah kanan saat Mario melangkah melebihi titik tengah layar?",
    options: [
      "A. ctx.scale(worldOffset, worldOffset)",
      "B. ctx.translate(-gameState.worldOffset, 0)",
      "C. ctx.rotate(worldOffset)",
      "D. ctx.clearRect(-worldOffset, 0)"
    ],
    correctAnswer: "B",
    explanation: "Method ctx.translate(-worldOffset, 0) menggeser titik origin koordinat kanvas ke arah kiri sebesar offset dunia, sehingga seluruh elemen digambar relatif terhadap kamera scrolling.",
    smkCompetency: "RPL: Transformasi Matriks Kanvas & Viewport Scrolling"
  },
  {
    id: 50,
    moduleId: 17,
    moduleCode: "MODUL-17",
    topic: "Directional Collision: Injak Musuh vs Terkena Cedera",
    type: "PG Kompleks",
    question: "Dalam logika pemrograman platformer Mario, parameter apakah yang membuktikan bahwa Mario berhasil menginjak musuh Goomba dari atas dan BUKAN menabraknya dari samping?",
    options: [
      "A. Mario sedang bergerak jatuh ke bawah dengan kecepatan vertikal positif (mario.dy > 0)",
      "B. Kaki Mario berada pada posisi yang lebih tinggi dari batas kepala musuh sebelum frame tabrakan (mario.y + mario.height - mario.dy <= enemy.y + 12)",
      "C. Mario memantul kembali ke atas dengan memberikan impuls kecepatan negatif (mario.dy = -7)",
      "D. Musuh dinonaktifkan (enemy.alive = false) dan skor bertambah 100 poin"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Pemeriksaan arah vektor jatuh dan posisi kaki membedakan aksi sukses menginjak musuh dari atas dengan tabrakan samping yang merugikan pemain.",
    smkCompetency: "RPL: Logika Tabrakan Bersyarat Arah (Directional Collision)"
  },
  {
    id: 51,
    moduleId: 17,
    moduleCode: "MODUL-17",
    topic: "Pengambilan Koin & Kondisi Bendera Finish",
    type: "Essay",
    question: "Tuliskan kode fungsi respawnMario() yang bertugas mereset posisi Mario ke koordinat awal (x: 50, y: 180), menghentikan laju kecepatan (dx = 0, dy = 0), mengatur status isGrounded = false, dan mengembalikan offset kamera dunia (gameState.worldOffset = 0) saat Mario kehilangan satu nyawa!",
    correctAnswer: "function respawnMario() { mario.x = 50; mario.y = 180; mario.dx = 0; mario.dy = 0; mario.isGrounded = false; gameState.worldOffset = 0; }",
    explanation: "Fungsi memulihkan seluruh properti fisik Mario dan posisi kamera kanvas kembali ke titik awal level permainan.",
    codingSnippet: `function respawnMario() {\n    mario.x = 50;\n    mario.y = 180;\n    mario.dx = 0;\n    mario.dy = 0;\n    mario.isGrounded = false;\n    gameState.worldOffset = 0; // Reset kamera scrolling ke titik 0\n}`,
    smkCompetency: "RPL: Reset State & Manajemen Titik Respawn"
  },

  // ================= MODUL 18 =================
  {
    id: 52,
    moduleId: 18,
    moduleCode: "MODUL-18",
    topic: "Acrobatic State Machine pada Prince of Persia J2ME",
    type: "PG Biasa",
    question: "Dalam Modul 18 (Prince of Persia J2ME), ketika pangeran mendeteksi sudut tebing tinggi saat melompat di udara, status (state) apakah yang diaktifkan untuk menahan gravitasi dan memungkinkan pemain memanjat ke atas?",
    options: [
      "A. IDLE",
      "B. LEDGE_GRAB",
      "C. TIME_UP",
      "D. HURT"
    ],
    correctAnswer: "B",
    explanation: "Status LEDGE_GRAB mengunci pergerakan vertikal pangeran di bibir tebing platform, menonaktifkan efek gravitasi sementara, dan menunggu tombol panah atas ditekan untuk memanjat naik.",
    smkCompetency: "RPL: Finite State Machine Gerakan Akrobatik"
  },
  {
    id: 53,
    moduleId: 18,
    moduleCode: "MODUL-18",
    topic: "Global Countdown Session Timer 60 Detik",
    type: "PG Kompleks",
    question: "Manakah pernyataan yang BENAR mengenai sistem hitung mundur sesi waktu global (session timer) pada Modul 18? (Pilih pernyataan yang benar)",
    options: [
      "A. Menggunakan interval 1000 milidetik untuk mengurangi sisa waktu gameState.timeLeft sebanyak 1 per detik",
      "B. Format tampilan menit dan detik diformat secara digital menggunakan padStart(2, '0')",
      "C. Jika sisa waktu mencapai 0 (timeLeft <= 0), status permainan otomatis berubah menjadi 'TIME_UP'",
      "D. Timer otomatis dihentikan menggunakan clearInterval() saat permainan berakhir atau di-restart"
    ],
    correctAnswer: "A, B, C, D",
    explanation: "Seluruh pernyataan mendeskripsikan implementasi countdown timer sesi global berstandar industri.",
    smkCompetency: "RPL: Manajemen Sesi Waktu Global & String Formatting"
  },
  {
    id: 54,
    moduleId: 18,
    moduleCode: "MODUL-18",
    topic: "Interaksi Rintangan Duri & Pintu Keluar Kastil",
    type: "Essay",
    question: "Tuliskan logika penanganan aksi ketika tombol lompat/panjat (ArrowUp / W) ditekan saat pangeran sedang berada dalam status 'LEDGE_GRAB'. Pangeran harus dinaikkan posisinya sejauh 42 piksel ke atas (y -= 42), digeser maju sesuai arah hadap pangeran (facing === 'RIGHT' ? +15 : -15), dan statusnya dikembalikan ke 'IDLE'!",
    correctAnswer: "if (prince.state === 'LEDGE_GRAB') { prince.y -= 42; prince.x += (prince.facing === 'RIGHT') ? 15 : -15; prince.state = 'IDLE'; }",
    explanation: "Aksi panjat tebing memodifikasi koordinat pangeran agar berdiri tegak di atas permukaan platform tebing dan melepaskan status gantung.",
    codingSnippet: `// Panjat Naik dari Tepi Tebing\nif (prince.state === 'LEDGE_GRAB') {\n    prince.y -= 42; // Naikkan ke atas lantai tebing\n    prince.x += (prince.facing === 'RIGHT') ? 15 : -15;\n    prince.state = 'IDLE';\n}`,
    smkCompetency: "RPL: Transisi Status State Machine & Manipulasi Koordinat"
  },

  // ================= MODUL 19 =================
  {
    id: 55,
    moduleId: 19,
    moduleCode: "MODUL-19",
    topic: "Fungsi Evaluasi Biaya Algoritma A*",
    type: "PG Biasa",
    question: "Dalam algoritma pencarian rute terpendek A* (A-Star), evaluasi biaya setiap node dihitung dengan rumus f(n) = g(n) + h(n). Apakah makna dari komponen h(n)?",
    options: [
      "A. Biaya aktual kumulatif dari titik awal ke node saat ini",
      "B. Estimasi biaya heuristik dari node saat ini ke node tujuan (Goal)",
      "C. Jumlah total rintangan yang telah dilewati oleh robot navigasi",
      "D. Waktu eksekusi yang dibutuhkan prosesor untuk mencari rute"
    ],
    correctAnswer: "B",
    explanation: "Dalam A*, g(n) adalah biaya riil dari start ke node n, sedangkan h(n) adalah perkiraan biaya heuristik dari node n menuju target tujuan (Goal).",
    smkCompetency: "RPL: Algoritma Pencarian Jalur Cerdas & Struktur Data Graph"
  },
  {
    id: 56,
    moduleId: 19,
    moduleCode: "MODUL-19",
    topic: "Heuristik Jarak Manhattan pada Grid",
    type: "PG Kompleks",
    question: "Perhatikan pernyataan berikut mengenai perhitungan Jarak Manhattan pada grid navigasi 4-arah (Atas, Bawah, Kiri, Kanan):\n1. Rumus Manhattan adalah Math.abs(x1 - x2) + Math.abs(y1 - y2).\n2. Sangat cocok untuk pergerakan berbasis grid tanpa jalur diagonal bebas.\n3. Jarak Manhattan selalu menghasilkan estimasi yang lebih panjang atau sama dengan jarak Euclidean (garis lurus).\n4. Manhattan distance menjamin bahwa A* tidak akan pernah menemukan rute optimal.\nManakah kombinasi pernyataan yang BENAR?",
    options: [
      "A. 1, 2, dan 3",
      "B. 1, 2, dan 4",
      "C. 2, 3, dan 4",
      "D. Semua benar"
    ],
    correctAnswer: "A",
    explanation: "Pernyataan 1, 2, dan 3 benar. Pernyataan 4 salah karena heuristik Manhattan yang admissible menjamin A* menemukan rute optimal pada grid 4 arah.",
    smkCompetency: "TJKT/RPL: Logika Grafika & Matematika Vektor Diskrit"
  },
  {
    id: 57,
    moduleId: 19,
    moduleCode: "MODUL-19",
    topic: "Rekonstruksi Jalur A* Melalui Rantai Parent",
    type: "Essay",
    question: "Ketika algoritma A* mencapai node tujuan (goalNode), bagaimana kode JavaScript merekonstruksi rute lintasan dari goalNode kembali ke startNode menggunakan referensi node.parent? Tuliskan fungsi rekonstruksinya!",
    correctAnswer: "function reconstructPath(current) { const path = []; while (current) { path.push({ x: current.x, y: current.y }); current = current.parent; } return path.reverse(); }",
    explanation: "Rekonstruksi dilakukan dengan melacak mundur rantai pointer node.parent dari goal sampai titik start (parent === null), kemudian membalikkan urutan array (reverse).",
    codingSnippet: `function reconstructPath(goalNode) {\n    const path = [];\n    let curr = goalNode;\n    while (curr) {\n        path.push({ c: curr.c, r: curr.r });\n        curr = curr.parent;\n    }\n    return path.reverse();\n}`,
    smkCompetency: "RPL: Pointer Traversal & Rekonstruksi Jalur Graph"
  },

  // ================= MODUL 20 =================
  {
    id: 58,
    moduleId: 20,
    moduleCode: "MODUL-20",
    topic: "Kinematika Partikel & Integrasi Euler",
    type: "PG Biasa",
    question: "Pada simulasi Particle Engine 2D berbasis fisika, bagaimana rumus integrasi Euler yang tepat untuk memperbarui kecepatan dan posisi setiap partikel per frame di bawah pengaruh gravitasi?",
    options: [
      "A. p.vy += gravity; p.x += p.vx; p.y += p.vy; p.life -= p.decay;",
      "B. p.x = p.vx * gravity; p.y = p.vy * gravity;",
      "C. p.life = p.x + p.y; p.vx = 0;",
      "D. p.y -= gravity; p.vy = 0;"
    ],
    correctAnswer: "A",
    explanation: "Integrasi Euler menambahkan akselerasi gravitasi ke kecepatan vertikal (p.vy += gravity), menambahkan kecepatan ke posisi koordinat (p.x += p.vx; p.y += p.vy), serta mengurangi sisa masa hidup partikel.",
    smkCompetency: "RPL: Fisika Game Komputasional & Vektor Kinematika"
  },
  {
    id: 59,
    moduleId: 20,
    moduleCode: "MODUL-20",
    topic: "Manajemen Memori Array Partikel",
    type: "PG Kompleks",
    question: "Manakah teknik optimal yang wajib diterapkan agar sistem partikel ledakan tidak menyebabkan memory leak atau penurunan FPS (drop frame) pada browser?\n1. Menggunakan array.filter() atau loop mundur (for i = length-1; i >= 0; i--) untuk menghapus partikel dengan life <= 0.\n2. Menggunakan ctx.globalCompositeOperation = 'lighter' atau 'screen' untuk efek berpendar cahaya neon.\n3. Membatasi jumlah maksimum partikel aktif (misal max 500 partikel sekaligus).\n4. Tidak perlu menghapus partikel lama karena JavaScript browser membersihkan objek secara instan.",
    options: [
      "A. 1, 2, dan 3",
      "B. 1 dan 3 saja",
      "C. 2 dan 4 saja",
      "D. Semua benar"
    ],
    correctAnswer: "A",
    explanation: "Pernyataan 1, 2, dan 3 adalah praktik terbaik. Pernyataan 4 salah karena membiarkan partikel mati tetap di array akan membebani siklus render dan menyebabkan lag.",
    smkCompetency: "TJKT/RPL: Optimasi Performa Web & Garbage Collection"
  },
  {
    id: 60,
    moduleId: 20,
    moduleCode: "MODUL-20",
    topic: "Pembuatan Ledakan Partikel Radial",
    type: "Essay",
    question: "Tuliskan kode fungsi JavaScript `spawnExplosion(x, y, count, color)` untuk memunculkan sejumlah partikel ledakan radial di titik (x, y) dengan sudut acak 360 derajat (0 sampai Math.PI * 2), kecepatan acak antara 2 hingga 8, dan masa hidup awal 1.0!",
    correctAnswer: "for(let i=0; i<count; i++){ const angle = Math.random() * Math.PI * 2; const speed = 2 + Math.random() * 6; particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 1.0, decay: 0.02 + Math.random()*0.02, color }); }",
    explanation: "Menggunakan fungsi trigonometri Math.cos(angle) dan Math.sin(angle) untuk mengubah sudut dan magnitudo kecepatan menjadi komponen vektor vx dan vy.",
    codingSnippet: `function spawnExplosion(x, y, count, color) {\n    for (let i = 0; i < count; i++) {\n        const angle = Math.random() * Math.PI * 2;\n        const speed = 2 + Math.random() * 6;\n        particles.push({\n            x, y,\n            vx: Math.cos(angle) * speed,\n            vy: Math.sin(angle) * speed,\n            color,\n            life: 1.0,\n            decay: 0.02 + Math.random() * 0.02,\n            radius: 2 + Math.random() * 3\n        });\n    }\n}`,
    smkCompetency: "RPL: Vektor Trigonometri & Generator Efek Visual"
  },

  // ================= MODUL 21 =================
  {
    id: 61,
    moduleId: 21,
    moduleCode: "MODUL-21",
    topic: "Tegangan Tali & Hukum Hooke",
    type: "PG Biasa",
    question: "Dalam mekanika grappling hook bionik, ketika jarak antara pemain dan titik jangkar (anchor) melebihi panjang maksimum tali (ropeLength), gaya apakah yang diterapkan untuk menarik pemain kembali ke arah jangkar?",
    options: [
      "A. Gaya gesek udara statis",
      "B. Gaya pemulih pegas / tegangan tali (Tension Force)",
      "C. Gaya tolak magnetik",
      "D. Gaya dorong roket horizontal"
    ],
    correctAnswer: "B",
    explanation: "Tegangan tali (rope tension) bertindak sebagai gaya penarik elastis (spring constraint) yang menarik pemain sepanjang vektor unit menuju titik jangkar jika jarak melampaui toleransi tali.",
    smkCompetency: "RPL: Simulasi Mekanika Fisika Tali & Pegas"
  },
  {
    id: 62,
    moduleId: 21,
    moduleCode: "MODUL-21",
    topic: "Vektor Ayunan Pendulum Grapple Hook",
    type: "PG Kompleks",
    question: "Ketika karakter berayun pada grappling hook, manakah komponen vektor yang terlibat dalam menghasilkan ayunan melingkar alami (pendulum swing)?\n1. Vektor selisih posisi: dx = anchor.x - player.x dan dy = anchor.y - player.y.\n2. Vektor normal unit arah tali: nx = dx / distance dan ny = dy / distance.\n3. Gaya gravitasi vertikal yang terus menambah kecepatan jatuh pemain.\n4. Proyeksi kecepatan tegak lurus (tangensial) yang menciptakan putaran busur lingkaran.",
    options: [
      "A. 1, 2, dan 3",
      "B. 1, 2, 3, dan 4",
      "C. 2 dan 4 saja",
      "D. 1 dan 4 saja"
    ],
    correctAnswer: "B",
    explanation: "Keempat komponen ini bekerja sama dalam kinematika pendulum: menghitung selisih koordinat, normalisasi vektor tali, gravitasi, dan pembatasan kecepatan tangensial.",
    smkCompetency: "RPL: Kinematika Pendulum & Matematika Vektor Normalisasi"
  },
  {
    id: 63,
    moduleId: 21,
    moduleCode: "MODUL-21",
    topic: "Penembakan Proyektil Kait ke Titik Kursor",
    type: "Essay",
    question: "Tuliskan kode JavaScript untuk menginisialisasi proyektil kait (hook projectile) dari posisi karakter (player.x, player.y) yang meluncur lurus menuju koordinat target klik mouse (mouseX, mouseY) dengan kecepatan konstan 18 piksel/frame!",
    correctAnswer: "const dx = mouseX - player.x; const dy = mouseY - player.y; const dist = Math.hypot(dx, dy) || 1; hook.x = player.x; hook.y = player.y; hook.vx = (dx / dist) * 18; hook.vy = (dy / dist) * 18; hook.active = true;",
    explanation: "Menghitung jarak total dengan Math.hypot, melakukan normalisasi (dx/dist, dy/dist), lalu mengalikan dengan kecepatan proyektil (18).",
    codingSnippet: `function launchHook(targetX, targetY) {\n    const dx = targetX - player.x;\n    const dy = targetY - player.y;\n    const dist = Math.hypot(dx, dy) || 1;\n    hook.x = player.x;\n    hook.y = player.y;\n    hook.vx = (dx / dist) * 18;\n    hook.vy = (dy / dist) * 18;\n    hook.active = true;\n    hook.latched = false;\n}`,
    smkCompetency: "RPL: Vektor Peluru Proyektil & Interaksi Mouse Pointer"
  },

  // ================= MODUL 22 =================
  {
    id: 64,
    moduleId: 22,
    moduleCode: "MODUL-22",
    topic: "Prinsip Dasar Klasifikasi K-Nearest Neighbors (KNN)",
    type: "PG Biasa",
    question: "Bagaimanakah algoritma K-Nearest Neighbors (KNN) menentukan label kelas (prediksi) untuk sebuah titik data uji baru pada kanvas 2D?",
    options: [
      "A. Menghitung gradien bobot menggunakan algoritma backpropagation",
      "B. Mencari K tetangga terdekat berdasarkan jarak geometris dan memilih label terbanyak (majority voting)",
      "C. Membagi data menjadi cabang pohon keputusan acak (decision tree split)",
      "D. Menghasilkan teks deskriptif menggunakan generative neural network"
    ],
    correctAnswer: "B",
    explanation: "KNN adalah algoritma supervised learning berbasis instance (lazy learner) yang mengukur jarak ke seluruh data training, mengambil K tetangga terdekat, dan menentukan kelas pemenang melalui suara terbanyak (majority vote).",
    smkCompetency: "TJKT/RPL: Konsep Dasar Supervised Machine Learning"
  },
  {
    id: 65,
    moduleId: 22,
    moduleCode: "MODUL-22",
    topic: "Parameter K & Jarak Euclidean pada KNN",
    type: "PG Kompleks",
    question: "Perhatikan pertimbangan pemilihan hiperparameter K dalam implementasi algoritma KNN:\n1. Nilai K = 1 sangat sensitif terhadap outlier dan noise pada data.\n2. Untuk klasifikasi biner (2 kelas), disarankan memilih nilai K ganjil (misal 3, 5, 7) guna menghindari hasil voting seri (draw/tie).\n3. Nilai K yang terlalu besar dapat menyebabkan batas keputusan (decision boundary) menjadi terlalu bias dan menghiraukan kelompok kecil.\n4. KNN memerlukan proses pelatihan (training phase) yang memakan waktu komputasi GPU berjam-jam sebelum bisa memprediksi.\nManakah pernyataan yang BENAR?",
    options: [
      "A. 1, 2, dan 3",
      "B. 1 dan 4 saja",
      "C. 2, 3, dan 4",
      "D. Semua benar"
    ],
    correctAnswer: "A",
    explanation: "Pernyataan 1, 2, dan 3 benar. Pernyataan 4 salah karena KNN tidak memiliki fase training berulang bobot (tidak ada model parameter learning), seluruh kalkulasi jarak dilakukan saat inferensi (testing).",
    smkCompetency: "RPL: Hiperparameter Machine Learning & Optimasi Voting"
  },
  {
    id: 66,
    moduleId: 22,
    moduleCode: "MODUL-22",
    topic: "Fungsi Perhitungan Jarak Euclidean",
    type: "Essay",
    question: "Tuliskan implementasi fungsi JavaScript `euclideanDistance(p1, p2)` yang menerima dua objek titik koordinat `{x, y}` dan mengembalikan nilai jarak geometris Euclidean di antara keduanya!",
    correctAnswer: "function euclideanDistance(p1, p2) { const dx = p1.x - p2.x; const dy = p1.y - p2.y; return Math.sqrt(dx * dx + dy * dy); }",
    explanation: "Jarak Euclidean dihitung berdasarkan rumus Pythagoras d = sqrt((x1-x2)^2 + (y1-y2)^2). Di JavaScript modern juga dapat menggunakan Math.hypot(p1.x - p2.x, p1.y - p2.y).",
    codingSnippet: `function euclideanDistance(p1, p2) {\n    const dx = p1.x - p2.x;\n    const dy = p1.y - p2.y;\n    return Math.hypot(dx, dy);\n}`,
    smkCompetency: "TJKT/RPL: Formula Jarak Geometris dalam Machine Learning"
  },

  // ================= MODUL 23 =================
  {
    id: 67,
    moduleId: 23,
    moduleCode: "MODUL-23",
    topic: "Keputusan Jaringan Syaraf Tiruan Feedforward",
    type: "PG Biasa",
    question: "Pada simulasi Neuro-Evolution burung AI mandiri, jika output neuron dari otak burung bernilai 0.78 (melebihi ambang batas threshold 0.5), aksi apakah yang dilakukan oleh burung tersebut?",
    options: [
      "A. Burung langsung mati dan didiskualifikasi",
      "B. Burung melakukan kepakan sayap (Flap / Lompat ke atas)",
      "C. Burung membalikkan arah terbang ke kiri",
      "D. Burung berhenti di udara secara permanen"
    ],
    correctAnswer: "B",
    explanation: "Perceptron atau output neuron bertindak sebagai pemicu aksi biner: jika output aktivasi melebihi nilai threshold (misal > 0.5), burung mengeksekusi aksi kepak sayap (velocity = jumpForce).",
    smkCompetency: "RPL: Inferensi Jaringan Syaraf Tiruan (Feedforward Neural Net)"
  },
  {
    id: 68,
    moduleId: 23,
    moduleCode: "MODUL-23",
    topic: "Siklus Algoritma Genetika pada Agen AI",
    type: "PG Kompleks",
    question: "Manakah urutan tahapan yang BENAR dalam siklus Algoritma Genetika ketika satu generasi burung AI mati seluruhnya?\n1. Evaluasi Fitness: Menghitung skor kebugaran setiap individu berdasarkan durasi bertahan hidup dan rintangan yang berhasil dilewati.\n2. Elitisme: Memilih 1 atau 2 burung terbaik dari generasi sebelumnya untuk disalin langsung tanpa mutasi ke generasi baru.\n3. Crossover & Kloning: Membuat populasi baru dari otak pemenang generasi sebelumnya.\n4. Mutasi Acak: Mengubah bobot sinapsis (weights) dan bias secara acak dengan peluang mutasi kecil (misal 5-10%) untuk eksplorasi strategi baru.",
    options: [
      "A. 1, 2, 3, dan 4",
      "B. 1, 3, dan 4 saja",
      "C. 2 dan 4 saja",
      "D. 1 dan 2 saja"
    ],
    correctAnswer: "A",
    explanation: "Seluruh tahapan (Evaluasi Fitness, Elitisme, Crossover/Kloning, dan Mutasi Acak) merupakan pilar utama evolusi neuro-evolusioner agen cerdas.",
    smkCompetency: "RPL: Prinsip Algoritma Genetika & Pembelajaran AI Evolusioner"
  },
  {
    id: 69,
    moduleId: 23,
    moduleCode: "MODUL-23",
    topic: "Fungsi Mutasi Bobot Sinapsis AI",
    type: "Essay",
    question: "Tuliskan kode fungsi JavaScript `mutateWeights(weights, mutationRate)` yang mengiterasi array bobot sinapsis, di mana setiap bobot memiliki peluang sebesar `mutationRate` (misal 0.1) untuk dimodifikasi dengan penambahan nilai acak antara -0.2 hingga +0.2!",
    correctAnswer: "function mutateWeights(weights, rate) { return weights.map(w => Math.random() < rate ? w + (Math.random() * 0.4 - 0.2) : w); }",
    explanation: "Menggunakan loop atau map untuk memeriksa Math.random() < rate; jika terpenuhi, bobot diubah dengan nilai variasi (Math.random() * 0.4 - 0.2).",
    codingSnippet: `function mutateWeights(weights, rate = 0.1) {\n    return weights.map(w => {\n        if (Math.random() < rate) {\n            // Tambah variasi acak [-0.2, +0.2]\n            return w + (Math.random() * 0.4 - 0.2);\n        }\n        return w;\n    });\n}`,
    smkCompetency: "RPL: Operator Mutasi Genetik & Optimasi Bobot AI"
  },

  // ================= MODUL 24 =================
  {
    id: 70,
    moduleId: 24,
    moduleCode: "MODUL-24",
    topic: "Interpolasi Linear (LERP) pada Game Jaringan",
    type: "PG Biasa",
    question: "Mengapa teknik Linear Interpolation (LERP) wajib digunakan saat merender posisi tank lawan (remote player) yang diterima dari paket data jaringan?",
    options: [
      "A. Untuk menghemat kuota internet server jaringan",
      "B. Untuk menghaluskan pergerakan tank lawan di layar sehingga tidak tampak patah-patah (teleportasi/jitter) akibat latensi jaringan",
      "C. Agar peluru tank lawan tidak dapat mengenai pemain lokal",
      "D. Untuk mengubah warna cat tank lawan secara acak"
    ],
    correctAnswer: "B",
    explanation: "Paket posisi jaringan dikirim dalam interval tertentu (tick rate 20-60Hz) dan rentan latensi (ping). LERP melakukan interpolasi mulus dari posisi sebelumnya ke target posisi baru.",
    smkCompetency: "TJKT/RPL: Sinkronisasi Status Jaringan & Client-side Prediction"
  },
  {
    id: 71,
    moduleId: 24,
    moduleCode: "MODUL-24",
    topic: "Protokol Komunikasi Data Multiplayer Real-Time",
    type: "PG Kompleks",
    question: "Perhatikan karakteristik arsitektur komunikasi jaringan untuk game aksi multiplayer real-time (seperti arena pertempuran tank 2D):\n1. Protokol UDP atau WebRTC DataChannel (Unreliable/Unordered) disukai untuk paket posisi koordinat berkala karena tidak terhambat mekanisme retransmisi TCP (head-of-line blocking).\n2. WebSocket berbasis TCP cocok untuk pengiriman event kritis seperti chat lobi, registrasi skor, atau pembelian item.\n3. Server Authoritative adalah model di mana server memvalidasi tembakan dan posisi untuk mencegah kecurangan (cheat) dari sisi client.\n4. Latensi (ping) jaringan tidak memiliki pengaruh apa pun terhadap sinkronisasi game online.",
    options: [
      "A. 1, 2, dan 3",
      "B. 1, 2, dan 4",
      "C. 2 dan 3 saja",
      "D. Semua benar"
    ],
    correctAnswer: "A",
    explanation: "Pernyataan 1, 2, dan 3 benar sesuai standar arsitektur jaringan game. Pernyataan 4 salah karena latensi jaringan adalah faktor penentu utama yang membutuhkan kompensasi lag.",
    smkCompetency: "TJKT: Protokol Jaringan Komputer, TCP/UDP & Sinkronisasi Game"
  },
  {
    id: 72,
    moduleId: 24,
    moduleCode: "MODUL-24",
    topic: "Fungsi LERP Penyesuaian Posisi Jaringan",
    type: "Essay",
    question: "Tuliskan kode fungsi JavaScript `lerp(current, target, factor)` dan tunjukkan contoh penggunaannya untuk memperbarui posisi X tank lawan (`remoteTank.x`) menuju koordinat yang diterima dari paket jaringan (`packet.x`) dengan faktor kehalusan 0.15 per frame!",
    correctAnswer: "function lerp(start, end, factor) { return start + (end - start) * factor; } remoteTank.x = lerp(remoteTank.x, packet.x, 0.15);",
    explanation: "Formula matematis LERP adalah start + (end - start) * factor. Ini menghasilkan transisi eksponensial yang mulus mendekati posisi tujuan.",
    codingSnippet: `function lerp(start, end, factor) {\n    return start + (end - start) * factor;\n}\n\n// Update posisi setiap frame:\nremoteTank.x = lerp(remoteTank.x, packet.x, 0.15);\nremoteTank.y = lerp(remoteTank.y, packet.y, 0.15);`,
    smkCompetency: "TJKT/RPL: Formula Interpolasi Kinematika Sinkronisasi Jaringan"
  }
];

