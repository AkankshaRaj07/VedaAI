'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  Award, 
  FileText, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen, 
  Users, 
  ArrowRight,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

export default function HomePage() {
  const router = useRouter();
  const { 
    dashboardStats, 
    dashboardTasks, 
    fetchDashboardStats, 
    fetchDashboardTasks, 
    addDashboardTask, 
    toggleDashboardTask, 
    deleteDashboardTask, 
    setToastMessage, 
    setViewState 
  } = useAssignmentStore();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskClass, setNewTaskClass] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchDashboardTasks();
  }, [fetchDashboardStats, fetchDashboardTasks]);

  const handleToggleTask = async (id: string) => {
    try {
      await toggleDashboardTask(id);
      setToastMessage("Task status updated!");
    } catch (err: any) {
      setToastMessage("Failed to update task.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDashboardTask(id);
      setToastMessage("Task removed.");
    } catch (err: any) {
      setToastMessage("Failed to delete task.");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await addDashboardTask({
        title: newTaskTitle,
        class: newTaskClass || 'General',
        time: 'Today'
      });
      setNewTaskTitle('');
      setNewTaskClass('');
      setToastMessage("Task added to schedule!");
    } catch (err: any) {
      setToastMessage("Failed to create task.");
    }
  };

  const handleLaunchCreate = () => {
    setViewState('create');
    router.push('/?new=true');
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full flex flex-col font-sans animate-fadeIn">
      {/* 1. Header Hero Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-outfit text-brand-dark tracking-tight leading-none">
            Welcome Back, <span className="text-[#E05058]">John Doe</span>
          </h1>
          <p className="mt-2 text-slate-500 text-sm font-semibold">
            Here's what requires your attention at Delhi Public School today.
          </p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-sm text-xs font-black text-slate-700 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-[#E05058]" />
          <span>Thursday, 21 May 2026</span>
        </div>
      </div>

      {/* 2. Overview Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Active Evaluations */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Evaluation Attempts</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark mt-1">
                {(dashboardStats?.submissionAttempts ?? 1240).toLocaleString()} / {(dashboardStats?.submissionTarget ?? 1500).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-rose-50 border border-[#FECDD3] text-[#E05058] rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#E05058] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((dashboardStats?.submissionAttempts ?? 1240) / (dashboardStats?.submissionTarget ?? 1500)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] font-bold text-slate-500">
              <span>{Math.min(100, ((dashboardStats?.submissionAttempts ?? 1240) / (dashboardStats?.submissionTarget ?? 1500)) * 100).toFixed(1)}% completed</span>
              <span className="text-emerald-600 font-extrabold">+12% this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Average Marks */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg. School Performance</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark mt-1">{dashboardStats?.classAverage ?? 78.4}%</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
              +2.4% vs Last Term
            </span>
            <span className="text-[10px] font-semibold text-slate-400">Based on {dashboardStats?.totalSubmissions ?? 48} submissions</span>
          </div>
        </div>

        {/* Card 3: Assessments Generated */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completed Exam Papers</p>
              <h3 className="text-2xl font-black font-outfit text-brand-dark mt-1">{dashboardStats?.totalAssignments ?? 48} Papers</h3>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-semibold text-slate-500">
            <span>{Math.max(0, (dashboardStats?.totalAssignments ?? 48) - 6)} Syllabus grounded</span>
            <span className="text-[#E05058] font-black flex items-center gap-0.5 hover:underline cursor-pointer" onClick={() => router.push('/')}>
              View all <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Start Launchers - Glow effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Launcher A: Create Paper */}
        <div 
          onClick={handleLaunchCreate}
          className="bg-[#1A1A1A] hover:bg-black text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[160px] cursor-pointer transition relative overflow-hidden group brand-btn-glow"
        >
          {/* Subtle design element */}
          <div className="absolute top-0 right-0 w-24 h-full bg-[#E05058] opacity-10 blur-[30px] rounded-full transform translate-x-10 scale-150 transition group-hover:scale-175 duration-300" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="w-6 h-6 text-[#E05058] fill-[#E05058]" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition transform group-hover:translate-x-1" />
          </div>
          
          <div className="relative z-10 mt-6">
            <h4 className="text-lg font-black font-outfit">Create New Assessment</h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">Use AI to generate syllabus-grounded worksheets and papers in seconds.</p>
          </div>
        </div>

        {/* Launcher B: Toolkit */}
        <div 
          onClick={() => router.push('/toolkit')}
          className="bg-white border border-slate-200 hover:border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer transition group"
        >
          <div className="flex justify-between items-start">
            <div className="p-3 bg-rose-50 border border-[#FECDD3] text-[#E05058] rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#E05058] transition transform group-hover:translate-x-1" />
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-black font-outfit text-brand-dark">Teacher's Toolkit</h4>
            <p className="text-xs text-slate-500 mt-1 font-semibold">Generate lesson plans, question banks, and expand grading remarks.</p>
          </div>
        </div>
      </div>

      {/* 4. Dual Section Layout: Interactive Schedule vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Weekly Schedule/Checklist (3/5 width) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black font-outfit text-brand-dark flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E05058]" /> Upcoming Schedule & Tasks
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {dashboardTasks.filter(i => !i.completed).length} pending
            </span>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {dashboardTasks.map(item => (
              <div 
                key={item._id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                  item.completed 
                    ? 'bg-slate-50/70 border-slate-100 text-slate-400' 
                    : 'bg-[#F1F5F9]/40 border-slate-200/50 hover:bg-[#F1F5F9]/80 text-brand-dark'
                }`}
              >
                <div 
                  onClick={() => handleToggleTask(item._id)} 
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <button className="focus:outline-none shrink-0">
                    <CheckCircle2 className={`w-5 h-5 ${item.completed ? 'text-emerald-500 fill-emerald-50' : 'text-slate-300'}`} />
                  </button>
                  <div className="min-w-0">
                    <p className={`text-xs font-black truncate leading-tight ${item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block">
                      {item.class}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    item.completed 
                      ? 'bg-slate-100 text-slate-400' 
                      : 'bg-rose-50 text-[#E05058] border border-[#FECDD3]'
                  }`}>
                    {item.time}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(item._id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <input
              type="text"
              placeholder="Add new task..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#E05058]"
              required
            />
            <input
              type="text"
              placeholder="e.g. Grade 10"
              value={newTaskClass}
              onChange={e => setNewTaskClass(e.target.value)}
              className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#E05058]"
            />
            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-black text-white p-2 rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Recent Activity Feed (2/5 width) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 className="text-base font-black font-outfit text-brand-dark flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-[#E05058]" /> Recent AI Activities
          </h3>

          <div className="space-y-4 flex-1 relative pl-4 border-l border-slate-100">
            {/* Activity 1 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#E05058] border-2 border-white ring-4 ring-rose-50" />
              <p className="text-xs font-black text-brand-dark leading-tight">AI Assessment Generated</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Quiz on Electricity - Grade 10-A Physics</p>
              <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block">10 mins ago</span>
            </div>

            {/* Activity 2 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
              <p className="text-xs font-black text-slate-600 leading-tight">Remarks Enhanced</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Refined 12 student report feedback logs</p>
              <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block">2 hours ago</span>
            </div>

            {/* Activity 3 */}
            <div className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
              <p className="text-xs font-black text-slate-600 leading-tight">Classroom Group Created</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Added Grade 9-B Physics roster (24 pupils)</p>
              <span className="text-[9px] font-bold text-slate-400 mt-1 inline-block font-sans">Yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Suggestion Insight Bar */}
      <div className="mt-8 bg-amber-50/50 border border-amber-100/80 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h5 className="text-xs font-black text-amber-900 leading-tight">VedaAI Academic Insight</h5>
            <p className="text-[10px] text-amber-700 mt-0.5 font-semibold">
              Students in Grade 9-B showed 15% lower average scores in the "Magnetism" section. Need a corrective practice sheet?
            </p>
          </div>
        </div>
        <button 
          onClick={handleLaunchCreate}
          className="bg-white hover:bg-slate-50 border border-amber-200 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-full transition shrink-0 cursor-pointer shadow-sm"
        >
          Create practice sheet
        </button>
      </div>
    </div>
  );
}
