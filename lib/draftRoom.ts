import { supabase } from '../supabase';
import { DraftParticipant, OnlineRoomState, DraftState } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Participant color palette
export const PARTICIPANT_COLORS: Record<number, string> = {
  1: '#3B82F6', // blue
  2: '#EF4444', // red
  3: '#22C55E', // green
  4: '#F97316', // orange
};

/**
 * Generate a random 6-character alphanumeric invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a UUID v4 for participant IDs
 */
export function generateParticipantId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new draft room and return the room state
 */
export async function createRoom(
  displayName: string
): Promise<{ roomState: OnlineRoomState; participantId: string } | { error: string }> {
  const participantId = generateParticipantId();
  const inviteCode = generateInviteCode();
  const roomId = crypto.randomUUID();

  // Insert the room first (without host_participant_id to avoid FK issue)
  const { error: roomError } = await supabase
    .from('draft_rooms')
    .insert({
      id: roomId,
      invite_code: inviteCode,
      host_participant_id: null,
      draft_state: null,
      status: 'LOBBY',
    });

  if (roomError) {
    return { error: `Failed to create room: ${roomError.message}` };
  }

  // Insert the host participant
  const { error: participantError } = await supabase
    .from('draft_participants')
    .insert({
      id: participantId,
      room_id: roomId,
      display_name: displayName,
      selected_team_id: null,
      color_slot: 1,
      is_connected: true,
    });

  if (participantError) {
    return { error: `Failed to create participant: ${participantError.message}` };
  }

  // Update room with host_participant_id
  const { error: updateError } = await supabase
    .from('draft_rooms')
    .update({ host_participant_id: participantId })
    .eq('id', roomId);

  if (updateError) {
    return { error: `Failed to set host: ${updateError.message}` };
  }

  const roomState: OnlineRoomState = {
    roomId,
    inviteCode,
    participants: [
      {
        id: participantId,
        displayName,
        selectedTeamId: null,
        colorSlot: 1,
        isHost: true,
      },
    ],
    status: 'LOBBY',
  };

  return { roomState, participantId };
}

/**
 * Join an existing draft room by invite code
 */
export async function joinRoom(
  inviteCode: string,
  displayName: string
): Promise<{ roomState: OnlineRoomState; participantId: string } | { error: string }> {
  // Look up the room
  const { data: room, error: roomError } = await supabase
    .from('draft_rooms')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (roomError || !room) {
    return { error: 'Room not found. Please check your invite code.' };
  }

  if (room.status !== 'LOBBY') {
    return { error: 'This draft has already started.' };
  }

  // Get existing participants
  const { data: participants, error: participantsError } = await supabase
    .from('draft_participants')
    .select('*')
    .eq('room_id', room.id);

  if (participantsError) {
    return { error: 'Failed to load room participants.' };
  }

  if (participants && participants.length >= 4) {
    return { error: 'This room is full (4/4 participants).' };
  }

  // Determine next available color slot
  const usedSlots = (participants || []).map((p: { color_slot: number }) => p.color_slot);
  const availableSlot = ([1, 2, 3, 4] as const).find(s => !usedSlots.includes(s));
  if (!availableSlot) {
    return { error: 'No available slots in this room.' };
  }

  const participantId = generateParticipantId();

  const { error: insertError } = await supabase
    .from('draft_participants')
    .insert({
      id: participantId,
      room_id: room.id,
      display_name: displayName,
      selected_team_id: null,
      color_slot: availableSlot,
      is_connected: true,
    });

  if (insertError) {
    return { error: `Failed to join room: ${insertError.message}` };
  }

  // Fetch all participants again to build the state
  const { data: allParticipants } = await supabase
    .from('draft_participants')
    .select('*')
    .eq('room_id', room.id);

  const mappedParticipants: DraftParticipant[] = (allParticipants || []).map(
    (p: { id: string; display_name: string; selected_team_id: string | null; color_slot: number }) => ({
      id: p.id,
      displayName: p.display_name,
      selectedTeamId: p.selected_team_id,
      colorSlot: p.color_slot as 1 | 2 | 3 | 4,
      isHost: p.id === room.host_participant_id,
    })
  );

  const roomState: OnlineRoomState = {
    roomId: room.id,
    inviteCode: room.invite_code,
    participants: mappedParticipants,
    status: room.status as OnlineRoomState['status'],
  };

  return { roomState, participantId };
}

/**
 * Fetch room state by invite code
 */
export async function fetchRoomByInviteCode(
  inviteCode: string
): Promise<OnlineRoomState | null> {
  const { data: room } = await supabase
    .from('draft_rooms')
    .select('*')
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (!room) return null;

  const { data: participants } = await supabase
    .from('draft_participants')
    .select('*')
    .eq('room_id', room.id);

  const mappedParticipants: DraftParticipant[] = (participants || []).map(
    (p: { id: string; display_name: string; selected_team_id: string | null; color_slot: number }) => ({
      id: p.id,
      displayName: p.display_name,
      selectedTeamId: p.selected_team_id,
      colorSlot: p.color_slot as 1 | 2 | 3 | 4,
      isHost: p.id === room.host_participant_id,
    })
  );

  return {
    roomId: room.id,
    inviteCode: room.invite_code,
    participants: mappedParticipants,
    status: room.status as OnlineRoomState['status'],
  };
}

