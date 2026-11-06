/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase Configuration & Firestore Integration Service
 * Terintegrasi penuh dengan Cloud Firestore (Project: capable-window-fsmzh).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  where,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Assignment, StudentSubmission, INITIAL_ASSIGNMENTS } from './data/assignmentsData';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore (support custom databaseId if specified)
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test on initial boot per Firebase skill guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / check config:', error.message);
    } else {
      console.log('Firestore initial ping completed.');
    }
    return false;
  }
}

// Trigger initial ping immediately
testFirestoreConnection();

// ================= FIRESTORE HELPER SERVICES =================

export interface FirestoreExamResult {
  studentId: string;
  studentName: string;
  studentClass: string;
  moduleId: number;
  moduleCode: string;
  mcScore: number;
  correctCount: number;
  totalQuestions: number;
  essayAnswers?: Record<number, string>;
  finalScore: number;
  isPassed: boolean;
  submittedAt: string;
}

export interface FirestoreChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'SISWA' | 'GURU';
  senderClass?: string;
  recipientId?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  type: 'public' | 'direct' | 'broadcast';
}

export interface FirestorePresence {
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

/**
 * Simpan hasil ujian CBT siswa ke Firestore
 */
export async function saveExamResultToFirestore(result: FirestoreExamResult): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'exam_results'), {
      ...result,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error saving exam result to Firestore:', err);
    throw err;
  }
}

/**
 * Ambil semua hasil ujian CBT untuk rekap Guru
 */
export async function getExamResultsFromFirestore(): Promise<FirestoreExamResult[]> {
  try {
    const q = query(collection(db, 'exam_results'), orderBy('submittedAt', 'desc'), limit(500));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as FirestoreExamResult);
  } catch (err) {
    console.error('Error fetching exam results from Firestore:', err);
    return [];
  }
}

/**
 * Kirim pesan chat ke Firestore
 */
export async function sendChatMessageToFirestore(msg: FirestoreChatMessage): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'chat_messages'), {
      ...msg,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error sending chat message to Firestore:', err);
    throw err;
  }
}

/**
 * Listen real-time pesan chat dari Firestore
 */
export function subscribeToChatMessages(
  onUpdate: (messages: FirestoreChatMessage[]) => void
): () => void {
  const q = query(
    collection(db, 'chat_messages'),
    orderBy('timestamp', 'asc'),
    limit(150)
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as FirestoreChatMessage[];
    onUpdate(msgs);
  }, (err) => {
    console.warn('Firestore chat snapshot listener fallback:', err);
  });
}

/**
 * Simpan / perbarui progres belajar siswa (modul koding & skor kuis) ke Firestore
 */
