export const STORAGE_KEY = 'bezanbere-tasks'
export const DEFAULT_TASK_LIMIT = 5
export const MAX_TASK_LIMIT = 20
export const THEME_MODE_KEY = 'bezanbere-theme-mode'
export const TASK_LIMIT_KEY = 'bezanbere-task-limit'
export const GITHUB_TOKEN_KEY = 'bezanbere-github-token'
export const GITHUB_USER_KEY = 'bezanbere-github-user'
export const GITHUB_REPO_KEY = 'bezanbere-github-repo'
export const TASK_CHAR_LIMIT = 100
export const HISTORY_KEY = 'bezanbere-history'
export const HISTORY_MAX_MONTHS = 6
export const HISTORY_PAGE_SIZE = 5

export function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function loadThemeMode() {
  const saved = localStorage.getItem(THEME_MODE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

export function loadTaskLimit() {
  const saved = Number.parseInt(localStorage.getItem(TASK_LIMIT_KEY) || '', 10)
  if (Number.isInteger(saved) && saved >= 1 && saved <= MAX_TASK_LIMIT) return saved
  return DEFAULT_TASK_LIMIT
}

export function clampTaskLimit(value, minLimit = 1) {
  return Math.min(MAX_TASK_LIMIT, Math.max(minLimit, value))
}

export function toFaNumber(value) {
  return Number(value).toLocaleString('fa-IR')
}

export function toShamsiDate(ts) {
  return new Intl.DateTimeFormat('fa-IR', {
    calendar: 'persian',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

export function taskLimitMin(tasks) {
  return Math.max(1, Math.min(MAX_TASK_LIMIT, tasks.length))
}

export function remainingCount(tasks, taskLimit) {
  return Math.max(0, taskLimit - tasks.length)
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function loadSessionJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveSessionJSON(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function pruneOldHistory(history) {
  const cutoff = Date.now() - HISTORY_MAX_MONTHS * 30 * 24 * 60 * 60 * 1000
  return history.filter(h => h.createdAt >= cutoff)
}
