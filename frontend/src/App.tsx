import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { TrackingPage } from './pages/TrackingPage';
import { BottomNav } from './components/shared/BottomNav';
import { LogOut } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#090910] flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
          Loading FitTrack Pro...
        </p>
      </div>
    </div>
  );
}

function AppLayout() {
  const { user, logout } = useAuthStore();
  const { language, setLanguage } = useUIStore();
  const location = useLocation();

  // Exclude BottomNav from auth and track pages
  const showNav = !['/track'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#090910] flex flex-col items-center text-white px-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-[430px] flex flex-col min-h-screen py-6 z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase">
              FitTrack <span className="text-emerald-400">Pro</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
              {user?.name || 'Athlete'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setLanguage(language === 'fr' ? 'en' : 'fr')
              }
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 transition"
            >
              {language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Page Content */}
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/track" element={<TrackingPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-auto pt-6">
          FitTrack Pro Enterprise v1.0.0
        </p>
      </div>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
