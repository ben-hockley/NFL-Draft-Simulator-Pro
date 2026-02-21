<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/961ca947-a913-4831-b879-ddce660ce9df

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Multiplayer Online Draft Rooms

The app supports multiplayer draft rooms where up to 4 players can draft together in real time using Supabase Realtime.

### How It Works

1. **Start the app** locally with `npm run dev` and open `http://localhost:3000`.
2. From the home screen, click **"Draft Simulator"** to reach the **Mode Selection** screen.
3. Choose one of three modes:
   - **🏟️ Solo Draft** — the classic single-player draft experience (unchanged).
   - **➕ Create Draft Room** — host a new multiplayer room.
   - **🔗 Join Draft Room** — join an existing room via invite code.

### Creating a Room (Host)

1. Click **"Create Draft Room"** from the mode selection.
2. Enter your **display name** (max 20 characters) and click **"Create Room"**.
3. You'll be taken to the **Draft Room Lobby** which shows:
   - A **6-character invite code** — share this with friends. Click the copy button to copy it.
   - A **participants panel** showing who has joined (up to 4 players).
   - **Team selection** — pick the NFL team you want to draft for.
   - **Draft settings** — configure rounds and speed (host only).
4. Once at least one player has selected a team, click **"Start Draft"** to begin.

### Joining a Room

1. Click **"Join Draft Room"** from the mode selection.
2. Enter your **display name** and the **6-character invite code** from the host.
3. Click **"Join Room"** to enter the lobby.
4. Select your team and wait for the host to start the draft.

### During the Draft

- When it's your turn, the **"On the Clock"** banner highlights your name with your assigned color.
- Select a prospect from the big board to make your pick.
- AI automatically handles picks for teams not claimed by any participant.
- All picks are synced in real time across all participants via Supabase Realtime.

### Participant Colors

Each participant is assigned a unique color:
- Slot 1: 🔵 Blue (`#3B82F6`)
- Slot 2: 🔴 Red (`#EF4444`)
- Slot 3: 🟢 Green (`#22C55E`)
- Slot 4: 🟠 Orange (`#F97316`)

### Database Setup (Supabase)

The multiplayer feature requires two additional Supabase tables. Run the migration in `supabase/migrations/001_draft_rooms.sql` against your Supabase project to create:
- **`draft_rooms`** — stores room metadata, invite codes, and draft state.
- **`draft_participants`** — stores participant info (name, team selection, color slot).

Make sure **Supabase Realtime** is enabled for both tables (the migration handles this via `ALTER PUBLICATION`).
