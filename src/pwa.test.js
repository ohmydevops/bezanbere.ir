import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import manifest from './public/manifest.json'

const swSource = readFileSync(resolve(__dirname, 'public/sw.js'), 'utf-8')

// ─── manifest.json ───────────────────────────────────────────────────────────

describe('manifest.json — required PWA fields', () => {
  it('has a name', () => {
    expect(typeof manifest.name).toBe('string')
    expect(manifest.name.length).toBeGreaterThan(0)
  })

  it('has a short_name', () => {
    expect(typeof manifest.short_name).toBe('string')
    expect(manifest.short_name.length).toBeGreaterThan(0)
  })

  it('start_url is "/"', () => {
    expect(manifest.start_url).toBe('/')
  })

  it('display is "standalone"', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('lang is "fa"', () => {
    expect(manifest.lang).toBe('fa')
  })

  it('dir is "rtl"', () => {
    expect(manifest.dir).toBe('rtl')
  })

  it('has background_color and theme_color', () => {
    expect(manifest.background_color).toBeTruthy()
    expect(manifest.theme_color).toBeTruthy()
  })
})

describe('manifest.json — icons', () => {
  it('has at least two icons', () => {
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  it('includes a 192x192 icon', () => {
    const icon = manifest.icons.find(i => i.sizes === '192x192')
    expect(icon).toBeDefined()
    expect(icon.type).toBe('image/png')
    expect(icon.src).toContain('192')
  })

  it('includes a 512x512 icon', () => {
    const icon = manifest.icons.find(i => i.sizes === '512x512')
    expect(icon).toBeDefined()
    expect(icon.type).toBe('image/png')
    expect(icon.src).toContain('512')
  })

  it('all icons ha`ve src, sizes, and type', () => {
    for (const icon of manifest.icons) {
      expect(icon.src).toBeTruthy()
      expect(icon.sizes).toBeTruthy()
      expect(icon.type).toBeTruthy()
    }
  })
})

// ─── sw.js ───────────────────────────────────────────────────────────────────

describe('sw.js — cache name', () => {
  it('defines a CACHE_NAME starting with "bezanbere-"', () => {
    expect(swSource).toMatch(/const CACHE_NAME\s*=\s*['"]bezanbere-/)
  })

  it('CACHE_NAME includes a version suffix', () => {
    const match = swSource.match(/const CACHE_NAME\s*=\s*['"](.+)['"]/)
    expect(match).not.toBeNull()
    expect(match[1]).toMatch(/bezanbere-v\d+/)
  })
})

describe('sw.js — asset list', () => {
  it('pre-caches the root "/"', () => {
    expect(swSource).toContain("'/'")
  })

  it('pre-caches the Vazirmatn font', () => {
    expect(swSource).toContain('vazirmatn')
  })

  it('pre-caches icon-192.png', () => {
    expect(swSource).toContain('icon-192.png')
  })

  it('pre-caches icon-512.png', () => {
    expect(swSource).toContain('icon-512.png')
  })
})

describe('sw.js — lifecycle events', () => {
  it('listens for the install event', () => {
    expect(swSource).toContain("addEventListener('install'")
  })

  it('calls skipWaiting() during install', () => {
    expect(swSource).toContain('self.skipWaiting()')
  })

  it('listens for the activate event', () => {
    expect(swSource).toContain("addEventListener('activate'")
  })

  it('calls clients.claim() during activate', () => {
    expect(swSource).toContain('self.clients.claim()')
  })

  it('listens for the fetch event', () => {
    expect(swSource).toContain("addEventListener('fetch'")
  })

  it('deletes old caches on activate', () => {
    expect(swSource).toContain('caches.delete')
  })
})

describe('sw.js — fetch strategy', () => {
  it('skips non-GET requests', () => {
    expect(swSource).toContain("request.method !== 'GET'")
  })

  it('skips /cdn-cgi/ requests', () => {
    expect(swSource).toContain('/cdn-cgi/')
  })

  it('uses cache-first strategy (checks cache before network)', () => {
    const cacheMatchIdx = swSource.indexOf('caches.match')
    const fetchIdx = swSource.indexOf('fetch(event.request)')
    expect(cacheMatchIdx).toBeGreaterThan(-1)
    expect(fetchIdx).toBeGreaterThan(cacheMatchIdx)
  })

  it('stores network responses back into the cache', () => {
    expect(swSource).toContain('cache.put(event.request')
  })
})
