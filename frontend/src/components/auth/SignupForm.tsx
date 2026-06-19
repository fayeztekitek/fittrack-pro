import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useTranslation } from '../../i18n/useTranslation';
import { User, Mail, Lock, Scale, Loader2, ArrowRight } from 'lucide-react';
import { Gender } from '../../users/entities/user-profile.entity';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { t, language, setLanguage } = useTranslation();
  const { register, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>(Gender.OTHER);
  const [stepGoal, setStepGoal] = useState(10000);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name || !email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setValidationError(t('auth.errorMinPassword'));
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        weightKg,
        heightCm,
        age,
        gender,
        stepGoal,
      });
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {t('auth.signup')}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{t('auth.signupSub')}</p>
        </div>
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition"
        >
          {language === 'fr' ? 'EN' : 'FR'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1.5">
            {t('auth.name')}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <User size={18} />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              placeholder="Fayez"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Address */}
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
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              placeholder="name@example.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
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
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Weight & Height Slider Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Weight */}
          <div>
            <div className="flex justify-between text-slate-300 text-xs font-medium mb-1.5">
              <span>{t('auth.weight')}</span>
              <span className="text-emerald-400 font-bold">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              disabled={isLoading}
            />
          </div>

          {/* Height */}
          <div>
            <div className="flex justify-between text-slate-300 text-xs font-medium mb-1.5">
              <span>{t('auth.height')}</span>
              <span className="text-emerald-400 font-bold">{heightCm} cm</span>
            </div>
            <input
              type="range"
              min="100"
              max="230"
              value={heightCm}
              onChange={(e) => setHeightCm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Age and Gender selectors */}
        <div className="grid grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <div className="flex justify-between text-slate-300 text-xs font-medium mb-1.5">
              <span>{t('auth.age')}</span>
              <span className="text-emerald-400 font-bold">{age} yrs</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              disabled={isLoading}
            />
          </div>

          {/* Gender */}
          <div>
            <span className="block text-slate-300 text-xs font-medium mb-1.5">
              {t('auth.gender')}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setGender(Gender.MALE)}
                className={`py-1 text-xs font-semibold rounded ${
                  gender === Gender.MALE
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                } transition`}
              >
                M
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.FEMALE)}
                className={`py-1 text-xs font-semibold rounded ${
                  gender === Gender.FEMALE
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                } transition`}
              >
                F
              </button>
              <button
                type="button"
                onClick={() => setGender(Gender.OTHER)}
                className={`py-1 text-xs font-semibold rounded ${
                  gender === Gender.OTHER
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                } transition`}
              >
                O
              </button>
            </div>
          </div>
        </div>

        {/* Step Goal Slider */}
        <div className="pt-2">
          <div className="flex justify-between text-slate-300 text-xs font-medium mb-1.5">
            <span>{t('auth.stepGoal')}</span>
            <span className="text-emerald-400 font-bold">{stepGoal.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="3000"
            max="20000"
            step="500"
            value={stepGoal}
            onChange={(e) => setStepGoal(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            disabled={isLoading}
          />
        </div>

        {/* Error notifications */}
        {(validationError || error) && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {validationError || error}
          </div>
        )}

        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800/40 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition text-sm"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {t('auth.signup')}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-slate-500 text-sm mt-6">
        {t('auth.haveAccount')}{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-emerald-400 hover:underline font-semibold focus:outline-none"
        >
          {t('auth.login')}
        </button>
      </p>
    </div>
  );
};
