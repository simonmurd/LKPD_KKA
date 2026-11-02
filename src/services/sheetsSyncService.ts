import { MODULES_DATA, ModuleItem } from '../data/modulesData';
import { BANK_SOAL_DATA, QuestionItem } from '../data/bankSoalData';

export const DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzNQYMH-RpKQUfxw0TOpTp_wJBp7dUMrDV2gVB9AiTkJoGuLOnETSaHyA2fIUdud7LQ/exec";
export const DEFAULT_API_KEY = "AQ.Ab8RN6I6zmxL7yseoRT6ttarJmkMn_A3Q8CwbYmtCcu1nJ12AQ";

// Format baris tabel untuk Tab Modul_Materi
export function generateModulesTSV(): string {
  const headers = [
    "No",
    "Kode_Modul",
    "Judul_Modul",
    "Kelompok_Domain",
    "Kategori_Teknis",
    "Fokus_Utama",
    "Intisari_Materi_SMK",
    "Logika_Koding_Utama",
    "Proyek_Hasil_Praktik",
    "Link_Simulasi_Interaktif"
  ];

  const rows = MODULES_DATA.map((m) => [
    m.id.toString(),
    m.code,
    m.title,
    m.groupLabel,
    m.domainCategory,
    m.focus.replace(/[\t\n\r]/g, " "),
    m.smkSummary.replace(/[\t\n\r]/g, " "),
    m.codingLogic.join(" | ").replace(/[\t\n\r]/g, " "),
    m.projectResult.replace(/[\t\n\r]/g, " "),
    `${window.location.origin}${m.assetFile}`
  ]);

  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

// Format baris tabel untuk Tab Bank_Soal
export function generateQuestionsTSV(): string {
  const headers = [
    "No",
    "Kode_Modul",
    "Topik_Materi",
    "Tipe_Soal",
    "Kompetensi_SMK",
    "Butir_Pertanyaan",
    "Pilihan_Opsi",
    "Kunci_Jawaban",
    "Pembahasan_Teknis",
    "Cuplikan_Kode_JS"
  ];

  const rows = BANK_SOAL_DATA.map((q) => [
    q.id.toString(),
    q.moduleCode,
    q.topic,
    q.type,
    q.smkCompetency,
    q.question.replace(/[\t\n\r]/g, " "),
    (q.options ? q.options.join(" | ") : "-").replace(/[\t\n\r]/g, " "),
    q.correctAnswer.replace(/[\t\n\r]/g, " "),
    q.explanation.replace(/[\t\n\r]/g, " "),
    (q.codingSnippet ? q.codingSnippet.replace(/[\t\n\r]/g, " ") : "-")
  ]);

  return [headers.join("\t"), ...rows.map((r) => r.join("\t"))].join("\n");
}

// Format CSV untuk unduhan file
export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((r) => r.map(escapeCell).join(","));
  return [headerLine, ...dataLines].join("\n");
}

