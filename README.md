# KKA DevCore - Platform Pembelajaran Koding & Kecerdasan Artifisial (KKA)
### SMK NEGERI 1 SINGKAWANG (Konsentrasi Keahlian TJKT & RPL)

Platform web pembelajaran mandiri interaktif 24 Modul KKA dengan dual-panel code editor & live canvas, CBT Exam Center (40 PG + 10 Essay per modul), asisten guru pintar, sinkronisasi Google Sheets otomatis, pemantauan kehadiran siswa secara real-time, dan live chat.

---

## 🚀 Panduan Mempublikasikan Aplikasi ke GitHub & Online di GitHub Pages

Aplikasi ini telah dikonfigurasi secara optimal untuk di-hosting di **GitHub Pages** secara gratis dengan alur otomatis (CI/CD GitHub Actions).

### Langkah 1: Buat Repositori Baru di GitHub
1. Buka [github.com](https://github.com) dan login ke akun GitHub Anda.
2. Klik tombol **New** (Buat Repositori Baru).
3. Beri nama repositori, contoh: `kka-smkn1-singkawang` atau `kka-devcore`.
4. Pilih **Public** agar bisa menggunakan GitHub Pages secara gratis.
5. Biarkan centang "Add a README file" kosong (karena kita sudah punya proyek lokal ini).
6. Klik **Create repository**.

---

### Langkah 2: Push Kode ke Repositori GitHub
Buka terminal/command prompt pada folder proyek ini, lalu jalankan perintah berikut:

```bash
# 1. Inisialisasi git (jika belum)
git init

# 2. Tambahkan semua berkas ke git staging
git add .

# 3. Buat commit perdana
git commit -m "feat: KKA DevCore platform pembelajaran 24 modul SMK Negeri 1 Singkawang"

# 4. Pastikan branch utama bernama main
git branch -M main

# 5. Hubungkan ke repositori GitHub Anda (ganti USERNAME dan REPO_NAME sesuai akun Anda)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 6. Push kode ke GitHub
git push -u origin main
```

---

### Langkah 3: Aktifkan GitHub Pages (1 Menit)
1. Di halaman repositori GitHub Anda, klik menu tab **Settings** (Pengaturan di kanan atas).
2. Di bilah sisi kiri, klik menu **Pages**.
3. Pada bagian **Build and deployment**:
   - **Source**: Ubah dari *"Deploy from a branch"* menjadi **"GitHub Actions"**.
4. Selesai! Workflow otomatis `.github/workflows/deploy.yml` yang sudah kami siapkan akan langsung berjalan.
5. Anda dapat memantau prosesnya di tab **Actions**. Dalam 1-2 menit, situs Anda sudah online dengan alamat:
   ```
   https://USERNAME.github.io/REPO_NAME/
   ```

---

## 🛠️ Menjalankan di Komputer Lokal (Development)

Jika ingin menjalankan atau mengembangkan aplikasi di laptop/komputer secara lokal:

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Buka browser di http://localhost:3000
```

---

## 🌟 Fitur Utama Aplikasi

1. **2 Dashboard Terpisah**:
   - **Dashboard Siswa**: Autocomplete / Searchable Combobox dengan data absensi resmi SMK Negeri 1 Singkawang (Kelas X TJK, XI TJK, XII TKJ). Siswa hanya mengakses materi, coding lab, dan ujian CBT.
   - **Dashboard Guru**: PIN proteksi (Default: `123456`), panel pantau login kehadiran real-time, live chat siswa-guru, asisten AI guru, inspeksi bank soal, dan sinkronisasi Google Sheets.

2. **24 Modul Pembelajaran KKA**:
   - Mencakup Dasar Berpikir Komputasional, Algoritma TJKT, Pemrograman Web, Sensor IoT, AI & ML, hingga Proyek Akhir.
   - Dual-Panel Workspace: Panel Koding (JavaScript + Canvas 2D) dengan 20 tugas interaktif per modul (total 480 tugas) dan Panel Hasil Visual instan.
   - Mode Fokus Koding / Game mandiri.

3. **CBT Exam Center**:
   - 40 Soal Pilihan Ganda (A-E) acak terstruktur per modul.
   - 10 Soal Essay dengan rubrik penilaian bertingkat per modul.
   - Timer 60 menit, peringatan waktu kritis, KKM 75, dan review jawaban terperinci.

4. **Pemantauan Login & Live Chat**:
   - Guru dapat melihat status login siswa (Aktif di modul apa, sedang koding atau ujian).
   - Live Chat interaktif Guru <-> Siswa (Ruang Publik, Pesan Langsung 1-on-1, dan Pengumuman Broadcast).
   - Mendukung multi-tab real-time sync otomatis via BroadcastChannel saat di-hosting statis di GitHub Pages.

5. **Integrasi Google Sheets Otomatis**:
   - Webhook Apps Script yang siap disinkronkan secara langsung dari browser (`Modul_Materi` dan `Bank_Soal`).
   - Ekspor TSV / CSV untuk kemudahan copy-paste langsung ke Google Spreadsheet.

---

## 📋 Catatan Penggunaan di Lingkungan Sekolah
- Siswa dapat membuka web langsung melalui browser smartphone atau komputer laboratorium tanpa perlu install aplikasi apapun.
- Nilai CBT dan data modul tersimpan aman di local storage siswa dan dapat diekspor langsung oleh guru.
