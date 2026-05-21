'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Calendar, 
  UploadCloud, 
  AlertCircle, 
  Loader2, 
  MoreVertical,
  Trash2,
  X,
  Search,
  Plus,
  ArrowLeft,
  LayoutGrid,
  Filter,
  Mic,
  GripVertical,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';

interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const QUESTION_TYPES_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Long Answer Questions',
  'Case-Based Questions'
];

export default function Dashboard() {
  const router = useRouter();
  const { 
    assignments, 
    fetchAssignments, 
    submitAssignmentForm, 
    deleteAssignment,
    loading: storeLoading,
    viewState,
    setViewState,
    setToastMessage
  } = useAssignmentStore();
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Dynamic Question Config table state
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: '1', type: 'Multiple Choice Questions', count: 5, marks: 2 },
    { id: '2', type: 'Short Questions', count: 2, marks: 5 },
    { id: '3', type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
    { id: '4', type: 'Numerical Problems', count: 2, marks: 5 },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check URL query parameters on mount to see if user requested to open create wizard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setTimeout(() => setViewState('create'), 0);
        // Clear param from URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [setViewState]);

  // Fetch assignments history on mount
  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync back to top on state transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [viewState]);

  // Computed sums
  const totalQuestions = questionRows.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = questionRows.reduce((sum, row) => sum + (row.count * row.marks), 0);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const validateFile = (selectedFile: File) => {
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'txt', 'jpg', 'jpeg', 'png'];
    if (!allowed.includes(ext || '')) {
      alert('Supported files: .pdf, .txt, .jpg, .jpeg, .png');
      return;
    }
    setFile(selectedFile);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveDropdownId(null);
    if (confirm('Are you sure you want to delete this assessment? This cannot be undone.')) {
      try {
        await deleteAssignment(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete assessment.');
      }
    }
  };

  // Dynamic Row Actions
  const handleAddRow = () => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    setQuestionRows([
      ...questionRows,
      { id: newId, type: 'Multiple Choice Questions', count: 1, marks: 1 }
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (questionRows.length <= 1) {
      alert('You must have at least one question type row.');
      return;
    }
    setQuestionRows(questionRows.filter(row => row.id !== id));
  };

  const handleUpdateRow = (id: string, field: 'type' | 'count' | 'marks', value: string | number) => {
    setQuestionRows(questionRows.map(row => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const selected = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (questionRows.length === 0) {
      errors.rows = 'Add at least one question type row';
    }

    const invalidRow = questionRows.some(row => row.count <= 0 || row.marks <= 0);
    if (invalidRow) {
      errors.rows = 'All question counts and marks must be positive values';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setGeneralError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('dueDate', dueDate);
      
      const uniqueTypes = Array.from(new Set(questionRows.map(row => {
        // Map UI names to simple backend friendly names if preferred, or use row.type directly
        if (row.type === 'Multiple Choice Questions') return 'MCQ';
        if (row.type === 'Short Questions') return 'Short Answer';
        if (row.type === 'Long Answer Questions') return 'Long Answer';
        return row.type;
      })));
      formData.append('questionTypes', uniqueTypes.join(','));

      formData.append('numQuestions', totalQuestions.toString());
      formData.append('totalMarks', totalMarks.toString());

      // Prepend structural AI formatting instruction context
      let aiInstructions = ``;
      questionRows.forEach((row, index) => {
        const sectionLetter = String.fromCharCode(65 + index);
        aiInstructions += `- Section ${sectionLetter} (${row.type}): Generate exactly ${row.count} questions, each worth ${row.marks} marks.\n`;
      });
      
      const structuredPrompt = `[EXAM STRUCTURE REQUEST]:
Please arrange questions into distinct sections as follows:
${aiInstructions}
The total exam questions MUST equal exactly ${totalQuestions} and overall marks MUST sum to exactly ${totalMarks}.

[ADDITIONAL USER GUIDELINES]:
${additionalInstructions || 'None.'}`;

      formData.append('additionalInstructions', structuredPrompt);
      
      if (file) {
        formData.append('file', file);
      }

      const createdAssignment = await submitAssignmentForm(formData);
      
      resetForm();
      setViewState('list');
      router.push(`/assignment/${createdAssignment._id}`);
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setQuestionRows([
      { id: '1', type: 'Multiple Choice Questions', count: 5, marks: 2 },
      { id: '2', type: 'Short Questions', count: 2, marks: 5 },
      { id: '3', type: 'Diagram/Graph-Based Questions', count: 2, marks: 5 },
      { id: '4', type: 'Numerical Problems', count: 2, marks: 5 },
    ]);
    setAdditionalInstructions('');
    setFile(null);
    setFormErrors({});
    setGeneralError(null);
  };

  // Format date helper: returns DD-MM-YYYY
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Client-side search and status filters
  const filteredAssignments = assignments.filter(asg => {
    const matchesSearch = asg.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'All' || asg.status.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex flex-col font-sans">
      
      {/* Removed duplicate header bar (now persistent in LayoutWrapper) */}

      {/* 2. Page Body Controller */}
      {viewState === 'list' ? (
        /* ==================== ASSIGNMENTS DASHBOARD LIST ==================== */
        <div className="flex-1 flex flex-col">
          
          {/* Mobile subheader (matches Figma Screenshot 2) */}
          <div className="md:hidden flex items-center justify-between mb-4 relative py-2">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-slate-200/60 text-slate-800 flex items-center justify-center hover:bg-slate-300/80 transition shadow-sm z-10 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3]" />
            </button>
            <h1 className="absolute left-1/2 transform -translate-x-1/2 font-outfit font-black text-brand-dark text-base">
              Assignments
            </h1>
            <div className="w-10 h-10 shrink-0"></div>
          </div>

          {/* Header Row (Desktop only) */}
          <div className="hidden md:flex flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <div>
                <h1 className="text-3xl font-black font-outfit text-brand-dark tracking-tight leading-none">
                  Assignments
                </h1>
                <p className="mt-1 text-slate-500 text-sm font-medium">
                  Manage and create assignments for your classes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setViewState('create')}
              className="bg-brand-dark-pill hover:bg-brand-dark-pill-hover text-white font-extrabold text-xs py-3 px-5 rounded-full flex items-center gap-2 transition shadow-md shadow-brand-dark-pill/10 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create Assignment
            </button>
          </div>

          {/* Filtering & Search Toolbar (Matches Figma Pill layout) */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 rounded-full p-2.5 mb-6 shadow-sm relative">
            {/* Filter Toggle/Label */}
            <div className="flex items-center gap-1.5 px-3 py-1 text-slate-500 hover:text-slate-800 cursor-pointer border-r border-slate-200 pr-4 shrink-0 relative">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold">Filter</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Processing">Processing</option>
                <option value="Pending">Queued</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            
            {/* Search Pill */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name"
                className="w-full bg-transparent pl-8 pr-3 py-1 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Main List Rendering */}
          {storeLoading && assignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white border border-slate-200/80 rounded-3xl">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
              <p className="text-sm text-slate-400 font-bold tracking-tight">Retrieving assessments database...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            
            /* FIGMA SCREEN 1: Empty State Layout with SVG Illustration */
            <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-3xl mx-auto w-full my-auto text-center">
              
              {/* Custom SVG Illustration */}
              <div className="w-64 h-64 relative flex items-center justify-center mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Dotted circle background */}
                  <circle cx="100" cy="100" r="75" stroke="#E2E8F0" strokeWidth="2.5" strokeDasharray="6,6" fill="none" />
                  
                  {/* Subtle curved background lines */}
                  <path d="M 40,110 Q 70,70 120,80 T 165,110" fill="none" stroke="#F1F5F9" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 50,130 C 80,100 120,150 150,110" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="4,4" />

                  {/* Sparkle details */}
                  {/* Orange Sparkle */}
                  <path d="M 45,65 Q 48,60 48,55 Q 48,60 51,65 Q 48,65 48,70 Q 48,65 45,65 Z" fill="#E05058" />
                  <circle cx="41" cy="57" r="2.5" fill="#E05058" opacity="0.6" />
                  {/* Muted Blue Sparkle */}
                  <path d="M 152,145 Q 155,140 155,135 Q 155,140 158,145 Q 155,145 155,150 Q 155,145 152,145 Z" fill="#93C5FD" />
                  <circle cx="163" cy="141" r="2" fill="#93C5FD" />

                  {/* Floating Document sheet */}
                  <g transform="translate(72, 55)">
                    <rect x="0" y="0" width="56" height="74" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5" />
                    {/* Dummy content lines */}
                    <line x1="12" y1="18" x2="32" y2="18" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                    <line x1="12" y1="28" x2="44" y2="28" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="38" x2="38" y2="38" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="48" x2="44" y2="48" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Checkmarks / Status symbols */}
                    <circle cx="38" cy="18" r="4.5" fill="#F1F5F9" />
                  </g>

                  {/* Magnifying Glass with Red Cross Layer */}
                  <g transform="translate(100, 95)">
                    {/* Shadow overlay */}
                    <circle cx="22" cy="22" r="25" fill="#0f172a" fillOpacity="0.05" />
                    
                    {/* Glass Circle */}
                    <circle cx="20" cy="20" r="22" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="3.5" />
                    <circle cx="20" cy="20" r="18" fill="#F8FAFC" />
                    
                    {/* Metal Handle */}
                    <line x1="36" y1="36" x2="52" y2="52" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="36" y1="36" x2="52" y2="52" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Red Cross (X) icon inside glass */}
                    <line x1="13" y1="13" x2="27" y2="27" stroke="#E05058" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="27" y1="13" x2="13" y2="27" stroke="#E05058" strokeWidth="3.5" strokeLinecap="round" />
                  </g>
                </svg>
              </div>

              <h2 className="text-xl font-black font-outfit text-brand-dark">
                No assignments yet
              </h2>
              <p className="text-slate-500 text-sm max-w-md mt-2.5 leading-relaxed font-semibold">
                Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
              </p>
              
              <button
                onClick={() => setViewState('create')}
                className="mt-6 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs py-3.5 px-6 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />
                Create Your First Assignment
              </button>
            </div>
          ) : (
            
            /* FIGMA SCREEN 2: Assessments Grid List styling */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((asg) => (
                <div
                  key={asg._id}
                  onClick={() => router.push(`/assignment/${asg._id}`)}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all relative flex flex-col justify-between min-h-[220px] cursor-pointer group"
                >
                  {/* Card Header & Title */}
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h3 className="text-base font-black font-outfit text-brand-dark leading-snug truncate group-hover:text-[#E05058] transition pr-6">
                        {asg.title}
                      </h3>
                      
                      {/* Ellipsis Actions Menu Button */}
                      <div className="relative" ref={asg._id === activeDropdownId ? dropdownRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === asg._id ? null : asg._id);
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-brand-dark hover:bg-slate-50 transition relative z-10"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Options */}
                        {activeDropdownId === asg._id && (
                          <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 w-44 z-30 font-extrabold text-xs text-slate-700">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(null);
                                router.push(`/assignment/${asg._id}`);
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition text-left"
                            >
                              <span>View Assignment</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, asg._id)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-50 text-[#E05058] border-t border-slate-100 transition text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#E05058]" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                        {asg.numQuestions} Questions
                      </span>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">
                        {asg.totalMarks} Marks
                      </span>
                      {asg.fileName && (
                        <span className="text-[10px] font-black text-brand-primary bg-rose-50/50 px-2 py-0.5 rounded border border-[#FECDD3] truncate max-w-[130px]">
                          {asg.fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card bottom details */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 mt-auto">
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <span>Assigned on: {formatDate(asg.createdAt)}</span>
                      <span>Due: {formatDate(asg.dueDate)}</span>
                    </div>

                    {/* Status indicator bar */}
                    <div className="flex items-center justify-between mt-1">
                      {asg.status === 'completed' && (
                        <span className="px-2.5 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed
                        </span>
                      )}
                      {asg.status === 'processing' && (
                        <span className="px-2.5 py-0.5 text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <Loader2 className="w-3 h-3 text-amber-600 animate-spin" /> Processing
                        </span>
                      )}
                      {asg.status === 'pending' && (
                        <span className="px-2.5 py-0.5 text-[9px] font-black bg-slate-100 text-slate-600 border border-slate-200 rounded-full uppercase tracking-wider">
                          Queued
                        </span>
                      )}
                      {asg.status === 'failed' && (
                        <span className="px-2.5 py-0.5 text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-100 rounded-full flex items-center gap-1 uppercase tracking-wider">
                          <AlertCircle className="w-3 h-3 text-brand-primary" /> Failed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating bottom action button */}
          <button
            onClick={() => setViewState('create')}
            className="fixed bottom-6 right-6 md:right-8 bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs py-3 px-5 rounded-full flex items-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer z-10 no-print"
          >
            <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />
            Create Assignment
          </button>
        </div>
      ) : (
        
        /* ==================== CREATE ASSIGNMENT FORM WIZARD ==================== */
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          
          {/* Page Header (Matches Figma Screen 3 / first screenshot) */}
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-emerald-100 flex-shrink-0 animate-pulse"></span>
            <div>
              <h1 className="text-xl font-black font-outfit text-brand-dark tracking-tight leading-none">
                Create Assignment
              </h1>
              <p className="mt-1 text-slate-500 text-[10px] sm:text-xs font-semibold">
                Set up a new assignment for your students
              </p>
            </div>
          </div>

          {/* Progress Indicator line */}
          <div className="w-full max-w-md mx-auto bg-slate-200 h-1.5 rounded-full overflow-hidden mb-10">
            <div className="bg-[#4A4A4A] h-full w-[45%] rounded-full"></div>
          </div>

          {/* Error Message Box */}
          {generalError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Creation Failed</p>
                <p className="opacity-90">{generalError}</p>
              </div>
            </div>
          )}

          {/* Assignment Details Card container */}
          <form onSubmit={onSubmit} className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Header info */}
            <div>
              <h2 className="text-xl font-black font-outfit text-brand-dark">Assignment Details</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Basic information about your assignment</p>
            </div>

            {/* Title block */}
            <div>
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                placeholder="e.g. Quiz on Electricity"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-2xl border ${formErrors.title ? 'border-brand-primary focus:ring-brand-primary/10' : 'border-slate-200 focus:ring-brand-primary/10'} focus:border-brand-primary focus:outline-none focus:ring-4 transition text-slate-800 text-sm font-semibold`}
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-brand-primary font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.title}
                </p>
              )}
            </div>

            {/* Grounding textbook upload box */}
            <div>
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
                Grounding Document (Syllabus/Textbook)
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 transition text-center flex flex-col items-center justify-center ${
                  dragActive 
                    ? 'border-[#E05058] bg-[#E05058]/5' 
                    : file 
                    ? 'border-emerald-300 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-full mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 max-w-sm truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-2.5 text-[10px] font-black text-[#E05058] hover:text-[#c83c44] transition uppercase tracking-wider cursor-pointer"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full py-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-full mb-2.5">
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Choose a file or drag & drop it here</p>
                    <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG, PDF, TXT up to 10MB</p>
                    <span className="mt-3.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[11px] rounded-full uppercase tracking-wider transition inline-block">
                      Browse Files
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Due Date row */}
            <div>
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full pl-4 pr-11 py-3 rounded-2xl border ${formErrors.dueDate ? 'border-brand-primary focus:ring-brand-primary/10' : 'border-slate-200 focus:ring-brand-primary/10'} focus:border-brand-primary focus:outline-none focus:ring-4 transition text-slate-800 text-sm font-semibold`}
                />
                <Calendar className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
              </div>
              {formErrors.dueDate && (
                <p className="mt-1 text-xs text-brand-primary font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {formErrors.dueDate}
                </p>
              )}
            </div>

            {/* Dynamic Question Type Configuration Table */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-black text-brand-dark uppercase tracking-wider">
                  Question Formats & Balancing
                </label>
                {formErrors.rows && (
                  <p className="text-xs text-brand-primary font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {formErrors.rows}
                  </p>
                )}
              </div>

              {/* Rows List */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                
                {questionRows.map((row) => (
                  <div key={row.id}>
                    {/* Desktop View (Table Row Style) */}
                    <div className="hidden md:flex p-4 bg-slate-50/50 hover:bg-slate-50 flex-row items-center justify-between gap-4 transition border-b border-slate-100 last:border-0">
                      {/* Left: Drag Handle and Select Dropdown */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="text-slate-300 cursor-grab p-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <select
                          value={row.type}
                          onChange={(e) => handleUpdateRow(row.id, 'type', e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary flex-1 max-w-[280px]"
                        >
                          {QUESTION_TYPES_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      {/* Right: Counter controls and Delete button */}
                      <div className="flex items-center gap-4 text-xs font-extrabold text-slate-500">
                        {/* Questions count capsule */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider leading-none">No. of Questions</span>
                          <div className="flex items-center bg-white rounded-full border border-slate-200 p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'count', Math.max(1, row.count - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition font-black cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-xs font-black text-brand-dark">{row.count}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'count', row.count + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition font-black cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Marks capsule */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider leading-none">Marks</span>
                          <div className="flex items-center bg-white rounded-full border border-slate-200 p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'marks', Math.max(1, row.marks - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition font-black cursor-pointer text-sm"
                            >
                              -
                            </button>
                            <span className="w-10 text-center text-xs font-black text-brand-dark">{row.marks}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'marks', row.marks + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition font-black cursor-pointer text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[70px] pr-2">
                          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider leading-none">Subtotal</span>
                          <span className="text-xs font-black text-brand-primary">{row.count * row.marks} M</span>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-rose-50 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View (Figma Screen 3 Card Style) */}
                    <div className="md:hidden p-4 bg-slate-50/50 hover:bg-slate-50 flex flex-col gap-3.5 transition border-b border-slate-100 last:border-0">
                      {/* Top Row: Dropdown select and delete button */}
                      <div className="flex items-center justify-between gap-3">
                        <select
                          value={row.type}
                          onChange={(e) => handleUpdateRow(row.id, 'type', e.target.value)}
                          className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary flex-1 shadow-sm"
                        >
                          {QUESTION_TYPES_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-2 rounded-full text-slate-400 hover:text-brand-primary bg-white border border-slate-200 shadow-sm transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom Row: Side-by-side count capsules */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* No. of Questions Capsule */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 text-center">No. of Questions</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'count', Math.max(1, row.count - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition font-black text-sm"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-brand-dark min-w-[20px] text-center">{row.count}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'count', row.count + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition font-black text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Marks Capsule */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-2.5 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1 text-center">Marks</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'marks', Math.max(1, row.marks - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition font-black text-sm"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-brand-dark min-w-[20px] text-center">{row.marks}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateRow(row.id, 'marks', row.marks + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition font-black text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>

              {/* Add Row Button & Running Totals banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-full flex items-center gap-1.5 transition cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question Type
                </button>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-5 py-3 flex items-center gap-4 font-bold text-xs shadow-sm">
                  <div className="text-slate-400 uppercase tracking-wider text-[10px] mr-2">Total Balance:</div>
                  <span className="text-slate-700">{totalQuestions} Questions</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="text-brand-primary font-black text-sm">{totalMarks} Total Marks</span>
                </div>
              </div>
            </div>

            {/* Additional Syllabus Guidelines */}
            <div className="relative">
              <label className="block text-xs font-black text-brand-dark uppercase tracking-wider mb-2">
                Syllabus Guidelines / Custom Instructions
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Generate a question paper for 3 hour exam duration. Focus on electrostatics principles."
                  className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-[#E05058]/10 focus:border-[#E05058] focus:outline-none transition text-slate-800 text-sm font-semibold"
                />
                {/* Voice icon at bottom right of guidelines */}
                <button
                  type="button"
                  onClick={() => setToastMessage("Voice guidelines input is coming soon!")}
                  title="Voice input"
                  className="absolute right-4 bottom-4 p-2 rounded-xl text-slate-400 hover:text-brand-dark hover:bg-slate-100 transition cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Footer Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setViewState('list');
                  resetForm();
                }}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-extrabold py-3.5 rounded-full text-xs transition cursor-pointer text-center"
              >
                Previous
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#1A1A1A] hover:bg-black text-white font-extrabold py-3.5 rounded-full text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Assessment...
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
