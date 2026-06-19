import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#090910] flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background radial gradient blobs for aesthetic glow */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <div className="w-full max-w-[430px] flex flex-col items-center z-10">
        {/* App Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-wider uppercase">
            FitTrack <span className="text-emerald-400 font-extrabold">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
            Enterprise Activity Analytics
          </p>
        </div>

        {/* Toggle between Forms */}
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};
