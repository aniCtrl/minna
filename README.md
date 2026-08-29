# Minna (みんな) — Movie Night Matcher

> **Catchline**: *Pick together. Watch together.*

Minna is a real-time collaborative web application designed to help groups of friends agree on a movie to watch. Inspired by the Japanese word **みんな** (*meaning "everyone" or "everybody"*), Minna enables friends to come together and pick a movie seamlessly. Styled with a nostalgic **Retro Desktop Cinema** design system, Minna combines classic OS window aesthetics with modern, real-time synchronization powered by Firebase Firestore and TMDB.

---

##  Features

### 1. Collaborative Rooms & Host Claiming
- **Real-time Synchronization**: Friends join via a 6-character room code. Member lists and room states update dynamically across all connected devices.
- **Match Mode Selection**: The host can choose how matches are computed:
  - **Everyone has to like it (Strict)**: Only movies liked by 100% of room members become matches.
  - **Most people have to like it (Majority)**: Movies liked by more than half (>50%) of the group become matches.
- **Host Claiming**: If the host leaves or goes idle, active members can claim the host role to manage the session.
- **Automatic Room Close Handling**: When a room is closed by the host, all connected participants on any screen are automatically redirected to the home page in real time.

### 2. Movie Search & Pool Building
- **TMDB API Search**: Search for movies by title with real-time pagination, release dates, runtimes, and genre tags.
- **Pool Constraints**: Add up to 10 movies to the shared pool (at least 1 movie required to start voting).
- **Designed Poster Placeholders**: Movies without available poster images render a soft teal, poster-shaped placeholder card matching the Minna.exe visual system.

### 3. Retro Swipe Voting
- **Outset Poster Cards**: Interactive movie cards that support intuitive drag/swipe gestures for voting.
- **Action Buttons**: Dedicated Thumbs Up/Down action buttons with responsive feedback for mouse and keyboard users.

### 4. Play Again & Multi-Round Support
- **Seamless Replay**: After results are displayed, host and members can click **"Select Movies Again"** to start another round without leaving the room.
- **Atomic State Reset**: Clears previous-round movie selections and votes in a single Firestore transaction while keeping members, roles, and the room code intact.

### 5. Accessibility & Retro UI
- **Keyboard Navigation**: Focus traversal using `Tab` and `Shift + Tab` with high-contrast retro focus rings.
- **Semantic Landmarks**: Screen wrappers use semantic HTML5 elements (`<main>`, `<header>`, etc.).
- **ARIA Live Regions**: Dynamic room additions, voting progress badges, and pool lists use `aria-live` polite regions to announce real-time updates.

---

##  Tech Stack
- **Framework**: Vite + React
- **Icons**: `lucide-react` Vector Icons
- **Styling**: Vanilla CSS (CSS variables, flexbox, grid, retro inset/outset borders)
- **Database**: Google Firebase Firestore (real-time listeners & batched writes)
- **Testing**: Vitest + Firebase Local Emulator Suite

---

##  Known Architectural Limitations

### Host-Claim Member Retention
When a room's host is claimed (via the `"Claim Host"` action), the room document updates its `hostUid` field to the claimant's UID. However, the old host's `members/{oldHostUid}` subcollection document is kept in place.
- **Reason**: The security rule `allow update, delete: if false` on the `/members` subcollection is strictly configured to guarantee auditability of user memberships, preventing users from altering database records retroactively.
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
