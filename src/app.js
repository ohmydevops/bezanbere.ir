import Alpine from 'alpinejs'
import strings from './strings.json'
import {
  STORAGE_KEY,
  DEFAULT_TASK_LIMIT,
  MAX_TASK_LIMIT,
  THEME_MODE_KEY,
  TASK_LIMIT_KEY,
  TASK_CHAR_LIMIT,
  HISTORY_PAGE_SIZE,
  loadTasks,
  saveTasks,
  loadThemeMode,
  loadTaskLimit,
  clampTaskLimit,
  toFaNumber,
  toShamsiDate,
  taskLimitMin,
  remainingCount,
  loadHistory,
  saveHistory,
  pruneOldHistory,
} from './utils.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
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
    history: [],
    historyModal: false,
    historyPage: 1,
    detail: false,
    detailTask: null,
    detailDraft: '',
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

      this.history = loadHistory()
      this.pruneHistory()
      setInterval(() => this.pruneHistory(), 5000)

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
      const THEME_MODES = ['light', 'dark', 'system']
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
      return taskLimitMin(this.tasks)
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
      return toFaNumber(value)
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
      if (!title || title.length > TASK_CHAR_LIMIT || this.tasks.length >= this.taskLimit) return
      this.tasks.push({ id: crypto.randomUUID(), title, createdAt: Date.now() })
      saveTasks(this.tasks)
      this.closeModal()
    },

    remainingCount() {
      return remainingCount(this.tasks, this.taskLimit)
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
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        this.history.push({ ...task, completedAt: Date.now() })
        saveHistory(this.history)
      }
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

    openDetail(task) {
      this.detailTask = task
      this.detailDraft = task.title
      this.detail = true
      setTimeout(() => document.getElementById('detail-title-input')?.focus(), 50)
    },

    closeDetail() {
      this.detail = false
      this.detailTask = null
      this.detailDraft = ''
    },

    saveDetail() {
      const title = this.detailDraft.trim()
      if (!title || title.length > TASK_CHAR_LIMIT || !this.detailTask) return
      const task = this.tasks.find(t => t.id === this.detailTask.id)
      if (task) {
        task.title = title
        saveTasks(this.tasks)
      }
      this.closeDetail()
    },

    toShamsiDate(ts) {
      return toShamsiDate(ts)
    },

    pruneHistory() {
      const pruned = pruneOldHistory(this.history)
      if (pruned.length !== this.history.length) {
        this.history = pruned
        saveHistory(this.history)
      }
    },

    openHistory() {
      this.historyPage = 1
      this.historyModal = true
    },

    closeHistory() {
      this.historyModal = false
    },

    historyTotalPages() {
      return Math.max(1, Math.ceil(this.history.length / HISTORY_PAGE_SIZE))
    },

    historyPageItems() {
      const reversed = [...this.history].reverse()
      const start = (this.historyPage - 1) * HISTORY_PAGE_SIZE
      return reversed.slice(start, start + HISTORY_PAGE_SIZE)
    },

    historyPrevPage() {
      if (this.historyPage > 1) this.historyPage--
    },

    historyNextPage() {
      if (this.historyPage < this.historyTotalPages()) this.historyPage++
    },
  })

Alpine.start()
