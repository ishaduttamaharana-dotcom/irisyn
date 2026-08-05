import DashboardLayout from '@/layouts/DashboardLayout';
import { useTheme } from '@/context/ThemeProvider';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <DashboardLayout title="Settings" description="Application preferences">
      <div className="card p-4 flex items-center justify-between max-w-md">
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</p>
          <p className="text-xs text-slate-400">Currently: {theme}</p>
        </div>
        <button onClick={toggleTheme} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
          Toggle
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
