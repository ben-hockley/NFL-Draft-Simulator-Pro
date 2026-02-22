'use client';

import React from 'react';
import { DraftParticipant } from '../types';
import { PARTICIPANT_COLORS } from '../lib/draftRoom';

interface OnTheClockBannerProps {
  participant: DraftParticipant | null;
  isLocalUser: boolean;
}

export const OnTheClockBanner: React.FC<OnTheClockBannerProps> = ({
  participant,
  isLocalUser,
}) => {
  if (!participant) return null;

  const color = PARTICIPANT_COLORS[participant.colorSlot] || '#3B82F6';

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center gap-2 text-sm lg:text-base font-bold uppercase tracking-wider animate-pulse"
      style={{ backgroundColor: `${color}20`, borderBottom: `2px solid ${color}` }}
    >
      <span style={{ color }}>
        {isLocalUser ? 'You are on the clock! ⏰' : `${participant.displayName} is on the clock ⏰`}
      </span>
    </div>
  );
};
