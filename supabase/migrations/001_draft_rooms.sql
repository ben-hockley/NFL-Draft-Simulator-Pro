-- Migration: Create draft_rooms and draft_participants tables for multiplayer draft rooms

-- Create draft_participants table first (referenced by draft_rooms)
CREATE TABLE IF NOT EXISTS draft_participants (
  id UUID PRIMARY KEY,
  room_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  selected_team_id TEXT,
  color_slot INT NOT NULL CHECK (color_slot BETWEEN 1 AND 4),
  is_connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create draft_rooms table
CREATE TABLE IF NOT EXISTS draft_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  host_participant_id UUID REFERENCES draft_participants(id),
  draft_state JSONB,
  status TEXT NOT NULL DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'DRAFTING', 'COMPLETE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key from draft_participants to draft_rooms
ALTER TABLE draft_participants
  ADD CONSTRAINT fk_draft_participants_room
  FOREIGN KEY (room_id) REFERENCES draft_rooms(id) ON DELETE CASCADE;

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE draft_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE draft_participants;

-- Index for invite code lookups
CREATE INDEX IF NOT EXISTS idx_draft_rooms_invite_code ON draft_rooms(invite_code);

-- Index for room participant lookups
CREATE INDEX IF NOT EXISTS idx_draft_participants_room_id ON draft_participants(room_id);
