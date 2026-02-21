'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoom } from '@/lib/draftRoom';

export default function CreateRoomPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Please enter a display name.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Display name must be 20 characters or less.');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await createRoom(trimmed);

    if ('error' in result) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // Store participant info in sessionStorage for the room page
    sessionStorage.setItem('draftRoom_participantId', result.participantId);
    sessionStorage.setItem('draftRoom_displayName', trimmed);

    // Navigate to the room lobby
    router.push(`/online/room/${result.roomState.inviteCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full animate-fadeIn">
        <button
          onClick={() => router.push('/#/draftsim')}
          className="mb-8 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all group flex items-center gap-2"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">Back</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">➕</span>
          </div>
          <h1 className="text-3xl font-black font-oswald text-white uppercase tracking-tight mb-2">
            Create Draft <span className="text-emerald-500">Room</span>
          </h1>
          <p className="text-slate-500 text-sm">
            Enter your display name to create a new multiplayer draft room.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <p className="text-[10px] text-slate-600 mt-1 text-right">
              {displayName.length}/20
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={isLoading || !displayName.trim()}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black font-oswald text-lg uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              'Create Room'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
