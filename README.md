# Minna — Movie Night Matcher

> **Catchline**: *Pick together. Watch together.*

Minna is a real-time collaborative web application designed to help groups of friends agree on a movie to watch. Styled with a nostalgic **Retro Desktop Cinema** design system, Minna mimics classic OS window widgets while delivering modern, real-time synchronization using Firebase Firestore and TMDB.

---

##  Features

### 1. Collaborative Rooms & Host Claiming
- **Real-time Synchronization**: Friends can join a room via a 6-character room code. Members list updates dynamically on screen.
- **Match Mode Selection**: The host can choose how matches are computed:
  - **Everyone has to like it (Strict)**: Only movies liked by 100% of room members become matches.
  - **Most people have to like it (Majority)**: Movies liked by more than half (>50%) of the group become matches.
- **Host Claiming**: If the host leaves or goes idle, any active member can claim the host role to manage the voting session.

### 2. Movie Search & Pool Building
- **TMDB API Search**: Search for movies with title strings. Search lists show year, release metadata, and genres.
- **Pool Constraints**: Add up to 10 movies to the pool. A minimum of 5 movies is required to start voting.
- **Transaction Protections**: Search, load more, and add buttons display loaders and disable to prevent rapid double-clicks.

### 3. Retro Swipe Voting
- **Outset Poster Cards**: Scaled outset poster cards rotate and translate based on swipe movements.
- **Action Buttons**: Dedicated Thumbs Up/Down action buttons with responsive click offsets are available for a mouse-only or keyboard-only setup.

### 4. Accessibility & Hardening
- **Keyboard Navigation**: Continuous focus traversal using `Tab` and `Shift + Tab` with high-contrast outlines.
- **Semantic Landmarks**: Screen wrappers use semantic HTML5 elements (`<main>`, `<header>`, etc.) instead of generic divs.
- **ARIA Live Regions**: Dynamic room additions, voting progress badges, and pool lists use `aria-live` polite regions to announce real-time changes to screen readers.
- **Dialog Alerts**: Standard browser `alert()` popups are replaced with custom OS-styled nested window modal boxes (`Message.exe`) and backdrop overlays.
- **Closed Room Safeguards**: Stale routes immediately prompt a styled `"Room Closed"` message if the host terminates the session.

---

##  Tech Stack
- **Framework**: Vite + React
- **Icons**: `lucide-react` Vector Icons
- **Styling**: Vanilla CSS (CSS variables, flex boxes, outset/inset retro border-bevels)
- **Database**: Google Firebase Firestore (real-time listeners & batched writes)
- **Testing**: Vitest + Firebase Local Emulator Suite

---

##  Known Architectural Limitations

### Host-Claim Member Retention
When a room's host is claimed (via the `"Claim Host"` action), the room document updates its `hostUid` field to the claimant's UID. However, the old host's `members/{oldHostUid}` subcollection document is kept in place.
- **Reason**: The security rule `allow update, delete: if false` on the `/members` subcollection is strictly configured to guarantee audit-ability of user memberships, preventing users from altering database records retroactively.
- **Consequence**: The subcollection document remains for record keeping, but has no adverse effect on host validation as security rules validate the active room's `hostUid` dictionary against current actions.

---

##  Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Firebase CLI** (`npm install -g firebase-tools` for running emulator rules tests)

### 2. Environment Variables
Create a `.env` file in the root directory with your TMDB and Firebase configuration:
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Firestore Emulator (Required for Tests)
```bash
firebase emulators:start --only firestore
```

### 5. Run Tests
```bash
npm test
```

### 6. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.
