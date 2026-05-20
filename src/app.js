import Alpine from 'alpinejs'
import strings from './strings.json'

const DB_NAME = 'bezanbere'
const STORE_NAME = 'tasks'
const MAX_TASKS = 5

// --- IndexedDB helpers ---

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

function dbGetAll(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = e => reject(e.target.error)
  })
}

function dbAdd(db, task) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).add(task)
    req.onsuccess = () => resolve()
    req.onerror = e => reject(e.target.error)
  })
}

function dbDelete(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = e => reject(e.target.error)
  })
}

// --- Alpine store ---

Alpine.store('app', {
    t: {},
    tasks: [],
    theme: 'light',
    modal: false,
    about: false,
    newTitle: '',
    completing: [],
    db: null,

    async init() {
      // Strings (bundled at build time)
      this.t = strings

      // Theme
      const saved = localStorage.getItem('theme')
      if (saved) {
        this.theme = saved
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.theme = 'dark'
      }
      this.applyTheme()

      // Storage
      try {
        this.db = await openDB()
        const tasks = await dbGetAll(this.db)
        this.tasks = tasks.sort((a, b) => a.createdAt - b.createdAt)
      } catch (e) {
        console.warn('IndexedDB unavailable — tasks will not persist', e)
      }
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

    async addTask() {
      const title = this.newTitle.trim()
      if (!title || this.tasks.length >= MAX_TASKS) return

      const task = {
        id: crypto.randomUUID(),
        title,
        createdAt: Date.now(),
      }

      if (this.db) await dbAdd(this.db, task)
      this.tasks.push(task)
      this.closeModal()
    },

    async deleteTask(id) {
      if (this.db) await dbDelete(this.db, id)
      this.tasks = this.tasks.filter(t => t.id !== id)
    },

    async completeTask(id) {
      // Phase 1: show strikethrough + fade out (500ms)
      this.completing = [...this.completing, id]
      await new Promise(r => setTimeout(r, 500))

      // Phase 2: remove from store and DB
      if (this.db) await dbDelete(this.db, id)
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.completing = this.completing.filter(i => i !== id)
    },
  })

Alpine.start()
