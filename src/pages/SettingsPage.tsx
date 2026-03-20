import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, userData, updateProfile } = useAuth();
  const [name, setName] = useState(userData?.name || '');
  const [avatar, setAvatar] = useState(userData?.avatar_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, avatar_url: avatar });
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <form onSubmit={handleSave} className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-50 shadow-2xl">
                <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <button type="button" className="absolute bottom-0 right-0 w-10 h-10 bg-[#7C3AED] text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <Camera size={20} />
              </button>
            </div>
            <div className="w-full">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Paste image URL here"
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 mt-2 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/20 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-gray-100 border-none rounded-2xl px-6 py-4 outline-none text-gray-400 cursor-not-allowed text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-5 bg-[#7C3AED] text-white rounded-[1.5rem] font-bold text-sm hover:bg-[#6D28D9] transition-all shadow-xl shadow-[#7C3AED]/20 disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
