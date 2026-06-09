const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token'

function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin,
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  })
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*'
    if (request.method === 'OPTIONS') return jsonResponse({ ok: true }, 200, origin)
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, origin)

    const url = new URL(request.url)
    if (url.pathname !== '/oauth/github') {
      return jsonResponse({ error: 'Not found' }, 404, origin)
    }

    let body = null
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400, origin)
    }

    const code = body?.code
    const verifier = body?.verifier
    if (!code || !verifier) {
      return jsonResponse({ error: 'Missing code or verifier' }, 400, origin)
    }

    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID || '',
      client_secret: env.GITHUB_CLIENT_SECRET || '',
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      redirect_uri: env.GITHUB_REDIRECT_URI || '',
    })

    const response = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: { accept: 'application/json' },
      body: params,
    })

    if (!response.ok) {
      const message = await response.text()
      return jsonResponse({ error: message || 'Token exchange failed' }, 400, origin)
    }

    const data = await response.json()
    if (!data.access_token) {
      return jsonResponse({ error: 'Token missing from response' }, 400, origin)
    }

    return jsonResponse({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
    }, 200, origin)
  },
}
