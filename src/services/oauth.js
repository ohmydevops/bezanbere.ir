const PKCE_VERIFIER_KEY = 'bezanbere-pkce-verifier'
const PKCE_STATE_KEY = 'bezanbere-pkce-state'

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function randomString(length = 64) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => (b % 36).toString(36)).join('')
}

async function pkceChallenge(verifier) {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(hash)
}

function savePKCE(verifier, state) {
  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier)
  sessionStorage.setItem(PKCE_STATE_KEY, state)
}

function popPKCE() {
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)
  const state = sessionStorage.getItem(PKCE_STATE_KEY)
  sessionStorage.removeItem(PKCE_VERIFIER_KEY)
  sessionStorage.removeItem(PKCE_STATE_KEY)
  return { verifier, state }
}

export async function startGitHubOAuth({ clientId, redirectUri }) {
  const verifier = randomString(96)
  const state = randomString(24)
  const challenge = await pkceChallenge(verifier)
  savePKCE(verifier, state)

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo',
    response_type: 'code',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`
}

export function readOAuthCallbackParams() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')
  return { code, state, error }
}

export function clearOAuthCallbackParams() {
  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')
  url.searchParams.delete('error_description')
  window.history.replaceState({}, document.title, url.toString())
}

export async function exchangeGitHubToken({ endpoint, code, expectedState }) {
  const { verifier, state } = popPKCE()
  if (!verifier || !state || state !== expectedState) {
    throw new Error('OAuth state mismatch. Please try again.')
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, verifier }),
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || 'Token exchange failed.')
  }

  const payload = await res.json()
  return payload
}
