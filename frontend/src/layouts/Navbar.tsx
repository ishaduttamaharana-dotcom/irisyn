import { Bell, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-7 w-7 object-contain md:hidden" />
        <h1 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span className="text-purple-600 dark:text-purple-400 font-extrabold tracking-wide">IRISYN</span>
          <span className="hidden sm:inline text-slate-400 font-normal">|</span>
          <span className="hidden sm:inline text-slate-600 dark:text-slate-300 font-medium">AI-Powered Autonomous Data Center Digital Twin</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name?.slice(0, 2).toUpperCase() ?? 'US'}
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-slate-700 dark:text-slate-200 leading-none">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-slate-400">{user?.role ?? 'VIEWER'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
