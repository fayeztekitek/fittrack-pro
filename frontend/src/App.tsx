import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './pages/AuthPage';
import { useTranslation } from './i18n/useTranslation';
import { LogOut, User } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoading, user, checkAuth, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090910] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
            Loading FitTrack Pro...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#090910] flex flex-col items-center text-white px-4 relative overflow-hidden select-none">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-[430px] flex flex-col min-h-screen py-6 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase">
              FitTrack <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
              Sprint 1 Foundation
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 transition animate-fade-in"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition"
              title={t('profile.logout')}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Welcome Dashboard content */}
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md shadow-xl text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <User size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">
              Welcome, {user?.name}!
            </h2>
            <p className="text-slate-400 text-sm mb-6">{user?.email}</p>
            
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-slate-500 text-xs font-medium block">Weight</span>
                <span className="text-emerald-400 text-lg font-bold">{user?.profile?.weightKg} kg</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-slate-500 text-xs font-medium block">Step Goal</span>
                <span className="text-emerald-400 text-lg font-bold">{user?.profile?.stepGoal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-center">
            <h3 className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-wider">
              Sprint 1 Successful!
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Authentication API, user registration database constraints, and Docker deployment orchestrations are fully functional.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-auto pt-6">
          FitTrack Pro Enterprise v1.0.0 · Pair Programmed with Antigravity
        </p>
      </div>
    </div>
  );
}

export default App;
