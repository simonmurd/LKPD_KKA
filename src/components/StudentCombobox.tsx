import React, { useState, useRef, useEffect } from 'react';
import { Student, STUDENTS_DATA, SCHOOL_OPTIONS, CLASS_OPTIONS } from '../data/studentsData';
import { Search, ChevronDown, Check, School, X } from 'lucide-react';

interface StudentComboboxProps {
  selectedStudent: Student | null;
  onSelectStudent: (student: Student | null) => void;
}

export const StudentCombobox: React.FC<StudentComboboxProps> = ({
  selectedStudent,
  onSelectStudent,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('SEMUA SEKOLAH');
  const [selectedClass, setSelectedClass] = useState<string>('SEMUA KELAS');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStudents = STUDENTS_DATA.filter((s) => {
    const matchSchool =
      selectedSchool === 'SEMUA SEKOLAH' || s.school.toLowerCase() === selectedSchool.toLowerCase();
    const matchClass =
      selectedClass === 'SEMUA KELAS' || s.className.toLowerCase() === selectedClass.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.noAbsen.includes(q) ||
      s.className.toLowerCase().includes(q) ||
      s.school.toLowerCase().includes(q);

    return matchSchool && matchClass && matchQuery;
  });

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, selectedSchool, selectedClass]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredStudents.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredStudents[highlightedIndex]) {
        onSelectStudent(filteredStudents[highlightedIndex]);
        setIsOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-3 font-sans">
      
      {/* Quick Filter Selectors */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
          <School className="w-3.5 h-3.5 text-indigo-600" /> Filter:
        </span>
        
        {/* School Dropdown */}
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {SCHOOL_OPTIONS.map((sc, i) => (
            <option key={i} value={sc}>
              {sc}
            </option>
          ))}
        </select>

        {/* Class Dropdown */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          {CLASS_OPTIONS.map((cl, i) => (
            <option key={i} value={cl}>
              {cl}
            </option>
          ))}
        </select>
      </div>

      {/* Main Combobox Input Field */}
      <div className="relative">
        <div
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`w-full min-h-[48px] px-3.5 py-2 rounded-xl bg-white border transition-all flex items-center justify-between gap-3 cursor-pointer ${
            isOpen
              ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-sm'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            
            {selectedStudent && !isOpen ? (
              <div className="flex items-center gap-2 truncate">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold shrink-0">
                  No. {selectedStudent.noAbsen}
                </span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {selectedStudent.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:inline">
                  ({selectedStudent.className})
                </span>
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isOpen) setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik Nama Siswa atau No. Absen (Contoh: ALVINO, 01, DEBORA)..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedStudent && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStudent(null);
                  setSearchQuery('');
                  setIsOpen(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Hapus Pilihan"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-indigo-600' : ''
              }`}
            />
          </div>
        </div>

        {/* Autocomplete Dropdown List */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>
                Menemukan <strong className="text-indigo-600 font-bold">{filteredStudents.length}</strong> siswa
              </span>
              <span className="text-[10px] text-slate-400">Gunakan panah & enter untuk memilih</span>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const isSelected = selectedStudent?.id === student.id;
                  const isHighlighted = highlightedIndex === index;

                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        onSelectStudent(student);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`p-3 text-xs flex items-center justify-between gap-3 cursor-pointer transition ${
                        isHighlighted
                          ? 'bg-indigo-50/80 text-indigo-900'
                          : isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-[11px] text-slate-700 shrink-0 border border-slate-200">
                          {student.noAbsen}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                            {student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-indigo-700 font-semibold">
                              {student.className}
                            </span>
                            <span>•</span>
                            <span className="truncate">{student.school}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Tidak ditemukan siswa dengan kata kunci "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Student Confirmation Card */}
      {selectedStudent && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm shrink-0">
              {selectedStudent.noAbsen}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                {selectedStudent.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedStudent.className} — {selectedStudent.school}
              </div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Siap Belajar
          </span>
        </div>
      )}

    </div>
  );
};
