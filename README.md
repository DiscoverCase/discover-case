# DiscoverCase

## Project Overview

DiscoverCase is a lightweight, real-time game platform designed for CWRU Orientation Week. It enables group leaders (hosts) to create rooms, invite participants via a shareable room code, and facilitate interactive multiplayer games including CWRU-themed trivia and scavenger hunts. The platform emphasizes real-time synchronization, automatic content moderation via AI, and team-based scoring.

**Key Features:**
- User authentication and authorization
- Real-time multiplayer gameplay (Trivia & Scavenger Hunt)
- AI-powered image safety scanning (Google Gemini)
- Host-moderated review workflows
- Responsive web interface supporting desktop and mobile

[Live Deployment](https://discovercase.fly.dev/)


---

## Architecture Overview


## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend** | React | 18.3.1 |
| **Frontend Build** | Vite | 6.0.3 |
| **Frontend Routing** | React Router DOM | 7.13.0 |
| **Frontend Testing** | Vitest, React Testing Library | 1.0.4, 14.1.2 |
| **Real-time (Client)** | Socket.IO Client | 4.8.3 |
| **Backend Runtime** | Node.js | 22.21.1 |
| **Backend Framework** | Express | 4.21.0 |
| **Database** | PostgreSQL | 12+ |
| **Database Client** | pg (node-postgres) | 8.12.0 |
| **Real-time (Server)** | Socket.IO | 4.8.3 |
| **Authentication** | bcrypt | 6.0.0 |
| **CORS** | cors | 2.8.6 |
| **Environment Config** | dotenv | 16.4.5 |
| **Backend Testing** | Node built-in test runner | - |
| **Fuzz Testing** | fast-check | 4.3.0 |
| **External API** | Google Gemini Image Scanner | - |
| **Deployment** | Docker | - |

---

## Installation & Setup

### Prerequisites

- **Node.js** 22.21.1 or later
- **PostgreSQL** 12 or later (ensure `psql` is accessible from your PATH)
- **npm** 10+ or yarn
- Google Gemini API key (for image scanning feature)

### Step-by-Step Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/DiscoverCase/discover-case.git
cd party-server
```

#### 2. Environment Configuration

Create a `.env` file in the **backend/** directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Connection (option 1: full connection string)
DATABASE_URL=postgresql://username:password@localhost:5432/discovercase

# Database Configuration (option 2: individual parameters)
# These are used if DATABASE_URL is not set
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=discovercase

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

**Database Setup Notes:**
- Use `DATABASE_URL` for a complete PostgreSQL connection string, or individual `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` variables
- Default PostgreSQL port is `5432`
- Replace `your_postgres_password` with your actual PostgreSQL password
- Replace `postgres` with your PostgreSQL username if different

#### 3. Set Up the Database

Create a PostgreSQL database:

```bash
createdb discovercase
```

Run schema setup (if a migrations folder exists, follow those instructions; otherwise, the backend initializes tables on first run).

#### 4. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 5. Build the Frontend

```bash
cd frontend
npm run build
```

#### 6. Start the Application

**Development Mode (with auto-reload):**

```bash
cd backend
npm run dev
```

The application will be available at `http://localhost:8080`.

**Production Mode:**

```bash
cd backend
npm start
```

(The `start` script automatically builds the frontend and starts the server.)

---

## Usage Example

### User Journey: Hosting a Trivia Game

#### 1. **Host Setup**

- Host navigates to the login page and creates an account or logs in
- Host clicks **"Host a Game"** and selects **Trivia**
- System generates a unique **room code** (e.g., `ABC123`)
- Host shares the code with players via text, Slack, or email

#### 2. **Player Join**

- Player opens the app and logs in
- Player clicks **"Join a Game"** and enters the room code `ABC123`
- Player is added to the waiting room and sees other players joining in real-time
- Host can see the live roster update as players join

#### 3. **Start Game**

- Once all players are ready, host clicks **"Start Game"**
- Server broadcasts a trivia question to all connected players

#### 4. **Gameplay**

- Players see the question and four multiple-choice answers
- Each player selects an answer and submits it over WebSocket
- Backend validates answers against the correct answer in the database
- Host sees results in real-time (who answered correctly, points awarded)
- Leaderboard updates and broadcasts to all players
- Process repeats for the next question

#### 5. **Game End**

- After all questions, host declares the game over
- Final leaderboard is displayed
- Room is cleared and can be reused for a new game

### User Journey: Scavenger Hunt with Image Scanning

#### 1. **Setup**

- Host creates a scavenger hunt room and shares code
- Players join and see the list of challenges (e.g., "Find a CWRU mascot photo")

#### 2. **Challenge Submission**

- Player captures a photo matching the challenge
- Player uploads the photo (base64 encoded) via the app
- Backend receives the upload and initiates Gemini image scan

#### 3. **Automated Scan**

- **Scan succeeds:** Gemini validates the image matches the challenge prompt and is safe → submission auto-approved, team awarded points
- **Scan fails or unavailable (503):** Submission is queued for manual host review with the Gemini feedback message

#### 4. **Host Moderation (if needed)**

- Host reviews queued submissions in the moderation panel
- Host sees Gemini's analysis and the uploaded image
- Host approves → points awarded; or denies → no points

#### 5. **Leaderboard**

- Team score updates in real-time for all players
- Challenge contributions are idempotent (can't score twice for same challenge)

---

## Repository Structure

```
party-server/
├── README.md                          # This file
├── Dockerfile                         # Container image definition
├── fly.toml                           # Deployment configuration
├── package.json                       # Root package metadata
│
├── backend/                           # Node.js Express API + Socket.IO server
│   ├── package.json                   # Backend dependencies
│   ├── src/
│   │   ├── index.js                   # Server entry point, Express setup, Socket.IO init
│   │   ├── db.js                      # PostgreSQL connection and pooling
│   │   ├── roomStore.js               # In-memory state for active rooms
│   │   ├── rooms.js                   # Room (group) lifecycle management
│   │   ├── roomPersistence.js         # Database operations for rooms
│   │   ├── roomAssignments.js         # Player-to-room assignments
│   │   │
│   │   ├── routes/                    # Express route handlers
│   │   │   ├── api.js                 # Main API router
│   │   │   ├── auth.js                # Authentication endpoints (login, signup)
│   │   │   ├── groups.js              # Room/group CRUD operations
│   │   │   └── scavenger.js           # Scavenger hunt endpoints (upload, review)
│   │   │
│   │   ├── sockets/                   # Socket.IO event handlers
│   │   │   ├── socket.js              # Socket.IO server setup
│   │   │   └── handlers/
│   │   │       ├── gameHandlers.js    # Trivia question/answer events
│   │   │       ├── roomHandlers.js    # Join/leave/roster update events
│   │   │       └── moderationHandlers.js  # Moderation action events
│   │   │
│   │   ├── games/                     # Game logic
│   │   │   └── trivia.js              # Trivia game state and validation
│   │   │
│   │   ├── services/                  # External service integrations
│   │   │   └── geminiImageScanner.js  # Google Gemini API wrapper
│   │   │
│   │   ├── data/                      # Static game content
│   │   │   ├── questions.json         # Trivia questions database
│   │   │   └── scavengerChallenges.json # Scavenger challenges
│   │   │
│   │   └── tests/                     # Backend test suite
│   │       ├── auth/
│   │       │   └── authRoutes.test.js
│   │       ├── groups/
│   │       │   └── createGroup.test.js
│   │       ├── handlers/
│   │       │   └── gameHandlers.test.js
│   │       ├── scavenger/
│   │       │   └── scavengerHunt.test.js
│   │       └── fuzz/
│   │           └── keyEndpoints.fuzz.test.js
│   │
│   └── [node_modules, .env]           # Dependencies and environment secrets
│
├── frontend/                          # React + Vite SPA
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite build configuration
│   ├── vitest.config.js               # Vitest test configuration
│   │
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Root component
│   │   ├── App.css                    # Global styles
│   │   ├── index.css                  # Base styles
│   │   ├── api.js                     # REST API client (fetch wrapper)
│   │   ├── useSocket.jsx              # Custom hook for Socket.IO integration
│   │   │
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx     # Auth guard for protected pages
│   │   │   ├── Navbar.jsx             # Navigation header
│   │   │   ├── WelcomeBanner.jsx      # Landing page banner
│   │   │   │
│   │   │   ├── Dashboard/             # Main game dashboard
│   │   │   │   ├── dashboard.jsx      # Dashboard container
│   │   │   │   ├── HostGames.jsx      # Host game selection
│   │   │   │   ├── JoinGroup.jsx      # Player group join form
│   │   │   │   └── waiting-room.jsx   # Room lobby before game start
│   │   │   │
│   │   │   ├── games/
│   │   │   │   ├── GameSlot.jsx       # Game selection UI
│   │   │   │   ├── trivia/
│   │   │   │   │   ├── PlayTrivia.jsx       # Player trivia UI
│   │   │   │   │   ├── TriviaHostPanel.jsx # Host trivia control panel
│   │   │   │   │   └── useTriviaGame.js    # Trivia game state hook
│   │   │   │   └── scavenger/
│   │   │   │       ├── ScavengerHuntPlayer.jsx      # Player upload & submission
│   │   │   │       └── ScavengerHostPanel.jsx       # Host moderation UI
│   │   │   │
│   │   │   ├── login/                 # Authentication pages
│   │   │   │   └── Login.jsx
│   │   │   │
│   │   │   └── contexts/              # React context providers
│   │   │       └── AuthContext.jsx    # User authentication state
│   │   │
│   │   ├── tests/                     # Frontend test suite
│   │   │   └── components/
│   │   │       ├── login.test.jsx
│   │   │       ├── dashboard.test.jsx
│   │   │       └── joinGroup.test.jsx
│   │   │
│   │   ├── dist/                      # Built frontend (generated by `npm run build`)
│   │   └── [node_modules]
│   │
│   └── public/                        # Static assets
│
└── [Docker artifacts, git metadata]
```

---

## Team Member Roles & Contributions

**Lauren Lee**
- Trivia game host and player UI integration
- Socket.IO event handler testing
- Backend test suite development

**Ashley Chen**
- Frontend component development (logout, game selection, dashboard)
- Frontend mock object testing
- UI/UX implementation

**Andrew Ke**
- Backend testing and quality assurance
- Scavenger hunt game implementation
- User authentication (login/registration)
- Room joining and group management features

**Kevin Huang**
- Frontend dashboard design and implementation
- Trivia game frontend components
- Frontend mock object testing
- Database integration with backend
- Web deployment and DevOps

---

## Lessons Learned & Retrospective

### What Went Well

1. **AI-Assisted Debugging**
   - LLM tools were invaluable in tracing runtime errors to root causes (e.g., pinpointing API key expiry vs. transient 503 failures in Gemini scanning)

2. **Fallback with Extenral APIs**
   - Treating external API failures (Gemini scanning) as best-effort, rather than blocking operations, was the right call
   - Degrading gracefully to manual host review allowed the platform to stay operational even when external services experienced high load

3. **Monorepo Simplicity**
   - Co-locating frontend and backend reduced context switching and made full-stack changes easier to reason about and test

### What Could Be Improved

1. **In-Memory State Limitations**
   - Scavenger team state is currently stored in-memory, causing loss on server restart
   - **Future work:** Migrate storage to the Postgres database to persist states

2. **Socket.IO Messaging Architecture**
   - Socket events and handlers grew organically without a formalized messaging protocol
   - Event naming and payload structures lack consistent documentation
   - **Future improvements:**
     - Establish a schema-based event protocol (e.g., JSON Schema)
     - Standardize event naming conventions and payload shapes
     - Auto-generate client type stubs from server event definitions
     - Create a Socket.IO event registry/documentation

3. **AI Prompt Specificity**
   - Challenge prompts can be too specific for AI interpretation (e.g., AI struggles to reliably identify subjective qualities like "comfy")
   - **Future improvements:** 
     - Tune challenges to use more objective, verifiable criteria that AI can reliably assess
     - Consider hybrid scoring where subjective challenges default to manual host review
---

## Deployment

### Local Development

```bash
npm run dev --prefix backend
```

### Docker

```bash
docker build -t discovercase .
docker run -p 8080:8080 -e DATABASE_URL=<your_db> -e GEMINI_API_KEY=<your_key> discovercase
```

---