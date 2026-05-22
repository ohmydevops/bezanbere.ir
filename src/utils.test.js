import { describe, it, expect, beforeEach } from 'vitest'
import {
  clampTaskLimit,
  loadTasks,
  saveTasks,
  loadThemeMode,
  loadTaskLimit,
  toFaNumber,
  toShamsiDate,
  taskLimitMin,
  remainingCount,
  DEFAULT_TASK_LIMIT,
  MAX_TASK_LIMIT,
  TASK_CHAR_LIMIT,
  STORAGE_KEY,
  THEME_MODE_KEY,
  TASK_LIMIT_KEY,
} from './utils.js'

beforeEach(() => {
  localStorage.clear()
})

// ─── clampTaskLimit ──────────────────────────────────────────────────────────

describe('clampTaskLimit', () => {
  it('returns value as-is when within range', () => {
    expect(clampTaskLimit(5)).toBe(5)
    expect(clampTaskLimit(10, 3)).toBe(10)
  })

  it('clamps to MAX_TASK_LIMIT when value exceeds it', () => {
    expect(clampTaskLimit(99)).toBe(MAX_TASK_LIMIT)
    expect(clampTaskLimit(21)).toBe(MAX_TASK_LIMIT)
  })

  it('clamps to minLimit when value is below it', () => {
    expect(clampTaskLimit(0)).toBe(1)
    expect(clampTaskLimit(2, 5)).toBe(5)
  })

  it('defaults minLimit to 1', () => {
    expect(clampTaskLimit(-5)).toBe(1)
  })
})

// ─── loadTasks / saveTasks ───────────────────────────────────────────────────

describe('loadTasks', () => {
  it('returns empty array when nothing is stored', () => {
    expect(loadTasks()).toEqual([])
  })

  it('returns parsed tasks from localStorage', () => {
    const tasks = [{ id: '1', title: 'test', createdAt: 1000 }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    expect(loadTasks()).toEqual(tasks)
  })

  it('returns empty array when stored value is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    expect(loadTasks()).toEqual([])
  })
})

describe('saveTasks', () => {
  it('persists tasks to localStorage', () => {
    const tasks = [{ id: '1', title: 'buy milk', createdAt: 1000 }]
    saveTasks(tasks)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual(tasks)
  })

  it('round-trips through loadTasks', () => {
    const tasks = [
      { id: 'a', title: 'task one', createdAt: 1000 },
      { id: 'b', title: 'task two', createdAt: 2000 },
    ]
    saveTasks(tasks)
    expect(loadTasks()).toEqual(tasks)
  })
})

// ─── loadThemeMode ───────────────────────────────────────────────────────────

describe('loadThemeMode', () => {
  it('returns "system" when nothing is stored', () => {
    expect(loadThemeMode()).toBe('system')
  })

  it.each(['light', 'dark', 'system'])('returns "%s" when stored', (mode) => {
    localStorage.setItem(THEME_MODE_KEY, mode)
    expect(loadThemeMode()).toBe(mode)
  })

  it('returns "system" for an unknown stored value', () => {
    localStorage.setItem(THEME_MODE_KEY, 'rainbow')
    expect(loadThemeMode()).toBe('system')
  })
})

// ─── loadTaskLimit ───────────────────────────────────────────────────────────

describe('loadTaskLimit', () => {
  it('returns DEFAULT_TASK_LIMIT when nothing is stored', () => {
    expect(loadTaskLimit()).toBe(DEFAULT_TASK_LIMIT)
  })

  it('returns stored value when valid', () => {
    localStorage.setItem(TASK_LIMIT_KEY, '10')
    expect(loadTaskLimit()).toBe(10)
  })

  it('returns DEFAULT_TASK_LIMIT for a value above MAX', () => {
    localStorage.setItem(TASK_LIMIT_KEY, '99')
    expect(loadTaskLimit()).toBe(DEFAULT_TASK_LIMIT)
  })

  it('returns DEFAULT_TASK_LIMIT for a value below 1', () => {
    localStorage.setItem(TASK_LIMIT_KEY, '0')
    expect(loadTaskLimit()).toBe(DEFAULT_TASK_LIMIT)
  })

  it('returns DEFAULT_TASK_LIMIT for non-numeric stored value', () => {
    localStorage.setItem(TASK_LIMIT_KEY, 'abc')
    expect(loadTaskLimit()).toBe(DEFAULT_TASK_LIMIT)
  })
})

// ─── taskLimitMin ────────────────────────────────────────────────────────────

describe('taskLimitMin', () => {
  it('returns 1 when task list is empty', () => {
    expect(taskLimitMin([])).toBe(1)
  })

  it('returns task count when tasks exist', () => {
    const tasks = [{ id: '1' }, { id: '2' }, { id: '3' }]
    expect(taskLimitMin(tasks)).toBe(3)
  })

  it('caps at MAX_TASK_LIMIT', () => {
    const tasks = Array.from({ length: MAX_TASK_LIMIT + 5 }, (_, i) => ({ id: String(i) }))
    expect(taskLimitMin(tasks)).toBe(MAX_TASK_LIMIT)
  })
})

// ─── remainingCount ──────────────────────────────────────────────────────────

describe('remainingCount', () => {
  it('returns full limit when no tasks', () => {
    expect(remainingCount([], 5)).toBe(5)
  })

  it('returns correct remainder', () => {
    expect(remainingCount([{}, {}], 5)).toBe(3)
  })

  it('returns 0 when at limit', () => {
    expect(remainingCount([{}, {}, {}, {}, {}], 5)).toBe(0)
  })

  it('never returns negative', () => {
    expect(remainingCount([{}, {}, {}], 2)).toBe(0)
  })
})

// ─── toFaNumber ──────────────────────────────────────────────────────────────

describe('toFaNumber', () => {
  it('converts numbers to Persian numerals', () => {
    expect(toFaNumber(5)).toMatch(/[۵]/)
    expect(toFaNumber(0)).toMatch(/[۰]/)
  })
})

// ─── toShamsiDate ────────────────────────────────────────────────────────────

describe('toShamsiDate', () => {
  it('returns a non-empty string', () => {
    expect(toShamsiDate(Date.now())).toBeTruthy()
  })

  it('includes Persian numerals', () => {
    const result = toShamsiDate(Date.now())
    expect(result).toMatch(/[۰-۹]/)
  })

  it('formats a known timestamp correctly', () => {
    // 2024-03-20T12:00:00Z → 1 فروردین ۱۴۰۳
    const result = toShamsiDate(new Date('2024-03-20T12:00:00Z').getTime())
    expect(result).toContain('فروردین')
    expect(result).toContain('۱۴۰۳')
  })
})

// ─── TASK_CHAR_LIMIT ─────────────────────────────────────────────────────────

describe('TASK_CHAR_LIMIT', () => {
  it('is 100', () => {
    expect(TASK_CHAR_LIMIT).toBe(100)
  })

  it('title at exactly 100 chars is valid', () => {
    const title = 'a'.repeat(100)
    expect(title.length > TASK_CHAR_LIMIT).toBe(false)
  })

  it('title at 101 chars is invalid', () => {
    const title = 'a'.repeat(101)
    expect(title.length > TASK_CHAR_LIMIT).toBe(true)
  })
})
