'use client';

import React from 'react';

interface ModeSelectScreenProps {
  onSoloDraft: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  onSoloDraft,
  onCreateRoom,
  onJoinRoom,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl w-full animate-fadeIn">
        <button
          onClick={onBack}
          className="mb-8 p-2 lg:p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all group flex items-center gap-2"
          title="Back to Home"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest">Home</span>
        </button>

        <h1 className="text-3xl lg:text-5xl font-black font-oswald text-white uppercase tracking-tighter mb-4">
          Choose Your <span className="text-emerald-500">Draft Mode</span>
        </h1>
        <p className="text-slate-400 text-sm lg:text-lg mb-10">
          Draft solo against the AI or create a multiplayer room to draft with friends.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Solo Draft */}
          <button
            onClick={onSoloDraft}
            className="group relative flex flex-col items-center gap-4 p-6 lg:p-8 bg-slate-900/60 border-2 border-slate-800 rounded-2xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <span className="text-3xl lg:text-4xl">🏟️</span>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black font-oswald text-white uppercase tracking-tight mb-1">
                Solo Draft
              </h3>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
                Draft against AI opponents. Full control over team selection and draft speed.
              </p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>

          {/* Create Draft Room */}
          <button
            onClick={onCreateRoom}
            className="group relative flex flex-col items-center gap-4 p-6 lg:p-8 bg-slate-900/60 border-2 border-slate-800 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <span className="text-3xl lg:text-4xl">➕</span>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black font-oswald text-white uppercase tracking-tight mb-1">
                Create Draft Room
              </h3>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
                Host a multiplayer draft room and invite up to 3 friends.
              </p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>

          {/* Join Draft Room */}
          <button
            onClick={onJoinRoom}
            className="group relative flex flex-col items-center gap-4 p-6 lg:p-8 bg-slate-900/60 border-2 border-slate-800 rounded-2xl hover:border-orange-500 hover:bg-orange-500/5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-orange-500/10 rounded-2xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <span className="text-3xl lg:text-4xl">🔗</span>
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-black font-oswald text-white uppercase tracking-tight mb-1">
                Join Draft Room
              </h3>
              <p className="text-xs lg:text-sm text-slate-500 leading-relaxed">
                Join a friend&apos;s draft room with an invite code.
              </p>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
