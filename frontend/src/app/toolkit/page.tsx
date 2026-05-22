'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  Award, 
  ArrowLeft, 
  Copy, 
  Check, 
  Loader2, 
  FileSpreadsheet, 
  HelpCircle, 
  Compass, 
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

export default function ToolkitPage() {
  const { generateToolkitContent, setToastMessage } = useAssignmentStore();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  
  // Simulated State Handlers
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState('');

  // 1. Lesson Plan Form States
  const [lpGrade, setLpGrade] = useState('10th Grade');
  const [lpSubject, setLpSubject] = useState('Physics');
  const [lpTopic, setLpTopic] = useState('Electromagnetic Induction');
  const [lpObjectives, setLpObjectives] = useState('Understand Faraday\'s Law, Lenz\'s Law, and apply to simple coils.');
  const [lpDuration, setLpDuration] = useState('60');

  // 2. Feedback Enhancer Form States
  const [fbName, setFbName] = useState('Kabir Verma');
  const [fbTone, setFbTone] = useState('Constructive');
  const [fbDraft, setFbDraft] = useState('did well in exams but forgot to show formulas for numericals. Needs to focus on step-by-step methods.');

  // 3. Question Bank Form States
  const [qbTopic, setQbTopic] = useState('Thermodynamics');
  const [qbCount, setQbCount] = useState('3');
  const [qbDifficulty, setQbDifficulty] = useState('Medium');

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setToastMessage("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const steps = [
      "Analyzing learning standard objectives...",
      "Drafting contextual classroom hook...",
      "Structuring timeline intervals (Hook, Direct Instruction, Application)...",
      "Formulating exit-ticket assessment questions...",
      "Polishing Markdown layout..."
    ];
    
    setIsGenerating(true);
    setGeneratedOutput('');
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStepText(steps[stepIndex]);
        stepIndex++;
      }
    }, 600);

    try {
      const output = await generateToolkitContent('lesson_plan', {
        grade: lpGrade,
        subject: lpSubject,
        topic: lpTopic,
        objectives: lpObjectives,
        duration: parseInt(lpDuration) || 60
      });
      clearInterval(stepInterval);
      setGeneratedOutput(output);
      setToastMessage("Lesson Plan generated successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      setToastMessage(`Failed to generate: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const steps = [
      "Analyzing student profile and remarks draft...",
      "Applying educational behavioral principles...",
      "Polishing tone alignment...",
      "Reviewing assessment structure..."
    ];
    
    setIsGenerating(true);
    setGeneratedOutput('');
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStepText(steps[stepIndex]);
        stepIndex++;
      }
    }, 600);

    try {
      const output = await generateToolkitContent('feedback', {
        studentName: fbName,
        tone: fbTone,
        draft: fbDraft
      });
      clearInterval(stepInterval);
      setGeneratedOutput(output);
      setToastMessage("Feedback Remarks enhanced successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      setToastMessage(`Failed to enhance remarks: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuestionBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const steps = [
      "Gathering textbook context metadata...",
      "Synthesizing standard-aligned questions...",
      "Generating detailed rubric answers & marking schemes...",
      "Validating question complexity levels..."
    ];
    
    setIsGenerating(true);
    setGeneratedOutput('');
    
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStepText(steps[stepIndex]);
        stepIndex++;
      }
    }, 600);

    try {
      const output = await generateToolkitContent('question_bank', {
        topic: qbTopic,
        numQuestions: parseInt(qbCount) || 3,
        difficulty: qbDifficulty
      });
      clearInterval(stepInterval);
      setGeneratedOutput(output);
      setToastMessage("Question Bank created successfully!");
    } catch (err: any) {
      clearInterval(stepInterval);
      setToastMessage(`Failed to build question bank: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToolkit = () => {
    setActiveTool(null);
    setGeneratedOutput('');
    setIsGenerating(false);
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex flex-col font-sans animate-fadeIn">
      
      {!activeTool ? (
        /* ==================== TOOLKIT HOME SELECTION MENU ==================== */
        <div className="flex-1 flex flex-col">
          <p className="text-slate-500 text-sm font-semibold mb-8">Access AI-powered modules to plan lessons, compile questions, and expand student feedback logs.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Lesson Plan */}
            <div 
              onClick={() => setActiveTool('lesson_plan')}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div>
                <div className="p-3 bg-rose-50 border border-[#FECDD3] text-[#E05058] rounded-2xl w-fit mb-5">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mt-1 group-hover:text-[#E05058] transition">
                  Lesson Plan Generator
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                  Generate structured lesson schedules, learning objectives, activities, and outline timelines aligned to syllabus.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5 text-[10px] font-black text-[#E05058] uppercase tracking-wider">
                <span>Configure & Generate</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Question Bank */}
            <div 
              onClick={() => setActiveTool('question_bank')}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div>
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl w-fit mb-5">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mt-1 group-hover:text-[#E05058] transition">
                  Question Bank Builder
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                  Synthesize exam-style questions complete with grading schemes and rubrics based on selected topics.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5 text-[10px] font-black text-[#E05058] uppercase tracking-wider">
                <span>Configure & Generate</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Feedback Enhancer */}
            <div 
              onClick={() => setActiveTool('feedback')}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group min-h-[220px]"
            >
              <div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl w-fit mb-5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black font-outfit text-brand-dark mt-1 group-hover:text-[#E05058] transition">
                  Feedback Enhancer
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 font-semibold leading-relaxed">
                  Expand basic teacher drafts into comprehensive, encouraging, and academically helpful student review comments.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-5 text-[10px] font-black text-[#E05058] uppercase tracking-wider">
                <span>Configure & Enhance</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== ACTIVE TOOL PANEL ==================== */
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Back button and Config Panel (Left 5 cols) */}
          <div className="lg:col-span-5 w-full space-y-6">
            <button
              onClick={resetToolkit}
              className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              {activeTool === 'lesson_plan' && (
                <form onSubmit={handleGenerateLessonPlan} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-black font-outfit text-brand-dark">Lesson Planner</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Customize parameters for your lesson schedule</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Grade Level</label>
                    <input type="text" value={lpGrade} onChange={e => setLpGrade(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Subject</label>
                    <input type="text" value={lpSubject} onChange={e => setLpSubject(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Lesson Topic</label>
                    <input type="text" value={lpTopic} onChange={e => setLpTopic(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Learning Objectives</label>
                    <textarea rows={3} value={lpObjectives} onChange={e => setLpObjectives(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary resize-none" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Duration (Minutes)</label>
                    <input type="number" value={lpDuration} onChange={e => setLpDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <button type="submit" disabled={isGenerating} className="w-full py-3 bg-[#1A1A1A] hover:bg-black disabled:bg-slate-400 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 transition uppercase tracking-wider cursor-pointer">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />}
                    Generate Lesson Plan
                  </button>
                </form>
              )}

              {activeTool === 'feedback' && (
                <form onSubmit={handleGenerateFeedback} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-black font-outfit text-brand-dark">Feedback Enhancer</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Elevate your brief evaluation notes</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Student Name</label>
                    <input type="text" value={fbName} onChange={e => setFbName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Desired Tone</label>
                    <select value={fbTone} onChange={e => setFbTone(e.target.value)} className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary">
                      <option value="Encouraging">Encouraging & Warm</option>
                      <option value="Constructive">Constructive & Growth</option>
                      <option value="Academic">Direct & Academic</option>
                      <option value="Motivating">High Motivation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Draft Observations / Notes</label>
                    <textarea rows={4} value={fbDraft} onChange={e => setFbDraft(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary resize-none" />
                  </div>

                  <button type="submit" disabled={isGenerating} className="w-full py-3 bg-[#1A1A1A] hover:bg-black disabled:bg-slate-400 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 transition uppercase tracking-wider cursor-pointer">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />}
                    Enhance Remarks
                  </button>
                </form>
              )}

              {activeTool === 'question_bank' && (
                <form onSubmit={handleGenerateQuestionBank} className="space-y-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-black font-outfit text-brand-dark">Question Builder</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Synthesize custom assessment questions</p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Topic / Syllabus Section</label>
                    <input type="text" value={qbTopic} onChange={e => setQbTopic(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Question Count</label>
                    <select value={qbCount} onChange={e => setQbCount(e.target.value)} className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary">
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-brand-dark uppercase tracking-wider mb-1.5">Difficulty Level</label>
                    <select value={qbDifficulty} onChange={e => setQbDifficulty(e.target.value)} className="w-full bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary">
                      <option value="Easy">Easy / Conceptual</option>
                      <option value="Medium">Medium / Application</option>
                      <option value="Hard">Hard / Critical Thinking</option>
                    </select>
                  </div>

                  <button type="submit" disabled={isGenerating} className="w-full py-3 bg-[#1A1A1A] hover:bg-black disabled:bg-slate-400 text-white font-extrabold text-xs rounded-full flex items-center justify-center gap-2 transition uppercase tracking-wider cursor-pointer">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#E05058] fill-[#E05058]" />}
                    Build Question Bank
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* AI Output Preview Panel (Right 7 cols) */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Overlay simulation spinner during generation */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center py-20 px-6 text-center animate-fadeIn">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                    <Loader2 className="w-12 h-12 text-[#E05058] animate-spin absolute" />
                    <Sparkles className="w-5 h-5 text-[#E05058] fill-[#E05058]" />
                  </div>
                  <h4 className="text-base font-black font-outfit text-brand-dark">VedaAI Synthesis Engine</h4>
                  <p className="text-xs text-slate-500 font-bold mt-2 animate-pulse">{currentStepText}</p>
                </div>
              )}

              {/* Header section of preview */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E05058] animate-pulse"></span>
                  <span className="text-xs font-black text-brand-dark uppercase tracking-wider">AI Live Output Preview</span>
                </div>
                {generatedOutput && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-center">
                {generatedOutput ? (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 font-mono text-xs text-slate-800 overflow-y-auto max-h-[380px] whitespace-pre-wrap leading-relaxed select-text select-all">
                    {generatedOutput}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h5 className="text-sm font-black font-outfit text-slate-400">No output generated yet</h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1.5 font-semibold">Fill out the configuration parameters on the left and click generate to run the simulation.</p>
                  </div>
                )}
              </div>

              {/* Helper Footer note */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#E05058] fill-[#E05058]" />
                <span>Generated content can be copied and grounded directly into custom templates.</span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
