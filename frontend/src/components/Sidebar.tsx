'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Users, 
  FileText, 
  Briefcase, 
  FolderOpen,
  Settings, 
  X,
  Sparkles
} from 'lucide-react';
import { useAssignmentStore } from '../store/useAssignmentStore';

// Custom Ape Avatar component using premium inline SVG
export const ApeAvatar = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`${className} rounded-full bg-[#FFE4E6] border border-[#FECDD3] shrink-0 overflow-hidden`}>
    {/* Ape Face Base */}
    <circle cx="50" cy="53" r="32" fill="#8B4513" /> 
    <path d="M 30,50 C 30,35 42,32 50,32 C 58,32 70,35 70,50 C 70,68 62,78 50,78 C 38,78 30,68 30,50 Z" fill="#D2B48C" /> 
    {/* Ears */}
    <circle cx="20" cy="50" r="10" fill="#8B4513" />
    <circle cx="20" cy="50" r="6" fill="#D2B48C" />
    <circle cx="80" cy="50" r="10" fill="#8B4513" />
    <circle cx="80" cy="50" r="6" fill="#D2B48C" />
    {/* Eyes */}
    <circle cx="42" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="42" cy="48" r="2.5" fill="#000000" />
    <circle cx="58" cy="48" r="5" fill="#FFFFFF" />
    <circle cx="58" cy="48" r="2.5" fill="#000000" />
    {/* Glasses */}
    <rect x="34" y="44" width="14" height="8" rx="2" fill="none" stroke="#E05058" strokeWidth="2.5" />
    <rect x="52" y="44" width="14" height="8" rx="2" fill="none" stroke="#E05058" strokeWidth="2.5" />
    <line x1="48" y1="48" x2="52" y2="48" stroke="#E05058" strokeWidth="2.5" />
    {/* Cap/Hat */}
    <path d="M 22,34 C 25,18 45,15 50,15 C 55,15 75,18 78,34 Z" fill="#1A1A1A" /> 
    <path d="M 20,34 C 35,32 65,32 80,34 C 85,34 90,38 78,38 C 65,38 35,38 22,38 C 10,38 15,34 20,34 Z" fill="#E05058" /> 
    {/* Mouth */}
    <path d="M 40,64 C 45,68 55,68 60,64" fill="none" stroke="#5C4033" strokeWidth="2" strokeLinecap="round" />
    {/* Nose */}
    <circle cx="48" cy="56" r="1.5" fill="#5C4033" />
    <circle cx="52" cy="56" r="1.5" fill="#5C4033" />
  </svg>
);

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, viewState, setViewState, setToastMessage } = useAssignmentStore();

  const navItems = [
    { name: 'Home', icon: LayoutGrid, path: '#', active: false },
    { name: 'My Groups', icon: Users, path: '#', active: false },
    { name: 'Assignments', icon: FileText, path: '/', active: pathname === '/' || pathname.startsWith('/assignment') },
    { name: 'AI Teacher\'s Toolkit', icon: Briefcase, path: '#', active: false },
    { name: 'My Library', icon: FolderOpen, path: '#', active: false }
  ];

  const handleNewAssignment = () => {
    // Open the full-page create form directly by changing state or route
    setViewState('create');
    router.push('/');
    setSidebarOpen(false);
  };

  const handleNavigate = (name: string, path: string) => {
    if (path === '#') {
      setToastMessage(`${name} section is coming soon!`);
      setSidebarOpen(false);
      return;
    }
    if (path === '/') {
      setViewState('list');
    }
    router.push(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 no-print"
        />
      )}

      {/* Left Sidebar Panel (No-print) */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('Home', '/')}>
            {/* VedaAI Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-white font-black text-base shadow-md border border-slate-800/80 relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#E05058] blur-[2px] opacity-80" />
              <span className="relative z-10 font-outfit">V</span>
            </div>
            <span className="font-outfit font-black text-2xl tracking-tight text-brand-dark">
              Veda<span className="font-medium text-slate-800">AI</span>
            </span>
          </div>
          {/* Close button on mobile */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-50">
            <X className="md:hidden w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Dark Capsule with Glow Border */}
        <div className="px-5 py-6">
          <button
            onClick={handleNewAssignment}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white font-extrabold text-xs py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all brand-btn-glow cursor-pointer mb-2"
          >
            <Sparkles className="w-4 h-4 text-white fill-white" />
            + Create Assignment
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isPlaceholder = item.path === '#';
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.name, item.path)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black tracking-tight transition duration-150 relative cursor-pointer ${
                  item.active
                    ? 'bg-[#F1F5F9] text-brand-dark'
                    : isPlaceholder
                    ? 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-brand-dark' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
          {/* Settings gear link */}
          <button
            onClick={() => {
              setToastMessage("Settings are managed by your school administrator.");
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition rounded-2xl cursor-pointer text-left"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Settings
          </button>

          {/* Delhi Public School profile card */}
          <div className="p-4 rounded-3xl bg-[#F1F5F9] border border-slate-200/50">
            <div className="flex items-center gap-3">
              <ApeAvatar className="w-9 h-9" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-brand-dark truncate leading-tight">
                  Delhi Public School
                </p>
                <p className="text-[9px] font-bold text-slate-500 truncate mt-0.5">
                  Bokaro Steel City
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
