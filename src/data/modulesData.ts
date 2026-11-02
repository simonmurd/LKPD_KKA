export interface ModuleItem {
  id: number;
  code: string;
  title: string;
  shortTitle: string;
  groupNumber: number;
  groupLabel: string;
  domainCategory: string;
  focus: string;
  smkSummary: string;
  codingLogic: string[];
  keyTopics: string[];
  projectResult: string;
  assetFile: string;
  accentColor: string;
  badgeBg: string;
  iconName: string;
  taskCount: number;
}

export const MODULES_DATA: ModuleItem[] = [
  {
    id: 1,
    code: "MODUL-01",
    title: "Modul 1: Fondasi Web & Grafis Statis",
    shortTitle: "Fondasi Web & Grafis Statis",
    groupNumber: 1,
    groupLabel: "Kelompok 1: Fondasi & Grafis",
    domainCategory: "HTML5 Canvas & Koordinat Layar",
    focus: "HTML/CSS dasar, sistem koordinat layar piksel, dan pembentukan objek geometri 2D dasar.",
    smkSummary: "Siswa SMK diperkenalkan pada cara komputer merepresentasikan ruang piksel 2D (sumbu X horizontal dan Y vertikal) melalui elemen <canvas> HTML5 dan Drawing Context 2D JavaScript. Intisari ini melatih abstraksi awal dalam menyusun tata letak visual berbasis kode presisi.",
    codingLogic: [
      "Deklarasi elemen kanvas HTML5 dan inisialisasi context 2D: canvas.getContext('2d')",
      "Sistem koordinat layar berorientasi (0,0) di sudut kiri-atas kanvas",
      "Perintah rendering primitif: fillRect(x, y, w, h), beginPath(), arc(), moveTo(), lineTo(), fill()",
      "Pewarnaan kanvas menggunakan properti ctx.fillStyle dan rendering teks dengan ctx.fillText()"
    ],
    keyTopics: [
      "Struktur dasar tag HTML5 semantik & styling CSS kanvas",
      "Pemetaan koordinat X dan Y pada layar resolusi dinamis",
      "Menggambar bentuk persegi (langit, dinding rumah, pintu)",
      "Menggambar bentuk lingkaran (matahari) dan poligon segitiga (atap rumah)"
    ],
    projectResult: "Aplikasi kanvas pemandangan alam digital statis lengkap (langit, matahari, rumput, dinding rumah bertingkat, atap segitiga, dan tanda tangan digital siswa).",
    assetFile: "/assets/aistudio/modul_1_78097320.html",
    accentColor: "from-cyan-500 to-blue-500",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconName: "Palette",
    taskCount: 20
  },
  {
    id: 2,
    code: "MODUL-02",
    title: "Modul 2: Efisiensi Kode & Detail Visual",
    shortTitle: "Efisiensi Kode & Detail Visual",
    groupNumber: 1,
    groupLabel: "Kelompok 1: Fondasi & Grafis",
    domainCategory: "Struktur Perulangan & Fungsi Modular",
    focus: "Pengorganisasian kode modular agar DRY (Don't Repeat Yourself), ketebalan garis, dan perulangan.",
    smkSummary: "Dalam rekayasa perangkat lunak, menghindari penulisan kode berulang adalah kunci. Modul ini melatih siswa SMK membuat fungsi modular berparameter (seperti gambarPohon(x, y)) dan memanfaatkan perulangan for loop untuk menggambar ratusan bintang malam secara efisien.",
    codingLogic: [
      "Pembuatan fungsi modular reusable dengan parameter koordinat dinamis: function gambarPohon(x, y)",
      "Pemanfaatan For Loop untuk pembangkitan 150+ objek bintang acak menggunakan Math.random()",
      "Manipulasi garis tepi (stroke rendering): ctx.lineWidth, ctx.strokeStyle, dan ctx.stroke()",
      "Kombinasi perintah strokeRect dan path styling untuk batas visual objek"
    ],
    keyTopics: [
      "Konsep DRY (Don't Repeat Yourself) dalam pemrograman",
      "Pewarnaan stroke transparan dan efek glow rgba() pada bulan",
      "Perulangan For Loop untuk optimasi rendering objek masif",
      "Fungsi modular berparameter untuk penanaman deretan pohon otomatis"
    ],
    projectResult: "Pemandangan malam modular efisien dengan bulan bercahaya (stroke/lineWidth), 150 bintang terdistribusi acak, dan barisan pohon berulang otomatis.",
    assetFile: "/assets/aistudio/modul_2_0a006db0.html",
    accentColor: "from-cyan-500 to-blue-500",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconName: "Repeat",
    taskCount: 20
  },
  {
    id: 3,
    code: "MODUL-03",
    title: "Modul 3: Animasi & Pergerakan Frame-by-Frame",
    shortTitle: "Animasi Frame-by-Frame 60 FPS",
    groupNumber: 1,
    groupLabel: "Kelompok 1: Fondasi & Grafis",
    domainCategory: "Game Loop & requestAnimationFrame",
    focus: "Mengubah grafis statis menjadi objek bergerak mulus frame-by-frame dengan kecepatan 60 FPS.",
    smkSummary: "Animasi web modern bergantung pada siklus update layar yang sinkron dengan refresh rate monitor. Siswa SMK mempelajari pentingnya membersihkan frame lama dengan clearRect() dan mendaftarkan pembaruan kontinu dengan requestAnimationFrame() agar objek bergerak tanpa jejak coretan.",
    codingLogic: [
      "Pembersihan kanvas tiap frame menggunakan ctx.clearRect(0, 0, width, height) untuk mencegah trail artifact",
      "Pembaruan posisi variabel spasial secara kontinu (posisiX_Bulan -= v, posisiX_Awan += v)",
      "Logika percabangan wrapping/looping layar: if (posisiX < -batas) posisiX = layarLebar",
      "Eksekusi game loop 60 FPS menggunakan method browser requestAnimationFrame(animasi)"
    ],
    keyTopics: [
      "Prinsip persistence of vision dan siklus frame animasi",
      "Pemberian transparansi pada objek awan dengan alpha channel rgba()",
      "Manipulasi variabel kecepatan horizontal (dx/v)",
      "Konsep looping pergerakan kontinu melintasi batas layar kanvas"
    ],
    projectResult: "Aplikasi animasi malam interaktif 60 FPS di mana bulan meluncur perlahan ke barat, awan bergeser transparan, dan kumpulan bintang berkelap-kelip.",
    assetFile: "/assets/aistudio/modul_3_1dc51108.html",
    accentColor: "from-cyan-500 to-blue-500",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconName: "Film",
    taskCount: 20
  },
  {
    id: 4,
    code: "MODUL-04",
    title: "Modul 4: Interaktivitas DOM & State Management",
    shortTitle: "Memory Match Game & State",
    groupNumber: 2,
    groupLabel: "Kelompok 2: DOM & Logika Interaktif",
    domainCategory: "Event Handling & State Management",
    focus: "Menghubungkan event klik pengguna dengan aturan logika status aplikasi dan efek CSS 3D.",
    smkSummary: "Dalam pengembangan web front-end profesional (RPL), interaksi pengguna dikendalikan oleh event dan state. Siswa SMK membangun game memori 12 kartu (6 pasang), memvalidasi pencocokan dua kartu yang dipilih, dan mengunci layar sementara menggunakan setTimeout.",
    codingLogic: [
      "Event Listener DOM klik: card.addEventListener('click', flipCard)",
      "State Management terpusat: hasFlippedCard, firstCard, secondCard, isLocked, moves, matchedPairs",
      "Manipulasi class CSS 3D dinamis: classList.add('flip') dengan transform rotateY(180deg)",
      "Asynchronous delay menggunakan setTimeout() untuk membalik kembali kartu yang tidak cocok"
    ],
    keyTopics: [
      "Tata letak CSS Grid repeat(4, 1fr) dan perspective 3D",
      "Sembunyikan sisi belakang kartu dengan backface-visibility: hidden",
      "Perlindungan bug double-click pada kartu yang sama (this === firstCard)",
      "Pengacakan urutan array kartu menggunakan array.sort(() => 0.5 - Math.random())"
    ],
    projectResult: "Game edukasi Pairs / Memory Match interaktif lengkap dengan penghitung langkah (moves), deteksi kemenangan (win overlay), dan tombol restart.",
    assetFile: "/assets/aistudio/modul_4_529d4d00.html",
    accentColor: "from-indigo-500 to-purple-500",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconName: "Layers",
    taskCount: 20
  },
  {
    id: 5,
    code: "MODUL-05",
    title: "Modul 5: Tilemap Matrix & Fisika Dorong Objek",
    shortTitle: "Diamond Rush & Grid Matrix",
    groupNumber: 2,
    groupLabel: "Kelompok 2: DOM & Logika Interaktif",
    domainCategory: "Array 2D (Tilemap Matrix) & Keyboard Event",
    focus: "Penerapan matriks 2D untuk memetakan dunia ubin, event keyboard, dan interaksi dorong objek.",
    smkSummary: "Dunia game 2D klasik direpresentasikan sebagai matriks dua dimensi angka [baris][kolom]. Siswa SMK mempelajari bagaimana sel ubin 0 (tanah), 1 (dinding), 2 (batu), 3 (berlian), dan 4 (musuh) diperiksa sebelum mengizinkan karakter penjelajah melangkah atau mendorong batu.",
    codingLogic: [
      "Representasi peta menggunakan Array 2D: mapGrid[row][col]",
      "Penanganan event keyboard: window.addEventListener('keydown') dan navigasi arah (dx, dy)",
      "Fisika dorong batu (boulder push logic): memeriksa ubin di balik batu (pushX, pushY) jika bernilai 0",
      "Pembaruan state skor bertambah (+100) dan pengurangan nyawa saat menyentuh jebakan musuh"
    ],
    keyTopics: [
      "Konversi koordinat sel ubin (grid) ke koordinat piksel kanvas (col * tileSize)",
      "Logika percabangan majemuk penanganan tipe ubin tujuan",
      "Pengendalian kontrol ganda: Keyboard PC (WASD/Panah) & Virtual D-Pad Mobile",
      "Pemeriksaan sisa berlian dan pemicuan status STAGE CLEAR"
    ],
    projectResult: "Game retro Diamond Rush Engine di mana pemain menjelajahi labirin gua, mendorong batu besar, mengumpulkan seluruh berlian, dan menghindari jebakan musuh.",
    assetFile: "/assets/aistudio/modul_5_cf38dfd6.html",
    accentColor: "from-indigo-500 to-purple-500",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconName: "Grid",
    taskCount: 20
  },
  {
    id: 6,
    code: "MODUL-06",
    title: "Modul 6: Pemrograman Berbasis Waktu & Antrean",
    shortTitle: "Cake Mania / Time Management",
    groupNumber: 2,
    groupLabel: "Kelompok 2: DOM & Logika Interaktif",
    domainCategory: "Temporal Logic, setInterval & State Machine",
    focus: "Pemrograman berbasis waktu (timer), interval berkala, dan state machine antrean restoran.",
    smkSummary: "Sistem kasir dan antrean layanan memerlukan logika waktu real-time. Siswa SMK membangun simulasi restoran Cake Mania / Diner Dash, mengelola tingkat kesabaran pelanggan dengan setInterval, durasi memasak dengan setTimeout, serta penambahan omzet uang.",
    codingLogic: [
      "Interval pengurangan kesabaran pelanggan berkala: setInterval(() => { customer.patience -= 5 }, 1000)",
      "Pembersihan interval otomatis menggunakan clearInterval(timerInterval) saat status berubah",
      "Simulasi penundaan proses memasak dapur dengan setTimeout(..., 3000)",
      "Finite State Machine pelanggan: WAITING_ORDER -> COOKING -> READY_TO_SERVE -> EATING -> ANGRY"
    ],
    keyTopics: [
      "Struktur data array objek pelanggan dinamis activeCustomers[]",
      "Manajemen indikator progress bar kesabaran menggunakan persentase width CSS",
      "Event-driven click handling pada meja restoran untuk pemesanan dan penyajian",
      "Kondisi Game Over saat jumlah pelanggan marah mencapai batas toleransi maksimum (3)"
    ],
    projectResult: "Simulasi game bisnis Time-Management Cake Mania di mana pemain mengelola 4 meja, mencatat pesanan kue, memasak di dapur, dan mengumpulkan pendapatan uang kasir.",
    assetFile: "/assets/aistudio/modul_6_eb290b82.html",
    accentColor: "from-indigo-500 to-purple-500",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconName: "Clock",
    taskCount: 20
  },
  {
    id: 7,
    code: "MODUL-07",
    title: "Modul 7: Algoritma Array Bergerak & Tabrakan",
    shortTitle: "Snake Game State Machine",
    groupNumber: 3,
    groupLabel: "Kelompok 3: Struktur Data & Fisika",
    domainCategory: "Array Queue (unshift/pop) & Self-Collision",
    focus: "Manipulasi array dinamis badan ular, pencegahan gerak balik arah 180 derajat, dan collision detection.",
    smkSummary: "Game Snake adalah studi kasus klasik ilmu komputer untuk struktur data antrean (queue). Siswa SMK belajar cara menambahkan kepala baru dengan unshift() dan membuang ekor dengan pop() saat ular bergerak, serta mendeteksi tabrakan dengan badan sendiri.",
    codingLogic: [
      "Array representasi koordinat segmen ular: snake: [{x: 10, y: 10}, ...]",
      "Algoritma pergerakan: snake.unshift(newHead) untuk maju, dan snake.pop() jika tidak makan makanan",
      "Pencegahan bug putar balik 180°: if (direction === 'UP' && dy !== 1)",
      "Deteksi tabrakan dinding kanvas dan deteksi tabrakan diri sendiri (self-collision loop)"
    ],
    keyTopics: [
      "Sistem koordinat grid virtual (gridSize, gridCols, gridRows)",
      "Pembangkitan makanan acak: Math.floor(Math.random() * gridCols)",
      "Pengaturan kecepatan game loop interval: 100ms per tick",
      "Penyediaan antarmuka D-Pad Virtual responsif untuk perangkat mobile"
    ],
    projectResult: "Game arkade Snake Simulator lengkap dengan pembaruan skor instan, status PLAYING/GAME_OVER, dan responsivitas kontrol keyboard & mobile.",
    assetFile: "/assets/aistudio/modul_7_6a58e69d.html",
    accentColor: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconName: "Activity",
    taskCount: 20
  },
  {
    id: 8,
    code: "MODUL-08",
    title: "Modul 8: Fisika Pantulan Vektor & Touch Events",
    shortTitle: "Bounce Game & Mobile Touch",
    groupNumber: 3,
    groupLabel: "Kelompok 3: Struktur Data & Fisika",
    domainCategory: "Vektor Pantulan 2D & Touch Event Handler",
    focus: "Menerapkan fisika pantulan bola 2D pada dinding dan paddle, serta mendukung kontrol sentuh Android.",
    smkSummary: "Di era mobile-first, web app harus mampu merespons interaksi layar sentuh smartphone. Siswa SMK mengimplementasikan pembalikan vektor kecepatan bola (dx = -dx, dy = -dy) dan menangani event sentuh e.touches[0].clientX dengan konversi rasio skala kanvas.",
    codingLogic: [
      "Vektor posisi dan kecepatan bola: x += dx, y += dy",
      "Pembalikan arah pantulan dinding: if (ball.x + dx > width - radius || ball.x + dx < radius) dx = -dx",
      "Bounding box collision paddle: if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) dy = -dy",
      "Penanganan touch event Android: touchmove dengan e.preventDefault() dan penskalaan koordinat layar"
    ],
    keyTopics: [
      "Manajemen sistem nyawa (lives) dan skor keberhasilan memantulkan bola",
      "Perhitungan koordinat relatif mouse dan jari terhadap kanvas kanvas.getBoundingClientRect()",
      "API Layar Penuh: element.requestFullscreen() dan penanganan browser vendor",
      "Pencegahan efek zoom sentuhan ganda pada mobile dengan CSS touch-action: none"
    ],
    projectResult: "Game Bounce Ball berkecepatan tinggi dengan dukungan kontrol mouse PC, layar sentuh ponsel Android, dan mode layar penuh satu tombol.",
    assetFile: "/assets/aistudio/modul_8_8d480f98.html",
    accentColor: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconName: "PlayCircle",
    taskCount: 20
  },
  {
    id: 9,
    code: "MODUL-09",
    title: "Modul 9: Matriks 2D & Transformasi Rotasi 90°",
    shortTitle: "Modular Tetris Matrix Engine",
    groupNumber: 4,
    groupLabel: "Kelompok 4: Matriks & Multi-Objek",
    domainCategory: "Aljabar Matriks 2D & Line Clearing",
    focus: "Pemodelan matriks bidimensional Tetrimino dan implementasi algoritma rotasi 90 derajat searah jarum jam.",
    smkSummary: "Manipulasi data matriks adalah pilar penting dalam komputasi dan grafika komputer. Siswa SMK menguasai algoritma matematis rotasi matriks 2D result[r][c] = matrix[N - 1 - c][r] serta mendeteksi dan menghapus baris penuh (line clearing) pada papan 20 baris x 10 kolom.",
    codingLogic: [
      "Inisialisasi matriks papan 20x10: Array.from({ length: 20 }, () => Array(10).fill(0))",
      "Matriks bentuk 7 Tetrimino standar: I, J, L, O, S, T, Z",
      "Algoritma transformasi rotasi 90° clockwise: result[r][c] = matrix[N - 1 - c][r]",
      "Penghapusan baris penuh menggunakan array.every(cell => cell !== 0) dan unshift baris baru"
    ],
    keyTopics: [
      "Deteksi benturan batas tepi papan (kiri, kanan, lantai) dan blok terkunci",
      "Mekanisme Hard Drop untuk menjatuhkan balok ke dasar seketika",
      "Sistem level bertingkat berdasarkan kelipatan akumulasi baris yang dihancurkan",
      "Pewarnaan Tetrimino berbasis ID numerik palet warna neon retro"
    ],
    projectResult: "Engine game Tetris modular fungsional lengkap dengan rotasi balok, deteksi tumpukan papan 2D, penghapusan baris ganda, dan kontrol D-Pad sentuh.",
    assetFile: "/assets/aistudio/modul_9_e99882a2.html",
    accentColor: "from-violet-500 to-indigo-500",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    iconName: "Box",
    taskCount: 20
  },
  {
    id: 10,
    code: "MODUL-10",
    title: "Modul 10: Multi-Object Engine & Side-Scroller",
    shortTitle: "Retro Space Impact Engine",
    groupNumber: 4,
    groupLabel: "Kelompok 4: Matriks & Multi-Objek",
    domainCategory: "Multi-Entity Array & AABB Collision",
    focus: "Pengelolaan puluhan entitas objek dinamis (peluru dan musuh) dan pembersihan memori.",
    smkSummary: "Sistem game side-scrolling menguji arsitektur pengelolaan banyak objek secara simultan. Siswa SMK mengelola array bullets[] dan enemies[], memeriksa tabrakan kotak AABB antar entitas, serta mempraktikkan garbage collection (menghapus objek luar layar agar tidak bocor memori).",
    codingLogic: [
      "Manajemen multi-objek dinamis: array peluru bullets[] dan array musuh enemies[]",
      "Input keyboard multi-key halus (keys[e.key] = true/false) untuk pergerakan diagonal tanpa jeda",
      "Pembersihan memori siklus balik: loop for mundur (i = arr.length - 1; i >= 0; i--) dengan splice(i, 1)",
      "Deteksi tabrakan Axis-Aligned Bounding Box (AABB) antara peluru dan pesawat musuh"
    ],
    keyTopics: [
      "Spawning berkala pesawat alien musuh menggunakan interval modulo pembagi frame",
      "Rendering proyektil laser berkecepatan tinggi dengan efek cahaya kanvas",
      "Latar belakang bintang bergerak (starfield parallax) berbasis koordinat modulo",
      "Sistem penambahan skor +50 per eliminasi musuh dan pemulihan nyawa tiga hati"
    ],
    projectResult: "Game aksi pesawat luar angkasa Retro Space Impact side-scrolling dengan tembakan laser beruntun, puluhan musuh bergerak, dan tombol tembak cepat.",
    assetFile: "/assets/aistudio/modul_10_043c4a44.html",
    accentColor: "from-violet-500 to-indigo-500",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    iconName: "Rocket",
    taskCount: 20
  },
  {
    id: 11,
    code: "MODUL-11",
    title: "Modul 11: Fisika Pantulan Sudut & Matriks Balok 2D",
    shortTitle: "Retro Brick Breaker Engine",
    groupNumber: 4,
    groupLabel: "Kelompok 4: Matriks & Multi-Objek",
    domainCategory: "Grid Balok 2D & Vektor Pantulan Sudut",
    focus: "Matriks balok dua dimensi, penanganan status aktif balok, dan pantulan sudut paddle interaktif.",
    smkSummary: "Game arkade Brick Breaker menyatukan logika matriks 2D dan fisika pantulan dinamis. Siswa SMK menginisialisasi matriks balok bricks[col][row], mendeteksi titik tabrakan bola dengan balok, menonaktifkan status balok yang terkena, dan memantulkan bola kembali.",
    codingLogic: [
      "Inisialisasi grid balok dua dimensi: bricks[c][r] = { x, y, status: 1 }",
      "Deteksi tabrakan lingkaran bola ke kotak balok (Circle vs AABB)",
      "Pembalikan vektor kecepatan vertikal bola (dy = -dy) dan penonaktifan status balok (status = 0)",
      "Pengecekan kondisi menang saat jumlah balok aktif tersisa bernilai 0"
    ],
    keyTopics: [
      "Perhitungan offset posisi balok kanvas berdasar padding, width, dan height",
      "Kontrol paddle ganda: tombol Keyboard (A/D/Panah), Mouse tracking, dan Tombol Layar Sentuh",
      "Penanganan kondisi bola jatuh ke jurang (pengurangan nyawa dan reset posisi)",
      "Gradasi warna baris balok berdasarkan indeks modulo baris matriks"
    ],
    projectResult: "Game klasik pemecah balok (Brick Breaker) lengkap dengan puluhan balok warna-warni, paddle responsif, penghitung skor, dan status kemenangan.",
    assetFile: "/assets/aistudio/modul_11_1a245907.html",
    accentColor: "from-violet-500 to-indigo-500",
    badgeBg: "bg-violet-50 text-violet-700 border-violet-200",
    iconName: "Trophy",
    taskCount: 20
  },
  {
    id: 12,
    code: "MODUL-12",
    title: "Modul 12: Navigasi Grid & AI Hantu Finite State",
    shortTitle: "Retro Pac-Man AI Capstone",
    groupNumber: 5,
    groupLabel: "Kelompok 5: AI Dasar & Capstone Game",
    domainCategory: "AI Patroli, Finite State Machine & Input Buffer",
    focus: "Mekanika navigasi grid dengan input buffering, Finite State Machine hantu (CHASE/FRIGHTENED).",
    smkSummary: "Pac-Man adalah proyek capstone terbaik untuk menyatukan konsep AI dasar dan navigasi grid. Siswa SMK mengimplementasikan input buffering (menyimpan arah sebelum persimpangan), sistem patroli hantu otomatis, dan mode Frightened saat Pac-Man memakan Power Pellet.",
    codingLogic: [
      "Sistem input buffering: menyimpan pacman.nextDx dan nextDy hingga karakter tiba di persimpangan ubin",
      "Pemeriksaan ubin dinding labirin: function isWall(gx, gy) return grid[gy][gx] === 1",
      "Finite State Machine kecerdasan buatan hantu: mode 'CHASE' vs mode 'FRIGHTENED'",
      "Pengaturan durasi kepanikan hantu dengan timer setTimeout 7000ms dan reset posisi hantu"
    ],
    keyTopics: [
      "Penyimpanan labirin dalam matriks angka: 1 (dinding), 0 (dot), 2 (kosong), 3 (power pellet)",
      "Algoritma pemilihan arah acak hantu saat berada di persimpangan tanpa menembus dinding",
      "Perhitungan jarak tabrakan Euclidean: Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y)",
      "Pembedaan kondisi tabrakan: Pac-Man memakan hantu (+200 poin) vs Pac-Man kehilangan nyawa"
    ],
    projectResult: "Proyek Capstone Game Pac-Man retro utuh dengan labirin berdinding biru, dot makanan, power pellet, dua hantu AI berpatroli, dan sistem nyawa 3 hati.",
    assetFile: "/assets/aistudio/modul_12_cfbf9efe.html",
    accentColor: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconName: "Zap",
    taskCount: 20
  },
  {
    id: 13,
    code: "MODUL-13",
    title: "Modul 13: Scrolling Ilusi Kecepatan & Nitro Boost",
    shortTitle: "Nitro Street Racing Engine",
    groupNumber: 5,
    groupLabel: "Kelompok 5: AI Dasar & Capstone Game",
    domainCategory: "Top-Down Scrolling & Resource Dynamics",
    focus: "Menciptakan ilusi kecepatan tinggi, manajemen akselerasi Nitro Boost, dan konsumsi bahan bakar.",
    smkSummary: "Dalam pengembangan game balapan, pergerakan relatif menciptakan sensasi berkendara kencang. Siswa SMK mengatur scrolling offset garis marka jalan, akselerasi Nitro Boost dengan konsumsi bahan bakar terukur, serta mekanisme regenerasi otomatis energi.",
    codingLogic: [
      "Ilusi gerakan cepat (scrolling background): roadOffset = (roadOffset + gameState.speed) % 40",
      "Resource management: pengurangan bahan bakar nitro saat aktif (nitroFuel -= 1.5) dan regenerasi pasif",
      "Penggandaan kecepatan maksimal saat Spasi/Shift ditekan (speed = maxSpeed)",
      "Deteksi tabrakan AABB antara mobil pemain dan mobil rintangan di tiga jalur lintasan"
    ],
    keyTopics: [
      "Rendering marka jalan putus-putus dan kerb pembatas merah-putih secara dinamis",
      "Efek visual semburan api Nitro pada knalpot menggunakan segitiga poligon kanvas",
      "Spawning mobil lawan secara acak pada 3 jalur (lane 60, 160, 260)",
      "Perhitungan akumulasi jarak tempuh (skor meter) berbanding lurus dengan kecepatan mobil"
    ],
    projectResult: "Game balap jalanan top-down Nitro Street Racing dengan akselerasi turbo api, indikator bar nitro, rintangan mobil lawan di 3 jalur, dan tabrakan spektakuler.",
    assetFile: "/assets/aistudio/modul_13_1b398024.html",
    accentColor: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconName: "Gauge",
    taskCount: 20
  },
  {
    id: 14,
    code: "MODUL-14",
    title: "Modul 14: Trigonometri Peluncuran & Rekursi Flood Fill",
    shortTitle: "Bubble Bash / Puzzle Bobble",
    groupNumber: 5,
    groupLabel: "Kelompok 5: AI Dasar & Capstone Game",
    domainCategory: "Trigonometri Sudut & Algoritma Graf Flood Fill",
    focus: "Trigonometri peluncuran tembakan, penguncian ubin heksagonal (Grid Snap), dan pencarian kelompok Match-3+.",
    smkSummary: "Game puzzle tembak gelembung menggabungkan matematika sudut dan algoritma graf rekursif. Siswa SMK menghitung sudut bidik dengan Math.atan2, mengonversi koordinat peluru ke baris/kolom matriks (Grid Snap), dan menjalankan algoritma pencarian kelompok warna sama (Flood Fill).",
    codingLogic: [
      "Trigonometri sudut penembak: shooter.angle = Math.atan2(mouseY - y, mouseX - x)",
      "Penentuan komponen vektor tembak: dx = speed * Math.cos(angle), dy = speed * Math.sin(angle)",
      "Algoritma Grid Snap: konversi posisi piksel benturan ke indeks baris dan kolom matriks",
      "Algoritma rekursif / Flood Fill (BFS) untuk menemukan gelembung dengan warna sama >= 3 dan meletuskannya"
    ],
    keyTopics: [
      "Pemeriksaan tetangga 6 arah pada pola grid heksagonal berselang-seling (isOdd row check)",
      "Deteksi gelembung menggantung tanpa jangkar ke atap (floating bubble gravity check)",
      "Pantulan horizontal peluru gelembung pada batas dinding kanvas kiri dan kanan",
      "Penyediaan antrean warna gelembung berikutnya untuk strategi pemain"
    ],
    projectResult: "Game teka-teki Bubble Bash interaktif lengkap dengan meriam berputar bebas, pantulan dinding, letusan rantai 3+ warna sama, dan peruntuhan gelembung menggantung.",
    assetFile: "/assets/aistudio/modul_14_aada217d.html",
    accentColor: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconName: "Sparkles",
    taskCount: 20
  },
  {
    id: 15,
    code: "MODUL-15",
    title: "Modul 15: Fisika Gravitasi & Platformer Run-and-Gun",
    shortTitle: "Contra Action Side-Scroller",
    groupNumber: 6,
    groupLabel: "Kelompok 6: Advanced Mechanics & Mastery",
    domainCategory: "Fisika Gravitasi Parabola & Platform Jumping",
    focus: "Fisika gravitasi, lompatan platforming bertingkat, dan penanganan aksi tembak multi-arah.",
    smkSummary: "Game run-and-gun seperti Contra menuntut sinkronisasi fisika lompatan dan aksi tembak simultan. Siswa SMK memprogram gravitasi realistis (dy += gravity), deteksi pendaratan pada platform melayang (isGrounded), dan penembakan peluru multi-arah (horizontal dan ke atas).",
    codingLogic: [
      "Akselerasi gravitasi parabola: player.dy += player.gravity dan impuls lompat: player.dy = jumpForce",
      "Deteksi pijakan platform: if (player.dy > 0 && player.y + height >= plat.y) player.isGrounded = true",
      "Penanganan kontrol multi-key: pemain dapat berlari, melompat, dan menembak secara bersamaan",
      "Arah hadap dan tembakan vertikal: menembak ke atas saat tombol ArrowUp ditekan"
    ],
    keyTopics: [
      "Pengelolaan array peluru pemain playerBullets[] dan array musuh patroli enemies[]",
      "Tabrakan AABB dua arah: peluru menghancurkan musuh, dan musuh melukai pemain",
      "Pembersihan peluru yang keluar dari batas layar kanvas",
      "Desain rintangan platform melayang dengan highlight visual modern"
    ],
    projectResult: "Game aksi platformer Contra side-scroller dengan mekanika tembak multi-arah, gravitasi presisi, platform bertingkat, dan musuh patroli bersenjata.",
    assetFile: "/assets/aistudio/modul_15_98c8745f.html",
    accentColor: "from-rose-500 to-pink-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "Crosshair",
    taskCount: 20
  },
  {
    id: 16,
    code: "MODUL-16",
    title: "Modul 16: Lintasan Melengkung Waypoint & Chain Reaction",
    shortTitle: "Zuma Path Traversal & Chain",
    groupNumber: 6,
    groupLabel: "Kelompok 6: Advanced Mechanics & Mastery",
    domainCategory: "Waypoint Interpolation & Rantai Array Match-3",
    focus: "Navigasi lintasan melengkung (waypoint interpolation), pelacakan kursor, dan reaksi berantai.",
    smkSummary: "Zuma menguji pemodelan kurva dan manipulasi array tingkat mahir. Siswa SMK menghitung posisi bola di sepanjang kurva waypoint menggunakan interpolasi jarak parametrik, memutar kodok penembak mengikuti mouse, dan menyisipkan bola ke rantai yang sedang melaju.",
    codingLogic: [
      "Interpolasi lintasan waypoint: fungsi getPointAtDistance(distance) untuk menghitung posisi (x,y) pada kurva",
      "Rotasi penembak terpusat melacak posisi kursor mouse: frog.angle = Math.atan2(my - fy, mx - fx)",
      "Penyisipan bola baru ke dalam array rantai ballChain.splice(j, 0, newBall) dan pergeseran jarak",
      "Pemeriksaan reaksi berantai (Chain Reaction): menghancurkan 3 atau lebih bola berurutan dengan warna sama"
    ],
    keyTopics: [
      "Perhitungan jarak kumulatif antar segmen waypoint kurva spiral",
      "Vektor penembakan bola bebas: dx = cos(angle) * speed, dy = sin(angle) * speed",
      "Deteksi kondisi Game Over saat kepala rantai bola menyentuh lubang akhir tengkorak",
      "Indikator warna bola berikutnya di samping kodok untuk perencanaan taktik pemain"
    ],
    projectResult: "Game puzzle Zuma fungsional dengan kodok penembak 360 derajat, rantai bola melintasi jalur melengkung berliku, dan ledakan berantai Match-3 spektakuler.",
    assetFile: "/assets/aistudio/modul_16_62e4b7ab.html",
    accentColor: "from-rose-500 to-pink-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "Compass",
    taskCount: 20
  },
  {
    id: 17,
    code: "MODUL-17",
    title: "Modul 17: Viewport Scrolling & Directional Collision",
    shortTitle: "Super Mario Bros Platformer",
    groupNumber: 6,
    groupLabel: "Kelompok 6: Advanced Mechanics & Mastery",
    domainCategory: "Kamera Viewport Scrolling & Directional Physics",
    focus: "Kamera scrolling dunia horizontal (viewport offset) dan deteksi tabrakan bersyarat arah.",
    smkSummary: "Super Mario Bros adalah ikon rekayasa platformer 2D. Siswa SMK menerapkan transformasi kanvas viewport (ctx.translate(-worldOffset, 0)) untuk menciptakan dunia horizontal luas, serta membedakan tabrakan vertikal (menginjak musuh dari atas) dari tabrakan samping (cedera).",
    codingLogic: [
      "Kamera viewport horizontal: ctx.translate(-gameState.worldOffset, 0) saat Mario melewati batas tengah layar",
      "Directional Collision Detection: memeriksa mario.dy > 0 dan koordinat kaki untuk membedakan injakan vs tabrakan samping",
      "Fisika pantulan pahlawan saat sukses menginjak musuh: mario.dy = -7",
      "Sistem pemulihan (respawn) dan deteksi pemicu kemenangan di tiang bendera finish (goal)"
    ],
    keyTopics: [
      "Peta level platform panjang (1200+ piksel) dengan pipa, balok tanah, dan platform melayang",
      "Pemberian skor dan koin emas kolektibel berputar",
      "Patroli musuh Goomba bolak-balik dalam batas koordinat minX dan maxX",
      "Kontrol ramah layar sentuh HP dengan tombol Lompat dan Kemudi kiri/kanan"
    ],
    projectResult: "Platformer Super Mario Bros lengkap dengan dunia scrolling dinamis, musuh Goomba yang bisa diinjak, koin berkilau, dan tiang bendera penyelesaian level.",
    assetFile: "/assets/aistudio/modul_17_06e92351.html",
    accentColor: "from-rose-500 to-pink-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "ShieldAlert",
    taskCount: 20
  },
  {
    id: 18,
    code: "MODUL-18",
    title: "Modul 18: State Machine Akrobatik & Sesi Countdown Timer",
    shortTitle: "Prince of Persia J2ME Mastery",
    groupNumber: 6,
    groupLabel: "Kelompok 6: Advanced Mechanics & Mastery",
    domainCategory: "Acrobatic State Machine & Sesi Waktu Global",
    focus: "State machine akrobatik (Ledge Grabbing), countdown timer global, dan deteksi jebakan duri.",
    smkSummary: "Sebagai modul pamungkas platformer klasik, siswa SMK membangun simulasi Prince of Persia klasik versi J2ME. Modul ini menguji penguasaan Finite State Machine akrobatik (IDLE, RUNNING, JUMPING, LEDGE_GRAB, HURT, FALLING), timer hitung mundur sesi 60 detik, dan tebing panjat.",
    codingLogic: [
      "Acrobatic State Machine kompleks: transisi status IDLE, RUNNING, JUMPING, LEDGE_GRAB, FALLING, HURT",
      "Precision Ledge Detection: mendeteksi posisi pangeran di tepi tebing untuk mengunci posisi dan mengizinkan panjat naik",
      "Global Countdown Session Timer: interval 1000ms untuk menghitung mundur durasi sesi (timeLeft--) dan trigger TIME_UP",
      "Deteksi tabrakan presisi jebakan duri (spike hazards) yang mengurangi nyawa dan memicu respawn"
    ],
    keyTopics: [
      "Pencegahan efek gravitasi saat pangeran sedang bergelantungan (state === 'LEDGE_GRAB')",
      "Aksi panjat tebing: menaikkan koordinat vertikal dan mengembalikan status ke IDLE",
      "Pintu gerbang emas sebagai target penyelesaian misi (WIN state)",
      "Format waktu digital mm:ss menggunakan padStart(2, '0')"
    ],
    projectResult: "Game petualangan dungeon Prince of Persia J2ME dengan tebing gantung, panjat dinding, jebakan duri tajam, dan countdown timer menegangkan.",
    assetFile: "/assets/aistudio/modul_18_7cf7f1c1.html",
    accentColor: "from-rose-500 to-pink-500",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "Award",
    taskCount: 20
  },
  {
    id: 19,
    code: "MODUL-19",
    title: "Modul 19: Algoritma Pencarian Rute Cerdas A* (A-Star AI)",
    shortTitle: "A* Pathfinding AI Navigator",
    groupNumber: 7,
    groupLabel: "Kelompok 7: Kecerdasan Artifisial & Graf",
    domainCategory: "Algoritma Pencarian Jalur Cerdas & Heuristik A*",
    focus: "Algoritma A* (A-Star) dengan heuristik Manhattan Distance, Open/Closed Set, dan navigasi rute otonom bot.",
    smkSummary: "Dalam pengembangan software logistik cerdas (TJKT) maupun AI navigasi NPC game (RPL), pencarian rute terpendek tercepat adalah kompetensi inti. Siswa SMK mengimplementasikan algoritma A* dengan rumus evaluasi f(n) = g(n) + h(n) untuk menggerakkan agen bot menghindari rintangan labirin menuju target pemain.",
    codingLogic: [
      "Kalkulasi jarak heuristik Manhattan: Math.abs(x1 - x2) + Math.abs(y1 - y2)",
      "Evaluasi biaya fCost = gCost + hCost pada koleksi Open Set dan Closed Set",
      "Rekonstruksi jalur optimal (path backtracking) dari node tujuan kembali ke node awal",
      "Animasi langkah agen AI otonom bergerak menyusuri titik koordinat jalur terpendek"
    ],
    keyTopics: [
      "Struktur node grafis grid: koordinat, gCost, hCost, fCost, dan referensi parent",
      "Pencegahan jalan buntu dan manuver bot menghindari sel dinding rintangan",
      "Rendering visual rute jalur hijau neon di atas kanvas 2D secara real-time",
      "Interaktivitas pemindahan titik target secara dinamis dengan klik mouse"
    ],
    projectResult: "Simulasi AI Labirin Cerdas di mana bot otonom secara instan menghitung, menampilkan, dan melangkah pada rute terpendek menuju target saat rintangan dinding digeser.",
    assetFile: "/assets/aistudio/modul_19.html",
    accentColor: "from-indigo-600 to-blue-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconName: "Bot",
    taskCount: 20
  },
  {
    id: 20,
    code: "MODUL-20",
    title: "Modul 20: Sistem Partikel Dinamis & Kinematika Vektor",
    shortTitle: "Particle FX Engine Sandbox",
    groupNumber: 7,
    groupLabel: "Kelompok 7: Kecerdasan Artifisial & Graf",
    domainCategory: "Simulasi Fisika Partikel & Efek Visual Kanvas",
    focus: "Emitor partikel dinamis, akselerasi gravitasi, gaya gesek, pembusukan usia (life decay), dan pendaran alpha.",
    smkSummary: "Efek visual game AAA dan antarmuka web interaktif mengandalkan Particle Engine. Siswa SMK memprogram ratusan partikel dinamis dengan vektor kecepatan acak, gaya gesekan (friction), pembusukan usia (lifespan), dan warna gradasi pendaran cahaya (glow effect).",
    codingLogic: [
      "Struktur data partikel: { x, y, vx, vy, life, maxLife, color, size }",
      "Pembaruan fisika vektor: x += vx, y += vy, vy += gravity, vx *= friction",
      "Pudar transparansi berdasar sisa usia: ctx.globalAlpha = Math.max(0, life / maxLife)",
      "Pembersihan otomatis partikel mati (garbage collection) dari array partikel aktif"
    ],
    keyTopics: [
      "Emitor partikel titik kursor mouse dan semburan otomatis",
      "Preset efek partikel: Ledakan Kembang Api, Semburan Api Obor, dan Spark Listrik",
      "Operasi blending kanvas ctx.globalCompositeOperation = 'lighter'",
      "Pengaturan variasi kecepatan dan sudut semburan menggunakan Math.cos dan Math.sin"
    ],
    projectResult: "Engine Sistem Partikel interaktif dengan 3 preset efek spektakuler: Ledakan Kembang Api, Api Menyala, dan Percikan Listrik Cyberpunk yang meledak mengikuti klik mouse.",
    assetFile: "/assets/aistudio/modul_20.html",
    accentColor: "from-amber-500 to-rose-500",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    iconName: "Sparkles",
    taskCount: 20
  },
  {
    id: 21,
    code: "MODUL-21",
    title: "Modul 21: Fisika Tali, Hookshot & Pendulum Kinematics",
    shortTitle: "Bionic Grapple Hook Platformer",
    groupNumber: 7,
    groupLabel: "Kelompok 7: Kecerdasan Artifisial & Graf",
    domainCategory: "Kinematika Pendulum & Fisika Tali Pegas",
    focus: "Pemodelan fisika pendulum melingkar, tegangan tali pegas, dan ayunan karakter platformer (Grapple Hook).",
    smkSummary: "Mekanika berayun menggunakan tali kait (grappling hook) melatih trigonometri sudut rotasi dan gaya sentripetal. Siswa SMK mengaitkan hook ke jangkar langit-langit, menghitung percepatan sudut pendulum, dan melepas ayunan untuk momentum lompatan tinggi menyeberangi jurang.",
    codingLogic: [
      "Percepatan sudut pendulum: angularAccel = (-gravity / length) * Math.sin(angle)",
      "Integrasi kecepatan sudut: angleVelocity += angularAccel, angle += angleVelocity",
      "Konversi koordinat polar ke kartesius: x = anchorX + length * sin(angle), y = anchorY + length * cos(angle)",
      "Pelepasan tali menjadi gerak bebas parabola dengan vektor kecepatan tangensial"
    ],
    keyTopics: [
      "Deteksi penancapan jangkar grapple hook pada langit-langit terdekat",
      "Gaya redaman gesekan udara (damping: angleVelocity *= 0.995)",
      "Visualisasi rendering garis tali pegas elastis antara pahlawan dan titik jangkar",
      "Pengumpulan koin kristal di udara saat berayun di atas duri jurang"
    ],
    projectResult: "Game aksi platformer Bionic Grapple Hook di mana pemain menembakkan tali pengait ke langit-langit, berayun menyeberangi jurang duri, dan mendarat mulus di platform finish.",
    assetFile: "/assets/aistudio/modul_21.html",
    accentColor: "from-teal-600 to-emerald-600",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    iconName: "Anchor",
    taskCount: 20
  },
  {
    id: 22,
    code: "MODUL-22",
    title: "Modul 22: Visual Machine Learning: K-Nearest Neighbors (KNN)",
    shortTitle: "KNN Visual Classifier AI",
    groupNumber: 8,
    groupLabel: "Kelompok 8: AI Machine Learning & Network",
    domainCategory: "Machine Learning Klasifikasi & Kecerdasan Artifisial",
    focus: "Prinsip supervised learning, kalkulasi jarak Euclidean 2D, voting mayoritas K-tetangga, dan klasifikasi visual.",
    smkSummary: "Siswa SMK TJKT/RPL diperkenalkan pada inti Kecerdasan Artifisial (AI) dan Machine Learning melalui visualisasi interaktif. Siswa menghitung jarak Euclidean antar titik data 2D dan memprediksi kelas data baru berdasarkan voting K-tetangga terdekat di kanvas.",
    codingLogic: [
      "Kalkulasi jarak Euclidean 2D: dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)",
      "Pengurutan array jarak tetangga secara ascending: distances.sort((a, b) => a.dist - b.dist)",
      "Pengambilan k data terdekat: const kNearest = distances.slice(0, k)",
      "Voting mayoritas label kelas terbanyak untuk menentukan klasifikasi sampel baru"
    ],
    keyTopics: [
      "Konsep dataset latih (training dataset) dan label kelas biner (Merah vs Biru)",
      "Pengaruh pemilihan nilai hiperparameter K ganjil (K = 3, 5, 7) untuk mencegah seri",
      "Rendering visual garis konektor ke k-tetangga terdekat di kanvas",
      "Peta batas keputusan (decision boundary) di kanvas menggunakan grid sampling"
    ],
    projectResult: "Aplikasi Visual KNN Classifier di mana siswa dapat menambahkan titik data latih di kanvas, mengatur nilai K slider, dan melihat AI memprediksi serta mengklasifikasi titik data baru seketika.",
    assetFile: "/assets/aistudio/modul_22.html",
    accentColor: "from-blue-600 to-indigo-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    iconName: "Brain",
    taskCount: 20
  },
  {
    id: 23,
    code: "MODUL-23",
    title: "Modul 23: Algoritma Genetika & AI Agen Mandiri",
    shortTitle: "Neuro-Evolution AI Flappy Bird",
    groupNumber: 8,
    groupLabel: "Kelompok 8: AI Machine Learning & Network",
    domainCategory: "Algoritma Evolusioner & Optimasi AI Mandiri",
    focus: "Siklus hidup AI evolusioner: populasi agen otonom, evaluasi fitness skor, seleksi elit, dan mutasi bobot acak.",
    smkSummary: "Dalam rekayasa AI modern, agen cerdas dapat belajar mandiri tanpa program eksplisit melalui simulasi seleksi alam. Siswa SMK menyimulasikan 50 agen burung yang belajar melompati rintangan pipa. Generasi yang berhasil bertahan hidup mewariskan gen bobot keputusan terbaik ke generasi berikutnya.",
    codingLogic: [
      "Inisialisasi populasi agen otonom: 50 agen dengan bobot keputusan syaraf acak",
      "Fungsi evaluasi fitness: bertambah setiap frame bertahan hidup dan melewati celah pipa",
      "Seleksi elit (Elitism): memilih agen dengan skor fitness tertinggi sebagai induk",
      "Mutasi stokastik acak pada bobot keputusan lompat untuk eksplorasi adaptif"
    ],
    keyTopics: [
      "Siklus evolusi AI: Populasi -> Evaluasi Fitness -> Seleksi -> Reproduksi -> Mutasi",
      "Input sensor jarak agen: jarak horizontal ke pipa dan jarak vertikal ke celah pipa",
      "Pelacakan nomor generasi (Gen 1, Gen 2, ...) dan skor tertinggi sepanjang masa",
      "Mekanisme auto-restart generasi saat seluruh 50 agen menabrak pipa"
    ],
    projectResult: "Simulasi AI Neuro-Evolution di mana 50 agen burung belajar terbang melompati pipa secara otomatis, berevolusi dari generasi ke generasi hingga menjadi agen tak terkalahkan.",
    assetFile: "/assets/aistudio/modul_23.html",
    accentColor: "from-purple-600 to-pink-600",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    iconName: "Dna",
    taskCount: 20
  },
  {
    id: 24,
    code: "MODUL-24",
    title: "Modul 24: Grand Capstone: Jaringan Sinkronisasi State & Multiplayer Arena",
    shortTitle: "Cyber Tank 2D Network Arena",
    groupNumber: 8,
    groupLabel: "Kelompok 8: AI Machine Learning & Network",
    domainCategory: "Sinkronisasi Jaringan Komputer (TJKT) & Game Engineering (RPL)",
    focus: "Protokol transmisi paket data JSON, simulasi latensi (ping), interpolasi koordinat linier (Lerp), dan arena pertempuran tank.",
    smkSummary: "Sebagai mahakarya puncak (Grand Capstone Modul 24), modul ini menyatukan kompetensi TJKT (transmisi paket data jaringan, latensi, dan buffering) dengan kompetensi RPL (arsitektur game state synchronization). Siswa mengendalikan tank tempur dengan simulasi paket data jaringan real-time.",
    codingLogic: [
      "Serialisasi state entitas menjadi paket data JSON: { id, x, y, angle, isFiring, timestamp }",
      "Simulasi latensi jaringan (network lag/ping) menggunakan antrean buffer delay",
      "Interpolasi linier (Lerp): x += (targetX - x) * lerpFactor untuk pergerakan mulus tanpa patah",
      "Resolusi proyektil meriam, damage health bar, dan radar minimap arena"
    ],
    keyTopics: [
      "Konsep arsitektur Client-Server vs Peer-to-Peer pada transmisi data",
      "Pengaruh latensi (Ping 50ms vs 250ms) terhadap akurasi rendering objek jaringan",
      "Rotasi laras meriam independen terhadap sasis badan tank menggunakan Math.atan2",
      "Arena pertempuran 2 pemain (Lokal / Sim Network) dengan rintangan blok pelindung"
    ],
    projectResult: "Game Cyber Tank 2D Battle Arena dua pemain lengkap dengan indikator latency/ping simulator, radar minimap, efek ledakan peluru, dan sinkronisasi paket koordinat.",
    assetFile: "/assets/aistudio/modul_24.html",
    accentColor: "from-cyan-600 to-emerald-600",
    badgeBg: "bg-cyan-50 text-cyan-700 border-cyan-200",
    iconName: "Radio",
    taskCount: 20
  }
];
