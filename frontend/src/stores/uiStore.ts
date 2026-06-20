import { create } from 'zustand';
import type { Language } from '../i18n/translations';

interface UIState {
  language: Language;
  activeTab: string;
  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => {
  const savedLang = (localStorage.getItem('ft_language') as Language) || 'fr';
  
  return {
    language: savedLang,
    activeTab: 'dashboard',
    setLanguage: (lang) => {
      localStorage.setItem('ft_language', lang);
      set({ language: lang });
    },
    setActiveTab: (tab) => set({ activeTab: tab }),
  };
});
