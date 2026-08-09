import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login({ id: 'u-1', name: 'Isha', role: 'ADMIN' });
    navigate('/');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="card w-full max-w-sm p-6 text-center">
        <img src="/irisyn-logo.png" alt="IRISYN Logo" className="h-16 w-16 mx-auto mb-3 object-contain" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide">IRISYN Console</h1>
        <p className="mt-1 text-sm text-slate-500">Authentication is not implemented yet (Phase 2 scaffold).</p>
        <button
          onClick={handleLogin}
          className="mt-4 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Login;
