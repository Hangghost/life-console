import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { Axiom, AxiomFrontmatter, Methodology, MethodologyFrontmatter } from '../../shared/types'
import { parseFrontmatter } from '../knowledge/reader'

export function getAgentLayerDir(): string {
  return join(app.getPath('userData'), 'agent')
}

export function readAllAxioms(category?: string): Axiom[] {
  const axiomsDir = join(getAgentLayerDir(), 'axioms')
  if (!existsSync(axiomsDir)) return []

  const axioms: Axiom[] = []
  let entries
  try {
    entries = readdirSync(axiomsDir, { withFileTypes: true })
  } catch {
    return []
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const filePath = join(axiomsDir, entry.name)
    try {
      const raw = readFileSync(filePath, 'utf-8')
      const { frontmatter, body } = parseFrontmatter(raw)
      const fm = frontmatter as unknown as AxiomFrontmatter
      if (category && fm.category !== category) continue
      axioms.push({ frontmatter: fm, content: body.trim(), filePath })
    } catch {
      // skip
    }
  }

  return axioms.sort((a, b) => (a.frontmatter.id ?? '').localeCompare(b.frontmatter.id ?? ''))
}

export function readAllMethodologies(): Methodology[] {
  const methodsDir = join(getAgentLayerDir(), 'methodologies')
  if (!existsSync(methodsDir)) return []

  const methodologies: Methodology[] = []
  let entries
  try {
    entries = readdirSync(methodsDir, { withFileTypes: true })
  } catch {
    return []
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const filePath = join(methodsDir, entry.name)
    try {
      const raw = readFileSync(filePath, 'utf-8')
      const { frontmatter, body } = parseFrontmatter(raw)
      methodologies.push({
        frontmatter: frontmatter as unknown as MethodologyFrontmatter,
        content: body.trim(),
        filePath
      })
    } catch {
      // skip
    }
  }

  return methodologies
}

export function findMethodologyByTopic(topic: string): Methodology | null {
  const methodologies = readAllMethodologies()
  if (!methodologies.length) return null

  const topicLower = topic.toLowerCase()
  const scored = methodologies
    .map((m) => {
      const haystack = [
        m.frontmatter.title ?? '',
        ...(m.frontmatter.applicable_to ?? []),
        m.content
      ]
        .join(' ')
        .toLowerCase()
      const score = topicLower.split(/\s+/).filter((t) => haystack.includes(t)).length
      return { m, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.length > 0 ? scored[0].m : null
}

export function getAllAgentLayerContent(): string {
  const axioms = readAllAxioms()
  const methodologies = readAllMethodologies()

  const parts: string[] = ['# Agent Layer Context\n']

  if (axioms.length > 0) {
    parts.push('## Axioms\n')
    for (const axiom of axioms) {
      parts.push(`### ${axiom.frontmatter.title ?? axiom.frontmatter.id}\n`)
      parts.push(axiom.content)
      parts.push('')
    }
  }

  if (methodologies.length > 0) {
    parts.push('## Methodologies\n')
    for (const m of methodologies) {
      parts.push(`### ${m.frontmatter.title ?? m.frontmatter.id}\n`)
      parts.push(m.content)
      parts.push('')
    }
  }

  return parts.join('\n')
}
