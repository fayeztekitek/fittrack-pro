import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const { t, language, setLanguage } = useTranslation();
  const { login, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setValidationError(t('auth.errorMinPassword'));
      return;
    }

    try {
      await login({ email, password });
    } catch (err) {
      // Error handled by store
    }
  };

  const handleDemoLogin = async () => {
    setValidationError('');
    try {
      await login({ email: 'demo@fit.com', password: 'demo123' });
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('auth.login')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t('auth.loginSub')}</p>
        </div>
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
        >
          {language === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            {t('auth.email')}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Mail size={18} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            {t('auth.password')}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Lock size={18} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error Notifications */}
        {(validationError || error) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {validationError || error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800/40 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {t('auth.login')}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Demo Account Shortcut */}
      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-slate-600 text-xs font-semibold uppercase tracking-wider">
          OR
        </span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <button
        onClick={handleDemoLogin}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-emerald-400 font-semibold rounded-xl transition flex items-center justify-center gap-2"
      >
        {t('auth.demoLogin')}
      </button>

      {/* Switch to Signup */}
      <p className="text-center text-slate-500 text-sm mt-6">
        {t('auth.noAccount')}{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-emerald-400 hover:underline font-semibold focus:outline-none"
        >
          {t('auth.signup')}
        </button>
      </p>
    </div>
  );
};
