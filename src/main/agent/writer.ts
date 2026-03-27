import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { WriteBackPayload } from '../../shared/types'
import { parseFrontmatter, stringifyFrontmatter } from '../knowledge/reader'
import { getAgentLayerDir, readAllAxioms } from './reader'

function isoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function generateAxiomId(): string {
  const axioms = readAllAxioms()
  const maxN = axioms
    .map((a) => {
      const m = a.frontmatter.id?.match(/^a(\d+)$/)
      return m ? Number(m[1]) : 0
    })
    .reduce((max, n) => Math.max(max, n), 0)
  return `a${String(maxN + 1).padStart(2, '0')}`
}

function generateMethodologyId(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .slice(0, 30)
}

export function writeNewAxiom(
  content: string,
  fm: Record<string, unknown>
): { filePath: string } {
  const agentDir = getAgentLayerDir()
  const axiomsDir = join(agentDir, 'axioms')
  mkdirSync(axiomsDir, { recursive: true })

  const id = (fm.id as string) ?? generateAxiomId()
  const now = isoDate()
  const fullFm = {
    id,
    title: (fm.title as string) ?? id,
    category: (fm.category as string) ?? 'values',
    created_at: now,
    last_updated: now
  }

  const filePath = join(axiomsDir, `${id}.md`)
  const fileContent = `${stringifyFrontmatter(fullFm)}\n\n${content}\n`
  writeFileSync(filePath, fileContent, 'utf-8')
  return { filePath }
}

export function updateAxiom(id: string, content: string, fm: Record<string, unknown>): { filePath: string } {
  const agentDir = getAgentLayerDir()
  const filePath = join(agentDir, 'axioms', `${id}.md`)

  if (!existsSync(filePath)) return writeNewAxiom(content, { ...fm, id })

  const raw = readFileSync(filePath, 'utf-8')
  const { frontmatter } = parseFrontmatter(raw)
  const existing = frontmatter as Record<string, unknown>

  const updatedFm = {
    ...existing,
    ...(fm.title ? { title: fm.title } : {}),
    ...(fm.category ? { category: fm.category } : {}),
    last_updated: isoDate()
  }

  const fileContent = `${stringifyFrontmatter(updatedFm)}\n\n${content}\n`
  writeFileSync(filePath, fileContent, 'utf-8')
  return { filePath }
}

export function writeNewMethodology(
  content: string,
  fm: Record<string, unknown>
): { filePath: string } {
  const agentDir = getAgentLayerDir()
  const methodsDir = join(agentDir, 'methodologies')
  mkdirSync(methodsDir, { recursive: true })

  const title = (fm.title as string) ?? 'untitled'
  const id = (fm.id as string) ?? generateMethodologyId(title)
  const now = isoDate()

  const fullFm = {
    id,
    title,
    applicable_to: (fm.applicable_to as string[]) ?? [],
    created_at: now,
    version: 1
  }

  const filePath = join(methodsDir, `${id}.md`)
  const fileContent = `${stringifyFrontmatter(fullFm as Record<string, unknown>)}\n\n${content}\n\n## Version History\n\n- v1 (${now}): Initial version\n`
  writeFileSync(filePath, fileContent, 'utf-8')
  return { filePath }
}

export function updateMethodology(
  id: string,
  content: string,
  fm: Record<string, unknown>
): { filePath: string } {
  const agentDir = getAgentLayerDir()
  const methodsDir = join(agentDir, 'methodologies')
  const filePath = join(methodsDir, `${id}.md`)

  if (!existsSync(filePath)) return writeNewMethodology(content, { ...fm, id })

  const raw = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(raw)
  const existing = frontmatter as Record<string, unknown>
  const oldVersion = Number(existing.version ?? 1)
  const now = isoDate()

  // Append old version to history
  const versionHistoryMatch = body.match(/([\s\S]*?)(## Version History[\s\S]*)$/)
  const oldHistory = versionHistoryMatch ? versionHistoryMatch[2] : '## Version History\n'

  const newFm = {
    ...existing,
    ...(fm.title ? { title: fm.title } : {}),
    ...(fm.applicable_to ? { applicable_to: fm.applicable_to } : {}),
    version: oldVersion + 1
  }

  const historyEntry = `- v${oldVersion} (${now}): Previous version archived\n${oldHistory.replace('## Version History\n', '')}`
  const fileContent = `${stringifyFrontmatter(newFm)}\n\n${content}\n\n## Version History\n\n${historyEntry.trim()}\n`
  writeFileSync(filePath, fileContent, 'utf-8')
  return { filePath }
}

export function executeWriteBack(payload: WriteBackPayload): { filePath: string } {
  switch (payload.type) {
    case 'new-axiom':
      return writeNewAxiom(payload.content, payload.frontmatter)
    case 'update-axiom':
      return updateAxiom(payload.id ?? '', payload.content, payload.frontmatter)
    case 'new-methodology':
      return writeNewMethodology(payload.content, payload.frontmatter)
    case 'update-methodology':
      return updateMethodology(payload.id ?? '', payload.content, payload.frontmatter)
  }
}
