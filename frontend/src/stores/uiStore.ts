import { create } from 'zustand';
import type { Language } from '../i18n/translations';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  language: Language;
  activeTab: string;
  toasts: Toast[];
  setLanguage: (lang: Language) => void;
  setActiveTab: (tab: string) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => {
  const savedLang = (localStorage.getItem('ft_language') as Language) || 'fr';

  let toastCounter = 0;

  return {
    language: savedLang,
    activeTab: 'dashboard',
    toasts: [],

    setLanguage: (lang) => {
      localStorage.setItem('ft_language', lang);
      set({ language: lang });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    addToast: (type, message) => {
      toastCounter++;
      const id = `toast-${toastCounter}-${Date.now()}`;
      set((state) => ({
        toasts: [...state.toasts, { id, type, message }],
      }));
    },

    removeToast: (id) =>
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
  };
});
