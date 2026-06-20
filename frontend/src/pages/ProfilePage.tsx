import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAchievementsQuery, useUpdateProfileMutation } from '../hooks';
import { useUIStore } from '../stores/uiStore';
import { BmiCard } from '../components/profile/BmiCard';
import { BodySliders } from '../components/profile/BodySliders';
import { GoalSlider } from '../components/profile/GoalSlider';
import { GenderToggle } from '../components/profile/GenderToggle';
import { AchievementGrid } from '../components/profile/AchievementGrid';
import { User, LogOut, Loader2, Save } from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { data: achievements = [] } = useAchievementsQuery();
  const updateProfile = useUpdateProfileMutation();
  const addToast = useUIStore((s) => s.addToast);

  const [weightKg, setWeightKg] = useState(user?.profile?.weightKg || 70);
  const [heightCm, setHeightCm] = useState(user?.profile?.heightCm || 170);
  const [age, setAge] = useState(user?.profile?.age || 30);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    user?.profile?.gender || 'male',
  );
  const [stepGoal, setStepGoal] = useState(user?.profile?.stepGoal || 10000);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDirty(true);
  }, [weightKg, heightCm, age, gender, stepGoal]);

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        weightKg,
        heightCm,
        age,
        gender,
        stepGoal,
      });
      setDirty(false);
      addToast('success', 'Profile saved successfully');
    } catch {
      addToast('error', 'Failed to save profile');
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-wider uppercase">
            Profile
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md text-center">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
          <User size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        {dirty && (
          <p className="text-xs text-amber-400 mt-1">Unsaved changes</p>
        )}
      </div>

      {/* BMI Card */}
      <BmiCard weightKg={weightKg} heightCm={heightCm} />

      {/* Body Data */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Body Data
        </h3>
        <BodySliders
          weightKg={weightKg}
          heightCm={heightCm}
          age={age}
          onWeightChange={setWeightKg}
          onHeightChange={setHeightCm}
          onAgeChange={setAge}
        />
      </div>

      {/* Gender */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Gender
        </h3>
        <GenderToggle value={gender} onChange={setGender} />
      </div>

      {/* Step Goal */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <GoalSlider value={stepGoal} onChange={setStepGoal} />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!dirty || updateProfile.isPending}
        className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800/30 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:cursor-not-allowed"
      >
        {updateProfile.isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}
        {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
      </button>

      {/* Achievements */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Achievements
        </h2>
        <AchievementGrid achievements={achievements} />
      </div>
    </div>
  );
}
