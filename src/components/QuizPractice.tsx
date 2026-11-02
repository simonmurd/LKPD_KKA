import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BANK_SOAL_DATA, QuestionItem, QuestionType } from '../data/bankSoalData';
import { MODULES_DATA } from '../data/modulesData';
import { 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Code, 
  Check
} from 'lucide-react';

export const QuizPractice: React.FC = () => {
  const { recordQuizScore } = useAuth();
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<QuestionType | 'ALL'>('ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userSelectedOption, setUserSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [essayAnswerText, setEssayAnswerText] = useState<string>('');
  const [showEssaySolution, setShowEssaySolution] = useState<boolean>(false);
  const [scoreHistory, setScoreHistory] = useState<Record<number, boolean>>({});

  const filteredQuestions = BANK_SOAL_DATA.filter((q) => {
    const matchMod = selectedModule === 'ALL' || q.moduleCode === selectedModule;
    const matchType = selectedType === 'ALL' || q.type === selectedType;
    return matchMod && matchType;
  });

  const currentQ: QuestionItem | undefined = filteredQuestions[currentIndex];

  const handleSelectOption = (letter: string) => {
    if (isAnswerSubmitted) return;
    setUserSelectedOption(letter);
  };

  const handleSubmitAnswer = () => {
    if (!currentQ || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setShowExplanation(true);

    if (currentQ.type === 'PG Biasa') {
      const isCorrect = userSelectedOption === currentQ.correctAnswer.trim();
      const updatedHistory = { ...scoreHistory, [currentQ.id]: isCorrect };
      setScoreHistory(updatedHistory);
      const points = Object.values(updatedHistory).filter(Boolean).length;
      recordQuizScore(points * 10, filteredQuestions.length * 10);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
      setEssayAnswerText('');
      setShowEssaySolution(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowExplanation(false);
      setEssayAnswerText('');
      setShowEssaySolution(false);
    }
  };

  const handleResetQuiz = () => {
    setCurrentIndex(0);
    setUserSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowExplanation(false);
    setEssayAnswerText('');
    setShowEssaySolution(false);
    setScoreHistory({});
  };

  const totalScore = Object.values(scoreHistory).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-3 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulasi Uji Pemahaman Mandiri KKA SMK</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Bank Soal Interaktif <span className="text-indigo-600">72 Soal Berbobot</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Uji kemampuan berpikir komputasional, logika JavaScript, dan arsitektur Canvas 2D dengan soal standar SMK TJKT/RPL.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xl font-bold font-mono text-emerald-600">{totalScore}</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Jawaban Benar</div>
            </div>
            <button
              onClick={handleResetQuiz}
              className="p-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 transition"
              title="Reset Kuis"
            >
              <RotateCcw className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Module Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Modul:</span>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentIndex(0);
                setIsAnswerSubmitted(false);
                setUserSelectedOption(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua 18 Modul</option>
              {MODULES_DATA.map((m) => (
                <option key={m.id} value={m.code}>
                  {m.code} - {m.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Tipe:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any);
                setCurrentIndex(0);
                setIsAnswerSubmitted(false);
                setUserSelectedOption(null);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Tipe (54)</option>
              <option value="PG Biasa">PG Biasa</option>
              <option value="PG Kompleks">PG Kompleks</option>
              <option value="Essay">Essay Koding</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Soal <span className="text-indigo-600 font-bold">{currentIndex + 1}</span> dari{' '}
          <span className="font-bold">{filteredQuestions.length}</span>
        </div>
      </div>

      {/* Main Question Card */}
      {currentQ ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          
          {/* Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold">
                {currentQ.moduleCode}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                currentQ.type === 'PG Biasa'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : currentQ.type === 'PG Kompleks'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {currentQ.type}
              </span>
              <span className="text-xs text-slate-600 font-semibold">{currentQ.topic}</span>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              {currentQ.smkCompetency}
            </div>
          </div>

          {/* Question Body */}
          <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed whitespace-pre-line font-sans">
            {currentQ.question}
          </div>

          {/* PG Biasa & PG Kompleks Options */}
          {currentQ.options && currentQ.options.length > 0 && (
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((option, idx) => {
                const letter = option.trim().charAt(0);
                const isSelected = userSelectedOption === letter;
                const isCorrect = isAnswerSubmitted && currentQ.correctAnswer.includes(letter);
                const isWrongSelected = isAnswerSubmitted && isSelected && !currentQ.correctAnswer.includes(letter);

                let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100";
                if (isSelected && !isAnswerSubmitted) {
                  btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-200";
                }
                if (isCorrect) {
                  btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                } else if (isWrongSelected) {
                  btnStyle = "bg-rose-50 border-rose-400 text-rose-900";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(letter)}
                    disabled={isAnswerSubmitted}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 text-xs sm:text-sm ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                      {letter}
                    </span>
                    <span className="leading-relaxed flex-1">{option.slice(3)}</span>
                    {isCorrect && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                    {isWrongSelected && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Essay Answer Area */}
          {currentQ.type === 'Essay' && (
            <div className="space-y-3.5 pt-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Tulis Jawaban Analisis atau Solusi Kode JavaScript Anda di sini:
              </label>
              <textarea
                value={essayAnswerText}
                onChange={(e) => setEssayAnswerText(e.target.value)}
                rows={4}
                placeholder="Tuliskan logika koding dan analisis sintaksis Anda..."
                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEssaySolution(!showEssaySolution)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-2 border border-slate-200 transition"
                >
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>{showEssaySolution ? 'Sembunyikan Solusi' : 'Buka Kunci Solusi Kode & Rubrik'}</span>
                </button>
              </div>

              {showEssaySolution && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in">
                  <div>
                    <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      Kunci Jawaban / Rubrik Penilaian:
                    </h5>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {currentQ.correctAnswer}
                    </p>
                  </div>

                  {currentQ.codingSnippet && (
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-700 font-mono mb-1">
                        Contoh Solusi Kode Lengkap (JavaScript):
                      </h5>
                      <pre className="p-3 rounded-lg bg-slate-900 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                        {currentQ.codingSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Check Answer Button for PG */}
          {currentQ.options && currentQ.options.length > 0 && !isAnswerSubmitted && (
            <div className="pt-2">
              <button
                onClick={handleSubmitAnswer}
                disabled={!userSelectedOption}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-40"
              >
                <span>Periksa Jawaban</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Kunci Jawaban: {currentQ.correctAnswer}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong>Pembahasan Teknis:</strong> {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Bottom Pagination Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="text-xs font-mono text-slate-500">
              {currentIndex + 1} / {filteredQuestions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex >= filteredQuestions.length - 1}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 shadow-sm"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 p-6 rounded-3xl bg-white border border-slate-200 text-slate-500">
          Tidak ada soal yang cocok dengan filter yang dipilih.
        </div>
      )}

    </div>
  );
};
