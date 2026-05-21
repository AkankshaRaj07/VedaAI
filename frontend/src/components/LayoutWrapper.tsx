'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  FileText, 
  Briefcase, 
  FolderOpen,
  Bell,
  ChevronDown,
  Menu,
  X,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import Sidebar, { ApeAvatar } from './Sidebar';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, viewState, setViewState, toastMessage, setToastMessage } = useAssignmentStore();

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const handleTabClick = (tabName: string) => {
    if (tabName === 'Assignments') {
      setViewState('list');
      router.push('/');
    }
  };

  const isHomeActive = false;
  const isAssignmentsActive = pathname === '/' && viewState === 'list';
  const isCreateActive = pathname === '/' && viewState === 'create';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brand-warm relative">
      {/* 1. Left Sidebar Navigation (Desktop only, drawer on mobile) */}
      <Sidebar />

      {/* 2. Main Content Pane */}
      <main className="flex-1 md:pl-64 flex flex-col min-w-0 pb-24 md:pb-8 relative">
        
        {/* Unified persistent top header (No-print) */}
        <div className="w-full px-4 pt-4 md:px-8 md:pt-6 no-print">
          <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-sm">
            
            {/* Left Side: Dynamic back button or mobile logo */}
            {!(pathname === '/' && viewState === 'list') ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (pathname.startsWith('/assignment')) {
                      setViewState('list');
                      router.push('/');
                    } else if (viewState === 'create') {
                      setViewState('list');
                    }
                  }}
                  className="w-8 h-8 rounded-full border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition cursor-pointer shadow-sm shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="text-slate-400 font-extrabold text-sm tracking-tight">
                  Assignment
                </span>
              </div>
            ) : (
              /* Logo (Visible on mobile header always, on desktop hide to prevent duplication since sidebar is open) */
              <div className="md:hidden">
                <div 
                  onClick={() => {
                    setViewState('list');
                    router.push('/');
                  }}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-white font-extrabold text-xs shadow-md border border-slate-800">
                    <svg viewBox="0 0 100 100" className="w-4 h-4 fill-white font-black">
                      <path d="M15,15 L45,85 L55,85 L85,15 L70,15 L50,65 L30,15 Z" />
                    </svg>
                  </div>
                  <span className="font-outfit font-black text-lg tracking-tight text-brand-dark">
                    Veda<span className="font-medium text-slate-800">AI</span>
                  </span>
                </div>
              </div>
            )}

            {/* Right Side Tools */}
            <div className="flex items-center gap-3">
              {/* Notification icon */}
              <div 
                onClick={() => setToastMessage("No new notifications at this time.")}
                className="relative p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition text-slate-600"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#E05058] border border-white"></span>
              </div>

              {/* User Avatar Dropdown */}
              <div 
                onClick={() => setToastMessage("Signed in as John Doe (john.doe@delhipublicschool.edu)")}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-full pl-1 pr-3 py-1 shadow-sm hover:border-slate-300 transition cursor-pointer select-none"
              >
                <ApeAvatar className="w-8 h-8" />
                <span className="text-[11px] font-black text-brand-dark hidden sm:inline whitespace-nowrap">John Doe</span>
                <ChevronDown className="w-3 h-3 text-slate-400 stroke-[3] hidden sm:inline" />
              </div>

              {/* Hamburger Menu Toggle (Mobile only) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* 3. Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* 4. Mobile floating "+" action button (Only in list view) (No-print) */}
        {pathname === '/' && viewState === 'list' && (
          <button
            onClick={() => setViewState('create')}
            className="md:hidden fixed bottom-24 right-6 z-40 bg-white text-[#E05058] rounded-full p-4 shadow-xl border border-slate-100 hover:scale-[1.05] active:scale-[0.95] transition cursor-pointer flex items-center justify-center w-12 h-12"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        )}

        {/* 5. Mobile Bottom Navigation Bar (No-print) */}
        <div className="md:hidden fixed bottom-5 left-4 right-4 z-40 bg-[#1A1A1A] text-slate-400 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl border border-slate-800/40 no-print">
          
          <button 
            onClick={() => setToastMessage("Home dashboard is coming soon!")}
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[9px] font-bold">Home</span>
          </button>

          <button 
            onClick={() => handleTabClick('Assignments')}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${isAssignmentsActive || isCreateActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[9px] font-bold">Assignments</span>
          </button>

          <button 
            onClick={() => setToastMessage("Library section is coming soon!")}
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-[9px] font-bold">Library</span>
          </button>

          <button 
            onClick={() => setToastMessage("AI Teacher's Toolkit is coming soon!")}
            className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-[9px] font-bold">AI Toolkit</span>
          </button>

        </div>

      </main>

      {/* Toast Notification (No-print) */}
      {toastMessage && (
        <div className="fixed top-20 right-4 md:right-8 z-50 animate-float bg-slate-900 border border-slate-800/80 text-white rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-2.5 max-w-sm transition-all duration-300 no-print">
          <div className="w-2 h-2 rounded-full bg-[#E05058] shrink-0 animate-pulse"></div>
          <span className="text-xs font-black tracking-tight">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
