# Testing Documentation

This document provides a comprehensive guide to the DiscoverCase test suite, including test locations, coverage, execution instructions, and known limitations.

---

## Test Structure Overview

DiscoverCase uses a dual-tier testing approach:

- **Backend:** Node.js built-in test runner (`node --test`) with fuzz testing via `fast-check`
- **Frontend:** Vitest with React Testing Library for component and integration tests

```
party-server/
├── backend/tests/              # Backend test suite
│   ├── auth/                   # Authentication tests
│   ├── groups/                 # Room/group management tests
│   ├── handlers/               # Socket.IO event handler tests
│   ├── scavenger/              # Scavenger hunt feature tests
│   └── fuzz/                   # Property-based fuzz tests
│
└── frontend/src/tests/         # Frontend test suite
    └── components/             # React component tests
```

---

## Backend Testing

### Test Locations & Coverage

**Authentication Tests** (`backend/tests/auth/authRoutes.test.js`)
- Login endpoint validation (status codes, payload shapes)
- Account creation with password hashing
- Authentication state verification
- Mocked database and bcrypt for deterministic results

**Group/Room Tests** (`backend/tests/groups/createGroup.test.js`)
- Room creation with unique code generation
- Group code validation
- Room state initialization
- Stub-based database mocking

**Socket.IO Handler Tests** (`backend/tests/handlers/gameHandlers.test.js`)
- Trivia question distribution events
- Answer submission and validation
- Score calculation and leaderboard updates
- Event emission verification with fake socket objects

**Scavenger Hunt Tests** (`backend/tests/scavenger/scavengerHunt.test.js`)
- Image upload validation
- Submission state management (pending, approved, denied)
- Team scoring with idempotency checks
- Gemini scan integration mocking

**Property-Based Fuzz Tests** (`backend/tests/fuzz/keyEndpoints.fuzz.test.js`)
- Random input generation for critical endpoints
- Invariants: no 500 errors, valid JSON responses
- Timeout assertions for response latency
- Coverage for:
  - `POST /api/createaccount` — random email/password combinations
  - `POST /api/login` — malformed payloads
  - `POST /api/rooms` — boundary conditions
  - `POST /api/scavenger/submit` — oversized payloads

### Running Backend Tests

**Run all backend tests:**

```bash
cd backend
npm test
```

**Run tests with verbose output:**

```bash
cd backend
npm test -- --verbose
```

**Run a specific test file:**

```bash
cd backend
npm test -- tests/auth/authRoutes.test.js
```

### Test Telemetry (2026-04-07)

- **Result:** 51 passed, 0 failed
- **Duration:** ~2.1 seconds
- **Coverage:**
  - Auth routes: 8 tests
  - Group creation: 6 tests
  - Socket handlers: 15 tests
  - Scavenger hunt: 12 tests
  - Fuzz tests: 10 tests

### Backend Test Patterns

**Mocking Database:**

```javascript
const mockDb = {
  query: async (text, values) => {
    // Stubbed response
    return { rows: [...] };
  }
};
```

**Mocking Sockets:**

```javascript
const fakeSocket = {
  emit: (event, data) => emittedEvents.push({ event, data }),
  on: (event, handler) => { /* noop */ },
  join: (room) => { /* noop */ }
};
```

**Fuzz Testing with fast-check:**

```javascript
fc.assert(
  fc.property(fc.string(), fc.string(), (email, password) => {
    // Assert invariants hold for random inputs
    const response = sendRequest(email, password);
    assert(response.statusCode !== 500);
    assert(isValidJSON(response.body));
  })
);
```

---

## Frontend Testing

### Test Locations & Coverage

**Login Component Tests** (`frontend/src/tests/components/login.test.jsx`)
- User input handling (email, password)
- Form submission validation
- Authentication flow integration
- Error message display for invalid credentials

**Dashboard Component Tests** (`frontend/src/tests/components/dashboard.test.jsx`)
- Game selection UI rendering
- Host vs. player role differentiation
- Room creation button functionality
- Navigation state updates

