import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '../data/studentsData';

export type UserRole = 'GURU' | 'SISWA' | null;

export interface StudentProgress {
  studentId: string;
  studentName: string;
  school: string;
  className: string;
  noAbsen: string;
  practicedModules: number[]; // e.g. [1, 2, 3]
  quizScore: number; // e.g. 85
  quizTotal: number;
  lastActive: string;
}

interface AuthContextType {
  role: UserRole;
  currentStudent: Student | null;
  teacherUser: { username: string; name: string } | null;
  loginAsStudent: (student: Student) => void;
  loginAsTeacher: (username: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  studentProgressMap: Record<string, StudentProgress>;
  recordModulePractice: (moduleId: number) => void;
  recordQuizScore: (score: number, total: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'kka_auth_session_v1';
const PROGRESS_STORAGE_KEY = 'kka_students_progress_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.role || null;
      }
    } catch {}
    return null;
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.student || null;
      }
    } catch {}
    return null;
  });

  const [teacherUser, setTeacherUser] = useState<{ username: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.teacher || null;
      }
    } catch {}
    return null;
  });

  const [studentProgressMap, setStudentProgressMap] = useState<Record<string, StudentProgress>>(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const saveSession = (newRole: UserRole, student: Student | null, teacher: { username: string; name: string } | null) => {
    setRole(newRole);
    setCurrentStudent(student);
    setTeacherUser(teacher);
    if (newRole) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ role: newRole, student, teacher }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const loginAsStudent = (student: Student) => {
    saveSession('SISWA', student, null);

    // Inisialisasi progress siswa jika belum ada
    setStudentProgressMap((prev) => {
      const existing = prev[student.id];
      const updated = {
        ...prev,
        [student.id]: {
          studentId: student.id,
          studentName: student.name,
          school: student.school,
          className: student.className,
          noAbsen: student.noAbsen,
          practicedModules: existing ? existing.practicedModules : [1],
          quizScore: existing ? existing.quizScore : 0,
          quizTotal: existing ? existing.quizTotal : 0,
          lastActive: new Date().toISOString(),
        },
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loginAsTeacher = (username: string, pass: string) => {
    const cleanUser = username.trim();
    const cleanPass = pass.trim();

    if (cleanUser === 'simonmurd' && cleanPass === 'd17881520') {
      const teacherObj = { username: 'simonmurd', name: 'Pak Simon (Guru Pengampu KKA)' };
      saveSession('GURU', null, teacherObj);
      return { success: true };
    }
    return {
      success: false,
      message: 'Username atau Password salah! Periksa kembali kredensial guru Anda.',
    };
  };

  const logout = () => {
    saveSession(null, null, null);
  };

  const recordModulePractice = (moduleId: number) => {
    if (role !== 'SISWA' || !currentStudent) return;

    setStudentProgressMap((prev) => {
      const current = prev[currentStudent.id] || {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        school: currentStudent.school,
        className: currentStudent.className,
        noAbsen: currentStudent.noAbsen,
        practicedModules: [],
        quizScore: 0,
        quizTotal: 0,
        lastActive: new Date().toISOString(),
      };

      const setMods = new Set(current.practicedModules);
      setMods.add(moduleId);

      const updated = {
        ...prev,
        [currentStudent.id]: {
          ...current,
          practicedModules: Array.from(setMods).sort((a, b) => a - b),
          lastActive: new Date().toISOString(),
        },
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const recordQuizScore = (score: number, total: number) => {
    if (role !== 'SISWA' || !currentStudent) return;

    setStudentProgressMap((prev) => {
      const current = prev[currentStudent.id] || {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        school: currentStudent.school,
        className: currentStudent.className,
        noAbsen: currentStudent.noAbsen,
        practicedModules: [],
        quizScore: 0,
        quizTotal: 0,
        lastActive: new Date().toISOString(),
      };

      const updated = {
        ...prev,
        [currentStudent.id]: {
          ...current,
          quizScore: Math.max(current.quizScore, score),
          quizTotal: total,
          lastActive: new Date().toISOString(),
        },
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentStudent,
        teacherUser,
        loginAsStudent,
        loginAsTeacher,
        logout,
        studentProgressMap,
        recordModulePractice,
        recordQuizScore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
