import { useUIStore } from '../../stores/uiStore';
import { useTranslation } from '../../i18n/useTranslation';
import {
  LayoutDashboard,
  Play,
  BarChart3,
  History,
  User,
} from 'lucide-react';

const tabs = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'track', icon: Play },
  { key: 'stats', icon: BarChart3 },
  { key: 'history', icon: History },
  { key: 'profile', icon: User },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useUIStore();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a14]/95 border-t border-slate-800 backdrop-blur-xl">
      <div className="max-w-[430px] mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
              activeTab === key
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon
              size={20}
              className={activeTab === key ? 'drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]' : ''}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t(`nav.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