export function downloadFile(content: string, filename: string, mimeType: string = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Payload builder untuk Google Sheets Webhook
export function buildSyncPayload(action: "sync_all" | "sync_modules" | "sync_questions", apiKey: string) {
  return {
    apiKey: apiKey.trim(),
    action,
    timestamp: new Date().toISOString(),
    sheets: {
      Modul_Materi: MODULES_DATA.map((m) => ({
        no: m.id,
        kode: m.code,
        judul: m.title,
        kelompok: m.groupLabel,
        domain: m.domainCategory,
        fokus: m.focus,
        intisari: m.smkSummary,
        logika: m.codingLogic.join("; "),
        hasil: m.projectResult,
        link: `${window.location.origin}${m.assetFile}`
      })),
      Bank_Soal: BANK_SOAL_DATA.map((q) => ({
        no: q.id,
        kodeModul: q.moduleCode,
        topik: q.topic,
        tipe: q.type,
        kompetensi: q.smkCompetency,
        pertanyaan: q.question,
        opsi: q.options ? q.options.join(" | ") : "",
        kunci: q.correctAnswer,
        pembahasan: q.explanation,
        kode: q.codingSnippet || ""
      }))
    }
  };
}

export interface SyncResult {
  success: boolean;
  status: number | string;
  message: string;
  details?: string;
  isPermissionIssue?: boolean;
}

// Mengirim data ke Google Apps Script Webhook
export async function sendToGoogleSheets(
  webhookUrl: string,
  apiKey: string,
  action: "sync_all" | "sync_modules" | "sync_questions"
): Promise<SyncResult> {
  const payload = buildSyncPayload(action, apiKey);
  const targetUrl = webhookUrl.trim() || DEFAULT_WEBHOOK_URL;

  try {
    // Note: Google Apps Script Web App responds to POST.
    // When using fetch in browser, text/plain avoids CORS preflight OPTIONS request.
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    const text = await response.text();

    // Deteksi jika Google merespons dengan halaman login (izin belum "Anyone")
    if (text.includes("ServiceLogin") || text.includes("アクセス権") || text.includes("permission") || text.includes("Google Drive")) {
      return {
        success: false,
        status: 302,
        message: "Perlu Penyesuaian Izin Google Apps Script (Who has access: Anyone)",
        details: "Google Apps Script saat ini membatasi akses (hanya akun pembuat). Ubah izin di Google Apps Script: Deploy > Manage deployments > Who has access > pilih 'Anyone' (Siapa saja), lalu simpan deployment baru.",
        isPermissionIssue: true,
      };
    }

    try {
      const data = JSON.parse(text);
      if (data.status === "success" || data.success) {
        return {
          success: true,
          status: response.status || 200,
          message: data.message || "Data berhasil disinkronkan ke Google Sheets!",
          details: JSON.stringify(data, null, 2),
        };
      } else {
        return {
          success: false,
          status: response.status || 400,
          message: data.message || "Google Apps Script mengembalikan status gagal.",
          details: JSON.stringify(data, null, 2),
        };
      }
    } catch {
      // Jika response berupa HTML atau teks biasa tapi status 200
      if (response.ok) {
        return {
          success: true,
          status: response.status,
          message: "Data terkirim ke Webhook Google Apps Script!",
          details: text.slice(0, 300),
        };
      }
      return {
        success: false,
        status: response.status,
        message: `Response status: ${response.status}`,
        details: text.slice(0, 300),
      };
    }
  } catch (error: any) {
    return {
      success: false,
      status: "CORS / Network Error",
      message: "Gagal menghubungi webhook secara langsung dari browser.",
      details: error?.message || "Kemungkinan CORS di peramban atau URL Webhook belum diatur ke publik ('Anyone'). Anda dapat menggunakan tombol 'Salin Format TSV' untuk langsung menempelkan ke Google Sheets 100% instan!",
      isPermissionIssue: true,
    };
  }
}

// Kode template Apps Script siap pakai untuk pengguna
export const RECOMMENDED_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT: PENERIMA OTOMATIS DATA MODUL_MATERI & BANK_SOAL KKA
 * 
 * CARA MEMASANG:
 * 1. Buka Google Sheets Anda.
 * 2. Klik menu 'Ekstensi' > 'Apps Script' (Extensions > Apps Script).
 * 3. Hapus kode bawaan dan tempelkan seluruh kode ini.
 * 4. Klik tombol 'Terapkan' > 'Kelola penerapan' (Deploy > New deployment).
 * 5. Pilih jenis: 'Aplikasi web' (Web app).
 * 6. Jalankan sebagai: 'Saya' (Me).
 * 7. Siapa yang memiliki akses (CRITICAL!): 'Siapa saja' (ANYONE).
 * 8. Klik Terapkan dan salin URL Webhook-nya!
 */

const EXPECTED_API_KEY = "AQ.Ab8RN6I6zmxL7yseoRT6ttarJmkMn_A3Q8CwbYmtCcu1nJ12AQ";

function doPost(e) {
  try {
    const contents = e.postData ? e.postData.contents : "";
    if (!contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Tidak ada payload data yang diterima."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(contents);

    // Validasi API Key
    if (payload.apiKey !== EXPECTED_API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "API Key tidak valid."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let modulesUpdated = 0;
    let questionsUpdated = 0;

    // 1. TULIS TAB: Modul_Materi
    if (payload.sheets && payload.sheets.Modul_Materi) {
      let sheetModul = ss.getSheetByName("Modul_Materi");
      if (!sheetModul) {
        sheetModul = ss.insertSheet("Modul_Materi");
      }
      sheetModul.clear();
      
      const headerModul = [
        "No", "Kode_Modul", "Judul_Modul", "Kelompok_Domain", "Kategori_Teknis",
        "Fokus_Utama", "Intisari_Materi_SMK", "Logika_Koding_Utama", "Proyek_Hasil_Praktik", "Link_Simulasi"
      ];
      sheetModul.appendRow(headerModul);
      sheetModul.getRange(1, 1, 1, headerModul.length).setFontWeight("bold").setBackground("#e0f2fe");

      const rowsModul = payload.sheets.Modul_Materi.map(m => [
        m.no, m.kode, m.judul, m.kelompok, m.domain,
        m.fokus, m.intisari, m.logika, m.hasil, m.link
      ]);

      if (rowsModul.length > 0) {
        sheetModul.getRange(2, 1, rowsModul.length, headerModul.length).setValues(rowsModul);
        sheetModul.autoResizeColumns(1, headerModul.length);
        modulesUpdated = rowsModul.length;
      }
    }

    // 2. TULIS TAB: Bank_Soal
    if (payload.sheets && payload.sheets.Bank_Soal) {
      let sheetSoal = ss.getSheetByName("Bank_Soal");
      if (!sheetSoal) {
        sheetSoal = ss.insertSheet("Bank_Soal");
      }
      sheetSoal.clear();

      const headerSoal = [
        "No", "Kode_Modul", "Topik_Materi", "Tipe_Soal", "Kompetensi_SMK",
        "Butir_Pertanyaan", "Pilihan_Opsi", "Kunci_Jawaban", "Pembahasan_Teknis", "Cuplikan_Kode_JS"
      ];
      sheetSoal.appendRow(headerSoal);
      sheetSoal.getRange(1, 1, 1, headerSoal.length).setFontWeight("bold").setBackground("#fef08a");

      const rowsSoal = payload.sheets.Bank_Soal.map(q => [
        q.no, q.kodeModul, q.topik, q.tipe, q.kompetensi,
        q.pertanyaan, q.opsi, q.kunci, q.pembahasan, q.kode
      ]);

      if (rowsSoal.length > 0) {
        sheetSoal.getRange(2, 1, rowsSoal.length, headerSoal.length).setValues(rowsSoal);
        sheetSoal.autoResizeColumns(1, headerSoal.length);
        questionsUpdated = rowsSoal.length;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Sinkronisasi berhasil! " + modulesUpdated + " baris Modul_Materi dan " + questionsUpdated + " baris Bank_Soal telah diperbarui.",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "KKA Google Sheets Sync Endpoint",
    expectedKey: EXPECTED_API_KEY ? "CONFIGURED" : "NONE",
    info: "Gunakan method POST untuk mengirim data sinkronisasi."
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
