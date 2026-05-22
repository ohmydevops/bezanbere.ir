import Alpine from 'alpinejs'
import strings from './strings.json'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

const MAX_TASKS = 5
const STORAGE_KEY = 'bezanbere-tasks'

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

Alpine.store('app', {
    t: strings,
    tasks: [],
    theme: 'light',
    modal: false,
    about: false,
    newTitle: '',
    completing: [],
    installPrompt: null,

    init() {
      const saved = localStorage.getItem('theme')
      if (saved) {
        this.theme = saved
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.theme = 'dark'
      }
      this.applyTheme()
      this.tasks = loadTasks()
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

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
      this.applyTheme()
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
      if (!title || this.tasks.length >= MAX_TASKS) return
      this.tasks.push({ id: crypto.randomUUID(), title, createdAt: Date.now() })
      saveTasks(this.tasks)
      this.closeModal()
    },

    remainingCount() {
      return Math.max(0, MAX_TASKS - this.tasks.length)
    },

    remainingMessage() {
      const remain = this.remainingCount()
      if (remain === 1) return this.t.remainingOne
      return this.t.remainingMany.replace('{count}', remain.toLocaleString('fa-IR'))
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