**Group Join Tests** (`frontend/src/tests/components/joinGroup.test.jsx`)
- Room code input validation
- Join group API call mocking
- Waiting room entry after successful join
- Error handling for invalid codes
- Async effect handling (previously had `act(...)` warnings, now fixed)

### Running Frontend Tests

**Run all frontend tests:**

```bash
cd frontend
npm test
```

**Run tests in headless mode (CI):**

```bash
cd frontend
npm test -- --run
```

**Run tests with coverage:**

```bash
cd frontend
npm test -- --coverage
```

**Run a specific test file:**

```bash
cd frontend
npm test -- components/login.test.jsx
```

### Test Telemetry (2026-04-07)

- **Result:** 16 passed, 0 failed
- **Duration:** ~4.1 seconds
- **No React `act(...)` warnings** (previously observed in JoinGroup test, now resolved)
- **Coverage:**
  - Login component: 5 tests
  - Dashboard: 6 tests
  - Join group: 5 tests

### Frontend Test Patterns

**Mocking API Calls:**

```javascript
vi.mock('../api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ ok: true, data: {...} })
  }
}));
```

**Mocking Socket.IO:**

```javascript
vi.mock('../useSocket', () => ({
  useSocket: () => ({
    socket: { on: vi.fn(), emit: vi.fn() },
    isConnected: true
  })
}));
```

**Async Test Handling:**

```javascript
it('should join group and enter waiting room', async () => {
  render(<JoinGroup />);
  const input = screen.getByLabelText('Room Code');
  await userEvent.type(input, 'ABC123');
  await userEvent.click(screen.getByText('Join'));
  
  await waitFor(() => {
    expect(screen.getByText('Waiting Room')).toBeInTheDocument();
  });
});
```

---

## Test Quality & Strategy

### What Is Tested

- Authentication flows (login, registration)
- Room/group creation and management
- Trivia question distribution and answer validation
- Scavenger hunt submission and approval workflows
- Socket.IO real-time event emissions
- Input validation (fuzz tested for robustness)
- React component rendering and user interactions
- Gemini API integration (mocked; actual API calls not tested)
- Multi-instance deployment scenarios (single-process tests only)
- WebSocket reconnection edge cases
- Browser compatibility (tested in Node/jsdom environment)



### Test Execution Order

Tests are independent and can run in any order. No shared state persists between test runs.

**Execution flow:**
1. Each test file establishes its own mocked dependencies
2. Tests execute in isolation
3. Mock state is reset after each test
4. No database transactions committed during testing

---

## Running the Full Test Suite

### One-Command Full Suite

```bash
# From project root
cd backend && npm test && cd ../frontend && npm test
```

### Expected Output

**Backend:**
```
✓ tests/auth/authRoutes.test.js
✓ tests/groups/createGroup.test.js
✓ tests/handlers/gameHandlers.test.js
✓ tests/scavenger/scavengerHunt.test.js
✓ tests/fuzz/keyEndpoints.fuzz.test.js

51 passing (2115.37ms)
```

**Frontend:**
```
✓ login.test.jsx
✓ dashboard.test.jsx
✓ joinGroup.test.jsx

16 passing (4.08s)
```

---

## Important Limitations

### Backend Testing Limitations

1. **In-Memory State Only**
   - Tests do not exercise persistent storage beyond mocked responses
   - Real PostgreSQL transactions are not tested
   - State resets between tests (no cross-test data leakage)

2. **Mocked External APIs**
   - Gemini image scanning is stubbed (not called)
   - Actual API failures (timeouts, 403s) not tested against real service
   - Network behavior (latency, packet loss) not simulated

3. **No Load Testing**
   - Tests run with small payloads
   - Concurrent connection limits not validated
   - Memory/CPU usage under load not measured

### Frontend Testing Limitations

1. **Mocked Backend**
   - API responses are stubbed
   - Real network errors (404, 500) tested in limited scenarios
   - Latency and timeouts not simulated

2. **No Visual Regression Testing**
   - Component layout and styling not validated
   - CSS breakpoints and responsive design not tested
   - Cross-browser rendering differences not detected

3. **Limited Integration Testing**
   - Real Socket.IO connections not tested
   - Full authentication flows not end-to-end tested
   - Game state synchronization between components not fully validated
---
