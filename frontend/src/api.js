/**
 * @fileoverview Frontend API client wrappers for backend REST endpoints.
 */

const API_BASE = ''

/**
 * Safely parses JSON from an HTTP response body.
 *
 * @param {Response} res - Fetch response object.
 * @returns {Promise<object | null>} Parsed payload or null for empty/invalid JSON.
 */
async function parseJson(res) {
  const text = await res.text()
  if (!text || text.trim() === '') return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Creates a host room.
 *
 * @param {{userId: string}} params - Room creation payload.
 * @returns {Promise<object>} API response payload.
 */
export async function createRoom({ userId }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }

  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to create room')
  return data
}

/**
 * Fetches groups owned by a host user.
 *
 * @param {string} userId - Host user id.
 * @returns {Promise<object>} Groups response payload.
 */
export async function getHostGroups(userId) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/host/groups?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }

  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to load host groups')
  return data
}

/**
 * Toggles lobby lock state for a host-owned group.
 *
 * @param {{groupCode: string, userId: string, isLocked: boolean}} params - Lock update payload.
 * @returns {Promise<object>} Updated group payload.
 */
export async function setGroupLock({ groupCode, userId, isLocked }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/groups/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupCode, userId, isLocked }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }

  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to update lobby lock')
  return data
}

/**
 * Joins a lobby by code for the current user.
 *
 * @param {{groupCode: string, userId: string}} params - Join request payload.
 * @returns {Promise<object>} Join response with group/member metadata.
 */
export async function joinGroup({ groupCode, userId }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupCode, userId }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to join group')
  return data
}

/**
 * Fetches groups that the player belongs to.
 *
 * @param {string} userId - Player user id.
 * @returns {Promise<object>} Groups response payload.
 */
export async function getPlayerGroups(userId) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/player/groups?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }

  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to load player groups')
  return data
}

/**
 * Creates a user account.
 *
 * @param {{username: string, email: string, password: string, role: (string|undefined)}} params - Registration payload.
 * @returns {Promise<object>} Created user payload.
 */
export async function createAccount({ username, email, password, role }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/createaccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Sign up failed')
  return data
}

/**
 * Logs in a user.
 *
 * @param {{username: string, password: string}} params - Login credentials.
 * @returns {Promise<object>} Auth response payload.
 */
export async function login({ username, password }) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Login failed')
  return data
}


/**
 * Fetches a random trivia question not in the seen list.
 *
 * @param {number[]} [seen=[]] - Question ids that were already shown.
 * @returns {Promise<object>} Trivia question payload.
 */
  export async function fetchQuestion(seen = []) {
    let res
    try {
      res = await fetch(`${API_BASE}/api/trivia/random?seen=${seen.join(',')}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err) {
      console.log('Fetch error:', err)
      throw new Error('Cannot reach server. Is the backend running on port 3000?')
    }
    const data = await parseJson(res)
    if (!res.ok) throw new Error(data?.error || 'Failed to fetch question')
    return data
  }

/**
 * Fetches scavenger challenge catalog.
 *
 * @returns {Promise<object>} Challenge categories and items.
 */
export async function getScavengerChallenges() {
  let res
  try {
    res = await fetch(`${API_BASE}/api/scavenger/challenges`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to load scavenger challenges')
  return data
}

/**
 * Fetches scavenger state for the currently joined group.
 *
 * @returns {Promise<object>} Group scavenger progress snapshot.
 */
export async function getScavengerState() {
  let res
  const groupCode = localStorage.getItem('joined_group_code') || localStorage.getItem('host_room_code')
  const qs = groupCode ? `?groupCode=${encodeURIComponent(groupCode)}` : ''
  try {
    res = await fetch(`${API_BASE}/api/scavenger/state${qs}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to load scavenger state')
  return data
}

/**
 * Sets scavenger team name for current group.
 *
 * @param {string} teamName - Team display name.
 * @returns {Promise<object>} Updated team metadata.
 */
export async function setScavengerTeamName(teamName) {
  let res
  const groupCode = localStorage.getItem('joined_group_code') || localStorage.getItem('host_room_code')
  const qs = groupCode ? `?groupCode=${encodeURIComponent(groupCode)}` : ''
  try {
    res = await fetch(`${API_BASE}/api/scavenger/team${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to save team name')
  return data
}

/**
 * Submits a scavenger photo evidence item.
 *
 * @param {{challengeId: string, imageData: string, playerName: (string|undefined)}} params - Submission payload.
 * @returns {Promise<object>} Submission result.
 */
export async function submitScavengerPhoto({ challengeId, imageData, playerName }) {
  let res
  const groupCode = localStorage.getItem('joined_group_code') || localStorage.getItem('host_room_code')
  const qs = groupCode ? `?groupCode=${encodeURIComponent(groupCode)}` : ''
  try {
    res = await fetch(`${API_BASE}/api/scavenger/submit${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, imageData, playerName }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to submit photo')
  return data
}

/**
 * Reviews a pending scavenger submission as host.
 *
 * @param {{submissionId: string, approved: boolean, comment: (string|undefined)}} params - Review payload.
 * @returns {Promise<object>} Updated submission and state.
 */
export async function reviewScavengerSubmission({ submissionId, approved, comment }) {
  let res
  const groupCode = localStorage.getItem('joined_group_code') || localStorage.getItem('host_room_code')
  const qs = groupCode ? `?groupCode=${encodeURIComponent(groupCode)}` : ''
  try {
    res = await fetch(`${API_BASE}/api/scavenger/review${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, approved, comment }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to review submission')
  return data
}

/**
 * Cancels a pending scavenger submission.
 *
 * @param {{submissionId: string}} params - Cancellation payload.
 * @returns {Promise<object>} Updated scavenger state.
 */
export async function cancelScavengerSubmission({ submissionId }) {
  let res
  const groupCode = localStorage.getItem('joined_group_code') || localStorage.getItem('host_room_code')
  const qs = groupCode ? `?groupCode=${encodeURIComponent(groupCode)}` : ''
  try {
    res = await fetch(`${API_BASE}/api/scavenger/cancel${qs}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    })
  } catch (err) {
    throw new Error('Cannot reach server. Is the backend running on port 3000?')
  }
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data?.error || 'Failed to cancel submission')
  return data
}