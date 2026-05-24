import { getViewer, getRepo, createRepo, getFile, upsertFile } from './github.js'

const FILE_PATH = 'todos/todos.json'

function encodeBase64(value) {
  return btoa(unescape(encodeURIComponent(value)))
}

export function buildTodoExport({ todos }) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    todos,
  }
}

export async function ensureRepo({ token, repoName }) {
  const viewer = await getViewer(token)
  const owner = viewer.login
  const repo = await getRepo({ owner, repo: repoName, token })
  if (repo) return { owner, repo }
  const created = await createRepo({ name: repoName, token })
  return { owner, repo: created }
}

export async function syncTodos({ token, repoName, todos }) {
  const { owner } = await getViewer(token)
  const repo = await getRepo({ owner, repo: repoName, token })
  if (!repo) {
    await createRepo({ name: repoName, token })
  }

  const payload = JSON.stringify(buildTodoExport({ todos }), null, 2)
  const encoded = encodeBase64(payload)
  const existing = await getFile({ owner, repo: repoName, path: FILE_PATH, token })
  const sha = existing?.sha

  return upsertFile({ owner, repo: repoName, path: FILE_PATH, token, content: encoded, sha })
}