/**
 * Update a participant's selected team
 */
export async function updateSelectedTeam(
  participantId: string,
  teamId: string | null
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('draft_participants')
    .update({ selected_team_id: teamId })
    .eq('id', participantId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Update room status
 */
export async function updateRoomStatus(
  roomId: string,
  status: OnlineRoomState['status']
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('draft_rooms')
    .update({ status })
    .eq('id', roomId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Update the room draft state in the database
 */
export async function updateRoomDraftState(
  roomId: string,
  draftState: DraftState
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('draft_rooms')
    .update({ draft_state: draftState as unknown as Record<string, unknown> })
    .eq('id', roomId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Update host participant (for host promotion)
 */
export async function updateRoomHost(
  roomId: string,
  newHostId: string
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('draft_rooms')
    .update({ host_participant_id: newHostId })
    .eq('id', roomId);

  if (error) return { error: error.message };
  return {};
}

/**
 * Subscribe to realtime changes on a draft room and its participants.
 * Returns a channel that can be unsubscribed later.
 */
export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onParticipantChange: (participants: DraftParticipant[], hostId: string) => void;
    onRoomStatusChange: (status: OnlineRoomState['status'], draftState: DraftState | null) => void;
    onBroadcast: (event: string, payload: Record<string, unknown>) => void;
  }
): RealtimeChannel {
  const channel = supabase.channel(`room:${roomId}`);

  // Listen for participant changes via postgres_changes
  channel.on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'draft_participants',
      filter: `room_id=eq.${roomId}`,
    },
    async () => {
      // Refetch participants on any change
      const { data: participants } = await supabase
        .from('draft_participants')
        .select('*')
        .eq('room_id', roomId);

      const { data: room } = await supabase
        .from('draft_rooms')
        .select('host_participant_id')
        .eq('id', roomId)
        .single();

      const hostId = room?.host_participant_id || '';

      const mapped: DraftParticipant[] = (participants || []).map(
        (p: { id: string; display_name: string; selected_team_id: string | null; color_slot: number }) => ({
          id: p.id,
          displayName: p.display_name,
          selectedTeamId: p.selected_team_id,
          colorSlot: p.color_slot as 1 | 2 | 3 | 4,
          isHost: p.id === hostId,
        })
      );

      callbacks.onParticipantChange(mapped, hostId);
    }
  );

  // Listen for room status changes
  channel.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'draft_rooms',
      filter: `id=eq.${roomId}`,
    },
    (payload: { new: { status: string; draft_state: DraftState | null } }) => {
      callbacks.onRoomStatusChange(
        payload.new.status as OnlineRoomState['status'],
        payload.new.draft_state
      );
    }
  );

  // Listen for broadcast events (PICK_MADE, START_DRAFT, etc.)
  channel.on('broadcast', { event: 'PICK_MADE' }, (payload: { payload: Record<string, unknown> }) => {
    callbacks.onBroadcast('PICK_MADE', payload.payload);
  });

  channel.on('broadcast', { event: 'START_DRAFT' }, (payload: { payload: Record<string, unknown> }) => {
    callbacks.onBroadcast('START_DRAFT', payload.payload);
  });

  channel.on('broadcast', { event: 'HOST_CHANGED' }, (payload: { payload: Record<string, unknown> }) => {
    callbacks.onBroadcast('HOST_CHANGED', payload.payload);
  });

  channel.subscribe();

  return channel;
}

/**
 * Broadcast a pick made event to all room participants
 */
export function broadcastPick(
  channel: RealtimeChannel,
  payload: { pickNumber: number; playerId: string; participantId: string }
): void {
  channel.send({
    type: 'broadcast',
    event: 'PICK_MADE',
    payload,
  });
}

/**
 * Broadcast start draft event
 */
export function broadcastStartDraft(
  channel: RealtimeChannel,
  payload: { draftState: DraftState }
): void {
  channel.send({
    type: 'broadcast',
    event: 'START_DRAFT',
    payload: payload as unknown as Record<string, unknown>,
  });
}

/**
 * Broadcast host changed event
 */
export function broadcastHostChanged(
  channel: RealtimeChannel,
  payload: { newHostId: string }
): void {
  channel.send({
    type: 'broadcast',
    event: 'HOST_CHANGED',
    payload,
  });
}

/**
 * Unsubscribe from a room channel
 */
export function unsubscribeFromRoom(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

/**
 * Mark participant as disconnected
 */
export async function markDisconnected(participantId: string): Promise<void> {
  await supabase
    .from('draft_participants')
    .update({ is_connected: false })
    .eq('id', participantId);
}
