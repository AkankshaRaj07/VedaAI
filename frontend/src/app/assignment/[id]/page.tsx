'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Save, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  Printer, 
  Layers,
  Calendar,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useAssignmentStore, ISection } from '../../../store/useAssignmentStore';
import { useWebSocket } from '../../../hooks/useWebSocket';

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    activeAssignment,
    jobProgress,
    jobStatus,
    errorMessage,
    fetchAssignmentDetails,
    regenerateAssignment,
    updateAssignmentDetails,
    setViewState
  } = useAssignmentStore();

  const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  const handleBack = () => {
    setViewState('list');
    router.push('/');
  };

  // Track background generation process via WebSockets
  useWebSocket(id);

  const [editMode, setEditMode] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localSections, setLocalSections] = useState<ISection[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch details on mount
  useEffect(() => {
    if (id) {
      fetchAssignmentDetails(id).then((data) => {
        setLocalTitle(data.title);
        setLocalSections(JSON.parse(JSON.stringify(data.sections))); // Deep clone
      }).catch(err => console.error("Error loading assignment details:", err));
    }
  }, [id, fetchAssignmentDetails]);

  // Sync state if active assignment updates (e.g. from WebSocket completes)
  useEffect(() => {
    if (activeAssignment && !editMode) {
      const title = activeAssignment.title;
      const sections = JSON.parse(JSON.stringify(activeAssignment.sections));
      setTimeout(() => {
        setLocalTitle(title);
        setLocalSections(sections);
      }, 0);
    }
  }, [activeAssignment, editMode]);

  const handleRegenerate = async () => {
    if (confirm('Are you sure you want to regenerate this question paper? This will overwrite all current questions and compile a new exam sheet.')) {
      try {
        await regenerateAssignment(id);
      } catch {
        alert('Failed to trigger regeneration.');
      }
    }
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      await updateAssignmentDetails(id, {
        title: localTitle,
        sections: localSections
      });
      setEditMode(false);
    } catch {
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    if (activeAssignment) {
      setLocalTitle(activeAssignment.title);
      setLocalSections(JSON.parse(JSON.stringify(activeAssignment.sections)));
    }
    setEditMode(false);
  };

  // Inline editor helper handlers
  const handleQuestionTextChange = (sIdx: number, qIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].text = value;
    setLocalSections(updated);
  };

  const handleQuestionMarkChange = (sIdx: number, qIdx: number, value: number) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].marks = value;
    setLocalSections(updated);
  };

  const handleQuestionDifficultyChange = (sIdx: number, qIdx: number, value: 'Easy' | 'Moderate' | 'Hard') => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].difficulty = value;
    setLocalSections(updated);
  };

  const handleOptionChange = (sIdx: number, qIdx: number, oIdx: number, value: string) => {
    const updated = [...localSections];
    const q = updated[sIdx].questions[qIdx];
    if (q.options) {
      q.options[oIdx] = value;
      setLocalSections(updated);
    }
  };

  const handleSectionTitleChange = (sIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].title = value;
    setLocalSections(updated);
  };

  const handleSectionInstructionChange = (sIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].instruction = value;
    setLocalSections(updated);
  };

  const handleQuestionCorrectAnswerChange = (sIdx: number, qIdx: number, value: string) => {
    const updated = [...localSections];
    updated[sIdx].questions[qIdx].correctAnswer = value;
    setLocalSections(updated);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract clean user guidelines, removing formatting headers
  const getCleanInstructions = (text?: string) => {
    if (!text) return '';
    if (text.includes('[ADDITIONAL USER GUIDELINES]:')) {
      const parts = text.split('[ADDITIONAL USER GUIDELINES]:');
      return parts[parts.length - 1].trim();
    }
    return text;
  };

  // 1. LOADING / PROGRESS STATE
  if (jobStatus === 'pending' || jobStatus === 'processing') {
    let statusText = 'Job Queued...';
    if (jobProgress >= 20 && jobProgress < 40) statusText = 'Reading grounding study material...';
    else if (jobProgress >= 40 && jobProgress < 60) statusText = 'AI generating tailored examination questions...';
    else if (jobProgress >= 60 && jobProgress < 80) statusText = 'Structuring sections & balancing marks distribution...';
    else if (jobProgress >= 80) statusText = 'Compiling print-ready PDF layout...';

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center relative overflow-hidden animate-float">
          {/* Decorative design highlight */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl"></div>
          
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin"></div>
            <span className="absolute text-xl font-black text-brand-primary">{jobProgress}%</span>
          </div>

          <h2 className="text-xl font-black font-outfit text-brand-dark">Generating Assessment</h2>
          <p className="text-sm font-semibold text-brand-primary animate-pulse mt-1.5">{statusText}</p>
          
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${jobProgress}%` }}
            ></div>
          </div>
          
          <p className="text-xs text-slate-400 mt-6 leading-relaxed font-medium">
            Please do not close this window. Your custom paper is being generated and formatted on the server.
          </p>
        </div>
      </div>
    );
  }

  // 2. FAILED STATE
  if (jobStatus === 'failed' || errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[75vh]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-2xl p-8 text-center">
          <div className="p-4 bg-rose-50 text-brand-primary rounded-full inline-flex mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black font-outfit text-brand-dark">Generation Failed</h2>
          <p className="text-xs text-slate-500 mb-6 font-semibold mt-1 leading-relaxed">
            {errorMessage || 'An error occurred during AI processing. Gemini was unable to structure the responses.'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 rounded-full transition text-sm cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold py-3.5 rounded-full transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/10 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for data load
  if (!activeAssignment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
        <p className="text-sm text-slate-400 font-bold">Fetching assessment details...</p>
      </div>
    );
  }

  // 3. EXAM SHEET OUTPUT
  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col">
      {/* Top Action Toolbar (No-print) */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6 no-print border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleCancelEdits}
                disabled={saving}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSaveEdits}
                disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save & Compile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-brand-dark transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-4 h-4" /> Edit Paper
              </button>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-brand-dark transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-slate-200 rounded-full text-xs font-black text-slate-700 hover:bg-slate-50 hover:text-brand-dark transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Sheet
              </button>
              
              {activeAssignment.pdfUrl ? (
                <a
                  href={`${BACKEND_BASE}${activeAssignment.pdfUrl}`}
                  download
                  className="px-5 py-2 bg-brand-dark-rust hover:bg-brand-dark-rust-hover text-white rounded-full text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-brand-dark-rust/10"
                >
                  <Download className="w-4 h-4 text-brand-primary stroke-[3]" /> Download PDF
                </a>
              ) : (
                <button
                  disabled
                  className="px-5 py-2 bg-slate-100 text-slate-400 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-not-allowed border border-slate-200"
                >
                  <Loader2 className="w-4 h-4 animate-spin" /> Compiling PDF...
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* NCERT warning alert banner (No-print) */}
      <div className="mb-6 bg-[#1A1A1A] text-slate-100 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-md gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              Certainly! Here is a customized question paper based on the {activeAssignment.fileName ? `textbook "${activeAssignment.fileName}"` : 'NCERT guidelines'}.
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5">
              Generated matching the curriculum layout. You can print, edit, or download the PDF version.
            </p>
          </div>
        </div>
        {activeAssignment.pdfUrl && (
          <a
            href={`${BACKEND_BASE}${activeAssignment.pdfUrl}`}
            download
            className="bg-white hover:bg-slate-100 text-slate-900 font-black text-[10px] sm:text-xs px-3 sm:px-4 py-2 rounded-full flex items-center gap-1.5 transition shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Export PDF</span>
          </a>
        )}
      </div>

      {/* Printable Exam Sheet Layout Container */}
      <div className="bg-white border border-slate-200/80 shadow-2xl rounded-3xl p-8 sm:p-12 print-container relative overflow-hidden flex-1">
        {/* Printable Watermark banner (No-print) */}
        <div className="absolute top-4 right-4 no-print text-[9px] font-black text-brand-primary/80 bg-brand-primary/5 px-2.5 py-0.5 border border-brand-primary/10 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
          <Printer className="w-3.5 h-3.5" /> Printable exam preview
        </div>

        {/* Paper title / Letterhead Header block */}
        <div className="text-center mb-8 border-b-4 border-double border-slate-900 pb-5">
          <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5">EduGen Academic Assessment System</h2>
          
          {editMode ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="text-2xl font-black text-center text-slate-800 border-b-2 border-dashed border-brand-primary focus:outline-none w-full max-w-xl pb-1 font-outfit"
            />
          ) : (
            <h1 className="text-2xl sm:text-3xl font-black font-outfit text-brand-dark tracking-tight uppercase">
              {activeAssignment.title}
            </h1>
          )}

          <div className="flex justify-between items-center mt-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> DATE: {new Date(activeAssignment.dueDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" /> TOTAL MARKS: {activeAssignment.totalMarks}</span>
          </div>
        </div>

        {/* Student Name/Section Info Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-2 border-slate-200 rounded-2xl p-5 mb-8 bg-slate-50/30">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Student Name
            </label>
            <input
              type="text"
              placeholder="Enter name"
              className="w-full text-slate-800 text-sm font-semibold border-b border-slate-300 focus:border-brand-primary focus:outline-none pb-1 bg-transparent placeholder-slate-300"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Roll Number
            </label>
            <input
              type="text"
              placeholder="Enter roll no"
              className="w-full text-slate-800 text-sm font-semibold border-b border-slate-300 focus:border-brand-primary focus:outline-none pb-1 bg-transparent placeholder-slate-300"
            />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Class / Section
            </label>
            <input
              type="text"
              placeholder="Enter section"
              className="w-full text-slate-800 text-sm font-semibold border-b border-slate-300 focus:border-brand-primary focus:outline-none pb-1 bg-transparent placeholder-slate-300"
            />
          </div>
        </div>

        {/* General Instructions */}
        <div className="mb-8 text-slate-600 text-xs leading-relaxed font-medium">
          <h3 className="text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
            General Instructions:
          </h3>
          <ul className="list-decimal pl-5 space-y-1 opacity-95">
            <li>Read all questions carefully before writing down answers.</li>
            <li>Double-check all responses before final submission.</li>
            <li>Maintain clear handwriting and spacing in your answers sheet.</li>
            {activeAssignment.additionalInstructions && getCleanInstructions(activeAssignment.additionalInstructions) && (
              <li className="font-bold text-brand-primary italic">
                {getCleanInstructions(activeAssignment.additionalInstructions)}
              </li>
            )}
          </ul>
        </div>

        {/* Questions Sections */}
        <div className="space-y-10">
          {localSections.map((section, sIdx) => (
            <div key={section._id || sIdx} className="space-y-5">
              {/* Section Header (Figma style underlining) */}
              <div className="border-b border-slate-900 pb-1.5">
                {editMode ? (
                  <div className="flex flex-col gap-2 mb-2">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                      className="text-sm font-black text-brand-dark uppercase border-b border-dashed border-brand-primary focus:outline-none w-full max-w-md bg-transparent"
                    />
                    <input
                      type="text"
                      value={section.instruction}
                      onChange={(e) => handleSectionInstructionChange(sIdx, e.target.value)}
                      className="text-[10px] text-slate-500 italic border-b border-dashed border-slate-300 focus:outline-none w-full max-w-lg bg-transparent"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-sm font-black text-brand-dark uppercase tracking-wider">
                      {section.title}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold italic mt-0.5">
                      {section.instruction}
                    </p>
                  </>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-6 divide-y divide-slate-100">
                {section.questions.map((q, qIdx) => (
                  <div key={q._id || qIdx} className={`pt-5 ${qIdx === 0 ? 'pt-0' : ''} flex flex-col gap-2 relative`}>
                    <div className="flex justify-between items-start gap-4">
                      {/* Question Text */}
                      <div className="flex-1 min-w-0">
                        {editMode ? (
                          <textarea
                            value={q.text}
                            rows={2}
                            onChange={(e) => handleQuestionTextChange(sIdx, qIdx, e.target.value)}
                            className="w-full px-3 py-2 text-xs text-slate-800 border-2 border-brand-primary/20 rounded-xl focus:border-brand-primary focus:outline-none font-semibold leading-relaxed"
                          />
                        ) : (
                          <p className="text-brand-dark font-semibold text-sm leading-relaxed">
                            <span className="font-extrabold mr-1.5">{qIdx + 1}.</span>
                            {q.text}
                          </p>
                        )}
                      </div>

                      {/* Marks / Difficulty options in edit mode */}
                      <div className="flex items-center gap-2 shrink-0 no-print">
                        {editMode ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={q.difficulty}
                              onChange={(e) => handleQuestionDifficultyChange(sIdx, qIdx, e.target.value as 'Easy' | 'Moderate' | 'Hard')}
                              className="text-[10px] font-black border border-slate-200 rounded px-1.5 py-1 bg-white focus:border-brand-primary focus:outline-none uppercase"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Hard">Hard</option>
                            </select>
                            <input
                              type="number"
                              value={q.marks}
                              min="1"
                              onChange={(e) => handleQuestionMarkChange(sIdx, qIdx, parseInt(e.target.value) || 1)}
                              className="w-10 text-[10px] font-black border border-slate-200 rounded px-1.5 py-1 text-center focus:border-brand-primary focus:outline-none"
                            />
                            <span className="text-[10px] font-bold text-slate-400">M</span>
                          </div>
                        ) : (
                          <>
                            {/* Difficulty Tags */}
                            {q.difficulty === 'Easy' && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full uppercase tracking-wider">
                                Easy
                              </span>
                            )}
                            {q.difficulty === 'Moderate' && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase tracking-wider">
                                Moderate
                              </span>
                            )}
                            {q.difficulty === 'Hard' && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-100 rounded-full uppercase tracking-wider">
                                Hard
                              </span>
                            )}

                            {/* Marks indicator */}
                            <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {q.marks} M
                            </span>
                          </>
                        )}
                      </div>

                      {/* Right aligned printed marks (Only visible during print) */}
                      <div className="hidden print:flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
                        <span>[{q.marks} Mark{q.marks > 1 ? 's' : ''}]</span>
                      </div>
                    </div>

                    {/* MCQ Options grid */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5 mt-1.5">
                        {q.options.map((opt, oIdx) => {
                          const label = String.fromCharCode(97 + oIdx); // a, b, c, d
                          return (
                            <div key={oIdx} className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-400 text-xs uppercase">({label})</span>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleOptionChange(sIdx, qIdx, oIdx, e.target.value)}
                                  className="flex-1 px-2.5 py-1 text-xs text-slate-700 border border-slate-200 rounded focus:border-brand-primary focus:outline-none font-semibold"
                                />
                              ) : (
                                <span className="text-slate-600 text-xs font-semibold">{opt}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* End of Question Paper Divider */}
        <div className="relative my-10 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest bg-white px-4 font-black text-slate-400 select-none">
            End of Question Paper
          </div>
        </div>

        {/* Answer Key Section */}
        <div className="mt-12 pt-8 border-t-2 border-double border-slate-300">
          <h2 className="text-sm font-black font-outfit text-brand-dark uppercase tracking-wider mb-6">
            Answer Key / Guidelines
          </h2>
          <div className="space-y-6">
            {localSections.map((section, sIdx) => {
              if (!section.questions || section.questions.length === 0) return null;
              
              return (
                <div key={sIdx} className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {section.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="text-xs text-slate-700 font-semibold leading-relaxed bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-1">
                        <span className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider">
                          Question {qIdx + 1}
                        </span>
                        <p className="text-slate-800">{q.text}</p>
                        <div className="mt-1 text-brand-primary font-black flex flex-col sm:flex-row sm:items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">Answer:</span>
                          {editMode ? (
                            <input
                              type="text"
                              value={q.correctAnswer || ''}
                              onChange={(e) => handleQuestionCorrectAnswerChange(sIdx, qIdx, e.target.value)}
                              placeholder="Enter correct answer"
                              className="flex-1 px-2.5 py-1 text-xs border border-brand-primary/20 rounded focus:border-brand-primary focus:outline-none font-semibold text-slate-800 bg-white"
                            />
                          ) : (
                            <span>{q.correctAnswer || 'Answer explanation not provided.'}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
