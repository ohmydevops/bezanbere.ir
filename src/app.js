import Alpine from 'alpinejs'
import strings from './strings.json'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const STORAGE_KEY = 'bezanbere-tasks'
const DEFAULT_TASK_LIMIT = 5
const MAX_TASK_LIMIT = 20
const THEME_MODES = ['light', 'dark', 'system']
const THEME_MODE_KEY = 'bezanbere-theme-mode'
const TASK_LIMIT_KEY = 'bezanbere-task-limit'

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function loadThemeMode() {
  const saved = localStorage.getItem(THEME_MODE_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved

  return 'system'
}

function loadTaskLimit() {
  const saved = Number.parseInt(localStorage.getItem(TASK_LIMIT_KEY) || '', 10)
  if (Number.isInteger(saved) && saved >= 1 && saved <= MAX_TASK_LIMIT) return saved
  return DEFAULT_TASK_LIMIT
}

function clampTaskLimit(value, minLimit = 1) {
  return Math.min(MAX_TASK_LIMIT, Math.max(minLimit, value))
}

Alpine.store('app', {
    t: strings,
    tasks: [],
    theme: 'light',
    themeMode: 'system',
    taskLimit: DEFAULT_TASK_LIMIT,
    taskLimitDraft: String(DEFAULT_TASK_LIMIT),
    modal: false,
    about: false,
    settings: false,
    newTitle: '',
    completing: [],
    installPrompt: null,
    systemThemeMedia: null,

    init() {
      this.themeMode = loadThemeMode()
      this.taskLimit = loadTaskLimit()
      this.systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
      this.theme = this.resolveTheme()
      this.applyTheme()

      this.tasks = loadTasks()
      this.commitTaskLimit(clampTaskLimit(this.taskLimit, this.taskLimitMin()))

      this.systemThemeMedia.addEventListener('change', () => {
        if (this.themeMode !== 'system') return
        this.theme = this.resolveTheme()
        this.applyTheme()
      })

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installPrompt = e
      })
      window.addEventListener('appinstalled', () => {
        this.installPrompt = null
      })
    },

    applyTheme() {
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },

    resolveTheme() {
      if (this.themeMode === 'system') {
        return this.systemThemeMedia?.matches ? 'dark' : 'light'
      }
      return this.themeMode
    },

    setThemeMode(mode) {
      if (!THEME_MODES.includes(mode)) return
      this.themeMode = mode
      localStorage.setItem(THEME_MODE_KEY, mode)
      this.theme = this.resolveTheme()
      this.applyTheme()
    },

    openSettings() {
      this.settings = true
      this.taskLimitDraft = String(this.taskLimit)
    },

    closeSettings() {
      this.settings = false
    },

    taskLimitMin() {
      return Math.max(1, Math.min(MAX_TASK_LIMIT, this.tasks.length))
    },

    taskLimitTitle() {
      return this.t.taskLimitSetting.replace('{max}', MAX_TASK_LIMIT)
    },

    setTaskLimit(value) {
      this.taskLimitDraft = String(value)
    },

    commitTaskLimit(value, inputEl = null) {
      this.taskLimit = value
      this.taskLimitDraft = String(value)
      localStorage.setItem(TASK_LIMIT_KEY, String(value))
      if (inputEl) inputEl.value = String(value)
    },

    applyTaskLimit(inputEl = null) {
      const parsed = Number.parseInt(String(this.taskLimitDraft), 10)
      if (!Number.isFinite(parsed)) {
        this.commitTaskLimit(this.taskLimit, inputEl)
        return
      }

      this.commitTaskLimit(clampTaskLimit(parsed, this.taskLimitMin()), inputEl)
    },

    toFaNumber(value) {
      return Number(value).toLocaleString('fa-IR')
    },

    emptySubtitle() {
      return this.t.emptySubtitle.replace('{count}', this.toFaNumber(this.taskLimit))
    },

    openModal() {
      this.newTitle = ''
      this.modal = true
      setTimeout(() => document.getElementById('task-input')?.focus(), 50)
    },

    closeModal() {
      this.modal = false
      this.newTitle = ''
    },

    addTask() {
      const title = this.newTitle.trim()
      if (!title || this.tasks.length >= this.taskLimit) return
      this.tasks.push({ id: crypto.randomUUID(), title, createdAt: Date.now() })
      saveTasks(this.tasks)
      this.closeModal()
    },

    remainingCount() {
      return Math.max(0, this.taskLimit - this.tasks.length)
    },

    remainingMessage() {
      const remain = this.remainingCount()
      if (remain === 1) return this.t.remainingOne
      return this.t.remainingMany.replace('{count}', this.toFaNumber(remain))
    },

    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      saveTasks(this.tasks)
    },

    async completeTask(id) {
      this.completing = [...this.completing, id]
      await new Promise(r => setTimeout(r, 500))
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.completing = this.completing.filter(i => i !== id)
      saveTasks(this.tasks)
    },

    async installApp() {
      if (!this.installPrompt) return
      this.installPrompt.prompt()
      await this.installPrompt.userChoice
      this.installPrompt = null
    },
  })

Alpine.start()
