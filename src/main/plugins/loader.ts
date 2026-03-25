import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import type { PluginManifest, RegisteredPlugin } from '../../shared/types'

const PLUGIN_DIR = join(homedir(), '.life-console', 'plugins')

// Also include plugins bundled with the app (dev plugins)
const DEV_PLUGIN_DIR = join(__dirname, '../../../../plugins')

// Track approved plugins in-memory (persisted to settings in a real impl)
export const approvedPlugins = new Set<string>()

function validateManifest(manifest: unknown): manifest is PluginManifest {
  if (!manifest || typeof manifest !== 'object') return false
  const m = manifest as Record<string, unknown>
  return (
    typeof m.name === 'string' &&
    typeof m.version === 'string' &&
    typeof m.display_name === 'string' &&
    typeof m.plugin_type === 'string' &&
    typeof m.entry === 'string' &&
    Array.isArray(m.permissions)
  )
}

function scanDir(dir: string): RegisteredPlugin[] {
  if (!existsSync(dir)) return []

  const plugins: RegisteredPlugin[] = []

  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const manifestPath = join(dir, entry.name, 'manifest.json')
      if (!existsSync(manifestPath)) continue

      try {
        const raw = JSON.parse(readFileSync(manifestPath, 'utf-8'))
        if (!validateManifest(raw)) {
          console.warn(`[plugins] Invalid manifest at ${manifestPath}, skipping`)
          continue
        }
        plugins.push({
          manifest: raw,
          pluginDir: join(dir, entry.name),
          approved: approvedPlugins.has(raw.name)
        })
      } catch (err) {
        console.warn(`[plugins] Failed to load manifest at ${manifestPath}:`, err)
      }
    }
  } catch (err) {
    console.warn(`[plugins] Failed to scan directory ${dir}:`, err)
  }

  return plugins
}

export function loadPlugins(): RegisteredPlugin[] {
  const userPlugins = scanDir(PLUGIN_DIR)
  const devPlugins = scanDir(DEV_PLUGIN_DIR)

  // Merge, user plugins override dev plugins with same name
  const map = new Map<string, RegisteredPlugin>()
  for (const p of [...devPlugins, ...userPlugins]) {
    map.set(p.manifest.name, { ...p, approved: approvedPlugins.has(p.manifest.name) })
  }

  return Array.from(map.values())
}

export function approvePlugin(name: string): void {
  approvedPlugins.add(name)
}

export function denyPlugin(name: string): void {
  approvedPlugins.delete(name)
}