export async function saveStudentProgressToFirestore(progress: {
  studentId: string;
  studentName: string;
  school: string;
  className: string;
  noAbsen: string;
  practicedModules: number[];
  quizScore: number;
  quizTotal: number;
  lastActive: string;
}): Promise<void> {
  try {
    await setDoc(doc(db, 'students', progress.studentId), {
      ...progress,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore save student progress fallback:', err);
  }
}

/**
 * Listen real-time progres seluruh siswa (modul koding & nilai CBT) dari Firestore
 */
export function subscribeToAllStudentProgress(
  onUpdate: (map: Record<string, any>) => void
): () => void {
  const q = query(collection(db, 'students'));

  return onSnapshot(q, (snapshot) => {
    const map: Record<string, any> = {};
    snapshot.docs.forEach((d) => {
      map[d.id] = d.data();
    });
    onUpdate(map);
  }, (err) => {
    console.warn('Firestore student progress snapshot error:', err);
  });
}

/**
 * Listen real-time riwayat hasil ujian CBT yang masuk dari Firestore
 */
export function subscribeToExamResults(
  onUpdate: (results: FirestoreExamResult[]) => void
): () => void {
  const q = query(collection(db, 'exam_results'), orderBy('submittedAt', 'desc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as unknown as FirestoreExamResult[];
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore exam results snapshot error:', err);
  });
}

/**
 * Perbarui status kehadiran (presence) siswa/guru di Firestore
 */
export async function updatePresenceInFirestore(presence: FirestorePresence): Promise<void> {
  try {
    await setDoc(doc(db, 'presences', presence.id), {
      ...presence,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore update presence error:', err);
  }
}

/**
 * Listen status presensi online seluruh siswa dan guru dari Firestore
 */
export function subscribeToPresences(
  onUpdate: (presences: FirestorePresence[]) => void
): () => void {
  const q = query(collection(db, 'presences'));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => d.data() as FirestorePresence);
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore presence snapshot listener fallback:', err);
  });
}

// ================= ASSIGNMENT & SUBMISSION SERVICES =================

/**
 * Simpan / Buat tugas baru oleh Guru ke Cloud Firestore
 */
export async function saveAssignmentToFirestore(assignment: Assignment): Promise<void> {
  try {
    await setDoc(doc(db, 'assignments', assignment.id), {
      ...assignment,
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore save assignment error:', err);
  }
}

/**
 * Hapus tugas yang diberikan Guru dari Cloud Firestore
 */
export async function deleteAssignmentFromFirestore(assignmentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (err) {
    console.error('Firestore delete assignment error:', err);
    throw err;
  }
}

/**
 * Listen daftar tugas aktif yang diberikan Guru dari Firestore
 */
export function subscribeToAssignments(
  onUpdate: (assignments: Assignment[]) => void
): () => void {
  const q = query(collection(db, 'assignments'));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // Jika di Firestore belum ada, gunakan initial assignments
      onUpdate(INITIAL_ASSIGNMENTS);
      return;
    }
    const list = snapshot.docs.map(d => d.data() as Assignment);
    onUpdate(list.length > 0 ? list : INITIAL_ASSIGNMENTS);
  }, (err) => {
    console.warn('Firestore assignments snapshot fallback:', err);
    onUpdate(INITIAL_ASSIGNMENTS);
  });
}

/**
 * Siswa mengirim tugas yang sudah dikerjakan ke Firestore
 */
export async function submitAssignmentToFirestore(submission: StudentSubmission): Promise<void> {
  try {
    await setDoc(doc(db, 'submissions', submission.id), {
      ...submission,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore submit assignment error:', err);
    throw err;
  }
}

/**
 * Guru memberikan nilai dan umpan balik pada tugas siswa
 */
export async function gradeSubmissionInFirestore(
  submissionId: string,
  score: number,
  feedback?: string
): Promise<void> {
  try {
    let grade: 'A' | 'B' | 'C' | 'D' = 'D';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 75) grade = 'C';

    await setDoc(doc(db, 'submissions', submissionId), {
      score,
      grade,
      status: 'graded',
      teacherFeedback: feedback || 'Telah dinilai oleh Guru Pengampu',
      gradedAt: new Date().toISOString(),
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore grade submission error:', err);
    throw err;
  }
}

/**
 * Guru meminta siswa merevisi / mengulang kodingan tugas
 */
export async function requestRevisionInFirestore(
  submissionId: string,
  teacherNotes: string
): Promise<void> {
  try {
    await setDoc(doc(db, 'submissions', submissionId), {
      status: 'needs_revision',
      teacherFeedback: teacherNotes || 'Perlu perbaikan kode praktikum. Silakan cek error kanvas dan kirim ulang.',
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (err) {
    console.error('Firestore request revision error:', err);
    throw err;
  }
}

/**
 * Listen seluruh pengumpulan tugas siswa untuk Dashboard Guru
 */
export function subscribeToSubmissions(
  onUpdate: (submissions: StudentSubmission[]) => void
): () => void {
  const q = query(collection(db, 'submissions'), limit(500));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as unknown as StudentSubmission[];
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore submissions snapshot error:', err);
  });
}

/**
 * Listen pengumpulan tugas milik siswa tertentu untuk Dashboard Siswa
 */
export function subscribeToStudentSubmissions(
  studentId: string,
  onUpdate: (submissions: StudentSubmission[]) => void
): () => void {
  const q = query(collection(db, 'submissions'), where('studentId', '==', studentId));

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as unknown as StudentSubmission[];
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore student submissions snapshot error:', err);
  });
}



