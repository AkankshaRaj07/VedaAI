'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Settings
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
  const searchParams = useSearchParams();
  const { sidebarOpen, setSidebarOpen, viewState, setViewState, toastMessage, setToastMessage, darkMode, setDarkMode, userName, userEmail, userAvatar, buildingModalOpen, setBuildingModalOpen } = useAssignmentStore();
  
  // Notifications State
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  const getPageTitle = () => {
    if (pathname === '/home') return 'Home';
    if (pathname === '/groups') return 'My Groups';
    if (pathname === '/toolkit') return "AI Teacher's Toolkit";
    if (pathname === '/library') return 'My Library';
    if (pathname.startsWith('/assignment')) return 'Assignment Details';
    if (viewState === 'create') return 'Create Assignment';
    return 'Assignments';
  };

  const isHomeActive = pathname === '/home';
  const isAssignmentsActive = (pathname === '/' && viewState === 'list') || pathname.startsWith('/assignment');
  const isCreateActive = pathname === '/' && viewState === 'create';
  const isLibraryActive = pathname === '/library';
  const isToolkitActive = pathname === '/toolkit';
  const isAssignmentOutput = pathname.startsWith('/assignment/');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#CCCCCC] md:bg-brand-warm dark:md:bg-slate-950 transition-colors relative">
      {/* 1. Left Sidebar Navigation (Desktop only, drawer on mobile) */}
      <Sidebar />

      {/* 2. Main Content Pane */}
      <main className="flex-1 md:pl-[272px] flex flex-col min-w-0 pb-24 md:pb-8 relative">
        
        {/* Unified persistent top header (No-print) */}
        <div className="w-full px-4 pt-4 md:px-4 md:pt-6 no-print mb-6">
          <div className="bg-white dark:bg-[#111111] rounded-[24px] px-4 md:px-6 py-2.5 flex items-center justify-between shadow-sm border border-transparent dark:border-slate-800 transition-colors">
            
            {/* Left Side: Dynamic back button, page title, or mobile logo */}
            <div className="flex items-center gap-3">
              {/* Mobile Logo */}
              <div className="md:hidden">
                <div 
                  onClick={() => {
                    setViewState('list');
                    router.push('/');
                  }}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <rect width="28" height="28" rx="7" fill="#303030"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.9089 19.8507C15.9089 19.8507 16.4181 21.2101 16.8848 21.2952H10.9878C9.79981 21.2952 8.73946 20.6155 8.39977 19.3409L4.96347 9.14449C4.96347 9.14449 4.66663 7.9124 4.19995 7.70001H10.2243C11.4122 7.74255 12.2183 8.16732 12.685 9.73942L15.9089 19.8507Z" fill="white"/>
                    <path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M15.9089 19.8507C15.9089 19.8507 16.4181 21.2101 16.8848 21.2952H10.9878C9.79981 21.2952 8.73946 20.6155 8.39977 19.3409L4.96347 9.14449C4.96347 9.14449 4.66663 7.9124 4.19995 7.70001H10.2243C11.4122 7.74255 12.2183 8.16732 12.685 9.73942L15.9089 19.8507Z" fill="url(#paint0_linear_19_382)"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M12.1335 19.8509C12.1335 19.8509 11.6243 21.2103 11.1576 21.2954H17.0546C18.2426 21.2954 19.3029 20.6157 19.6426 19.3411L23.0367 9.14497C23.0367 9.14497 23.3335 7.91289 23.8002 7.7005H17.8181C16.6301 7.7005 15.8666 8.12527 15.3999 9.69737L12.1335 19.8509Z" fill="white"/>
                    <defs>
                    <linearGradient id="paint0_linear_19_382" x1="10.5424" y1="6.54428" x2="10.5424" y2="22.4936" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity="0"/>
                    <stop offset="0.33" stopColor="white" stopOpacity="0"/>
                    <stop offset="0.76" stopColor="#0E1513"/>
                    <stop offset="1" stopColor="#0E1513"/>
                    </linearGradient>
                    </defs>
                  </svg>
                  <span
                    className="font-bricolage text-[1.2rem] font-bold leading-none text-[#1A1A1A] dark:text-white transition-colors"
                    style={{ letterSpacing: '-0.01em' }}
                  >
                    VedaAI
                  </span>
                </div>
              </div>

              {/* Back button and breadcrumb (Desktop and Mobile) */}
              {isAssignmentOutput ? (
                <button
                  onClick={() => { setViewState('list'); router.push('/'); }}
                  className="hidden md:flex items-center gap-2 text-xs sm:text-[14px] text-[#A0A0A0] font-medium hover:text-slate-700 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#A0A0A0]" />
                  <Sparkles className="w-4 h-4 text-[#A0A0A0]" />
                  Create New
                </button>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (pathname.startsWith('/assignment')) {
                        setViewState('list');
                        router.push('/');
                      } else if (viewState === 'create') {
                        setViewState('list');
                      } else if (pathname === '/toolkit' && searchParams.get('tool')) {
                        router.push('/toolkit');
                      } else {
                        router.back();
                      }
                    }}
                    className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition relative cursor-pointer"
                  >
                    <ArrowLeft className="w-[18px] h-[18px] stroke-[1.5] text-slate-600 dark:text-slate-300 transition-colors" />
                  </button>
                  <div className="flex items-center gap-2.5 text-slate-400 ml-1">
                    <LayoutGrid className="w-5 h-5 stroke-[1.5]" />
                    <span className="font-medium text-[15px] tracking-tight text-slate-500 dark:text-slate-400 transition-colors">
                      {getPageTitle()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Tools */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
              >
                {darkMode ? <Sun className="w-5 h-5 stroke-[1.5]" /> : <Moon className="w-5 h-5 stroke-[1.5]" />}
              </button>

              {/* Notification icon */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
                >
                <Bell className="w-5 h-5 stroke-[1.5]" />
                  <span className="absolute top-[8px] right-[8px] w-[9px] h-[9px] rounded-full bg-[#E05058] border-[1.5px] border-white dark:border-[#111111]"></span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn overflow-hidden transition-colors">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#111111] transition-colors">
                      <h4 className="font-outfit font-black text-brand-dark dark:text-white transition-colors">Notifications</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full transition-colors">0 New</span>
                    </div>
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                        <Bell className="w-5 h-5 text-slate-300 dark:text-slate-500 transition-colors" />
                      </div>
                      <p className="text-sm font-bold text-brand-dark dark:text-white transition-colors">You&apos;re all caught up!</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 transition-colors">No new notifications to show right now.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <div 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3 py-1.5 transition cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <ApeAvatar className="w-full h-full" />
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-slate-800 dark:text-white hidden sm:inline whitespace-nowrap transition-colors">{userName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] hidden sm:inline transition-colors" />
                </div>
                
                {/* Profile Menu Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn overflow-hidden transition-colors">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#111111] transition-colors">
                      <p className="font-outfit font-black text-brand-dark dark:text-white text-[15px] truncate transition-colors">{userName}</p>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5 transition-colors">{userEmail}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { setShowProfileDropdown(false); router.push('/settings'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer text-left"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-xs font-bold">Settings</span>
                      </button>
                      <button 
                        onClick={() => { setShowProfileDropdown(false); setToastMessage("Signed out successfully."); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#E05058] rounded-xl transition cursor-pointer text-left mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-xs font-bold">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger Menu Toggle (Mobile only) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-xl bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none cursor-pointer shadow-sm border border-transparent dark:border-slate-800 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>

          {/* Mobile Back Button and Title */}
          {!isAssignmentOutput && (
            <div className="md:hidden flex items-center justify-center relative mt-6 mb-2 px-2">
              <button
                onClick={() => {
                  if (pathname.startsWith('/assignment')) {
                    setViewState('list');
                    router.push('/');
                  } else if (viewState === 'create') {
                    setViewState('list');
                  } else if (pathname === '/toolkit' && searchParams.get('tool')) {
                    router.push('/toolkit');
                  } else {
                    router.back();
                  }
                }}
                className="absolute left-2 w-10 h-10 rounded-full bg-[#E0E0E0] dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center active:scale-95 transition cursor-pointer border border-white/20 dark:border-slate-700 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2]" />
              </button>
              <h1 className="text-[15px] font-bold text-slate-800 dark:text-white tracking-tight transition-colors">{getPageTitle()}</h1>
            </div>
          )}
        </div>

        {/* 3. Page Content */}
        <div className="flex-1 px-4 md:px-4 flex flex-col">
          {children}
        </div>

        {/* 4. Mobile floating "+" action button (Only in list view) (No-print) */}
        {pathname === '/' && viewState === 'list' && (
          <button
            onClick={() => setViewState('create')}
            className="md:hidden fixed bottom-28 right-6 z-40 bg-white dark:bg-[#1A1A1A] text-[#FF4040] dark:text-[#E05058] rounded-full p-4 shadow-sm hover:scale-[1.05] active:scale-[0.95] transition cursor-pointer flex items-center justify-center w-[52px] h-[52px] border border-transparent dark:border-slate-800"
          >
            <Plus className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}

        {/* 5. Mobile Bottom Navigation Bar (No-print) */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40 bg-[#1A1A1A] text-[#808080] rounded-[32px] px-6 py-4 flex items-center justify-between shadow-2xl no-print">
          
          <button 
            onClick={() => router.push('/home')}
            className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${isHomeActive ? 'text-white' : 'text-[#808080] hover:text-slate-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          <button 
            onClick={() => {
              setViewState('list');
              router.push('/');
            }}
            className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${isAssignmentsActive || isCreateActive ? 'text-white' : 'text-[#808080] hover:text-slate-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <mask id="archive-mask">
                <rect width="24" height="24" fill="white" />
                <rect x="6" y="9" width="12" height="2.5" fill="black" rx="0.5" />
                <rect x="13" y="15" width="4.5" height="2.5" fill="black" rx="0.5" />
              </mask>
              <rect x="4" y="3" width="16" height="18" rx="4" fill="currentColor" mask="url(#archive-mask)" />
            </svg>
            <span className="text-[10px] font-bold">Assignments</span>
          </button>

          <button 
            onClick={() => router.push('/library')}
            className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${isLibraryActive ? 'text-white' : 'text-[#808080] hover:text-slate-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="17" x2="12" y2="11" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <span className="text-[10px] font-semibold">Library</span>
          </button>

          <button 
            onClick={() => router.push('/toolkit')}
            className={`flex flex-col items-center gap-1.5 transition cursor-pointer ${isToolkitActive ? 'text-white' : 'text-[#808080] hover:text-slate-300'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 2 L11.5 7.5 L17 9 L11.5 10.5 L10 16 L8.5 10.5 L3 9 L8.5 7.5 Z" />
              <path d="M18 13 L18.5 15.5 L21 16 L18.5 16.5 L18 19 L17.5 16.5 L15 16 L17.5 15.5 Z" />
            </svg>
            <span className="text-[10px] font-semibold">AI Toolkit</span>
          </button>

        </div>

      </main>

      {/* Toast Notification (No-print) */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 animate-float bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-2xl px-5 py-3 shadow-lg flex items-center gap-2.5 max-w-sm transition-all duration-300 no-print">
          <div className={`w-2 h-2 rounded-full ${toastMessage.toLowerCase().includes('success') ? 'bg-[#10B981]' : 'bg-[#E05058]'} shrink-0 animate-pulse`}></div>
          <span className="text-xs font-bold tracking-tight">{toastMessage}</span>
        </div>
      )}

      {/* Global "Still Building" Modal */}
      {buildingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl transition-colors text-center">
            <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-colors">
              <Sparkles className="w-8 h-8 text-[#E05058]" />
            </div>
            <h3 className="text-xl font-black font-outfit text-brand-dark dark:text-white mb-2 transition-colors">
              Still Building
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 transition-colors">
              We're currently working hard on this feature. Check back soon!
            </p>
            <button
              onClick={() => setBuildingModalOpen(false)}
              className="w-full px-5 py-3 rounded-full text-xs font-bold text-white bg-[#E05058] hover:bg-red-600 shadow-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
