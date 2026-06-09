const GITHUB_API_BASE = 'https://api.github.com'

async function githubFetch(path, token, init = {}) {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      ...(init.headers || {}),
    },
  })

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `GitHub request failed: ${res.status}`)
  }
  return res
}

export async function getViewer(token) {
  const res = await githubFetch('/user', token)
  return res.json()
}

export async function getRepo({ owner, repo, token }) {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `GitHub request failed: ${res.status}`)
  }
  return res.json()
}

export async function createRepo({ name, token }) {
  const res = await githubFetch('/user/repos', token, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      private: true,
      auto_init: true,
      description: 'bezanbere.ir todo backup',
    }),
  })

  return res.json()
}

export async function getFile({ owner, repo, path, token }) {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
    },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `GitHub request failed: ${res.status}`)
  }
  return res.json()
}

export async function upsertFile({ owner, repo, path, token, content, sha }) {
  const res = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'Sync todos from bezanbere.ir',
      content,
      ...(sha ? { sha } : {}),
    }),
  })

  return res.json()
}
