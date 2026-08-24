import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Menu, Bot, Sparkles, Search } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import UniversalCommandBar from '@/components/common/UniversalCommandBar';
import UserProfileMenu from '@/components/common/UserProfileMenu';

import SystemHealthHeader from '@/components/common/SystemHealthHeader';
import { useSystemInfo } from '@/hooks/usePlatformData';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: systemInfo, isLoading: isSystemLoading, isError: isSystemError } = useSystemInfo();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Left Branding & System Health Header */}
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-7 w-7 object-contain md:hidden" />
          <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-purple-600 dark:text-purple-400 font-extrabold tracking-wide">IRISYN</span>
          </h1>

          {/* System Info Header Badge */}
          <SystemHealthHeader systemInfo={systemInfo} isLoading={isSystemLoading} isError={isSystemError} />
        </div>


        {/* Center Universal Search Bar Trigger */}
        <div className="flex-1 max-w-md mx-2 lg:mx-4 min-w-[240px] hidden md:block">
          <button
            onClick={() => setIsCommandBarOpen(true)}
            className="w-full h-9 flex items-center justify-between px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 text-xs border border-slate-200 dark:border-slate-750 transition-all group"
          >
            <span className="flex items-center gap-2 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              <Search size={14} className="text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">Search IRISYN resources or enter command...</span>
            </span>
            <kbd className="shrink-0 ml-2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold border border-slate-300 dark:border-slate-700 whitespace-nowrap">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-sm group"
          >
            <Bot size={16} className="text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">AI Copilot</span>
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative text-slate-600 dark:text-slate-300" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
            <UserProfileMenu />
          </div>
        </div>
      </header>

      {/* Floating Drawers & Modals */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <UniversalCommandBar isOpen={isCommandBarOpen} onClose={() => setIsCommandBarOpen(false)} />
    </>
  );
};

export default Navbar;
