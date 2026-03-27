import { existsSync, readdirSync, readFileSync } from 'fs'
import { join, relative } from 'path'
import type { KnowledgeCard, KnowledgeCardFrontmatter } from '../../shared/types'

// ─── Frontmatter parser (YAML subset) ────────────────────────────────────────

export function parseFrontmatter(fileContent: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: fileContent }

  const yamlStr = match[1]
  const body = match[2]
  const frontmatter: Record<string, unknown> = {}

  for (const line of yamlStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim()
    if (!key) continue

    if (val.startsWith('[') && val.endsWith(']')) {
      frontmatter[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (val !== '' && !isNaN(Number(val)) && !val.includes('-') || val.match(/^\d+$/)) {
      frontmatter[key] = Number(val)
    } else {
      frontmatter[key] = val
    }
  }

  return { frontmatter, body }
}

export function stringifyFrontmatter(fm: Record<string, unknown>): string {
  const lines = ['---']
  for (const [key, val] of Object.entries(fm)) {
    if (Array.isArray(val)) {
      lines.push(`${key}: [${(val as unknown[]).map(String).join(', ')}]`)
    } else {
      lines.push(`${key}: ${String(val ?? '')}`)
    }
  }
  lines.push('---')
  return lines.join('\n')
}

// ─── Reader ───────────────────────────────────────────────────────────────────

function readMarkdownFiles(dir: string, extensions = ['.md']): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []

  function scan(current: string): void {
    let entries
    try {
      entries = readdirSync(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = join(current, entry.name)
      if (entry.isDirectory()) {
        scan(fullPath)
      } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        results.push(fullPath)
      }
    }
  }

  scan(dir)
  return results
}

export function readAllKnowledgeCards(kbDirectory: string): KnowledgeCard[] {
  const cardsDir = join(kbDirectory, 'cards')
  const files = readMarkdownFiles(cardsDir)
  const cards: KnowledgeCard[] = []

  for (const filePath of files) {
    try {
      const raw = readFileSync(filePath, 'utf-8')
      const { frontmatter, body } = parseFrontmatter(raw)
      if (frontmatter.type !== 'KnowledgeCard') continue
      cards.push({
        frontmatter: frontmatter as unknown as KnowledgeCardFrontmatter,
        content: body.trim(),
        filePath
      })
    } catch {
      // skip malformed files
    }
  }

  return cards
}

export function readKnowledgeCard(filePath: string): KnowledgeCard | null {
  if (!existsSync(filePath)) return null
  try {
    const raw = readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(raw)
    return {
      frontmatter: frontmatter as unknown as KnowledgeCardFrontmatter,
      content: body.trim(),
      filePath
    }
  } catch {
    return null
  }
}

export function findCardById(kbDirectory: string, id: string): KnowledgeCard | null {
  const all = readAllKnowledgeCards(kbDirectory)
  return all.find((c) => c.frontmatter.id === id) ?? null
}

export function getRelativePath(kbDirectory: string, absolutePath: string): string {
  return relative(kbDirectory, absolutePath)
}
