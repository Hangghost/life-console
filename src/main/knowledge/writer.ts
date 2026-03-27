import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type {
  KnowledgeCard,
  KnowledgeCardFrontmatter,
  ConfirmCardsPayload
} from '../../shared/types'
import { parseFrontmatter, stringifyFrontmatter } from './reader'

function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[/\\:*?"<>|]/g, '')
    .slice(0, 60) || 'uncategorized'
}

function timestamp(): string {
  return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function writeKnowledgeCard(
  kbDirectory: string,
  fm: Omit<KnowledgeCardFrontmatter, 'id' | 'created_at'> & { id?: string; created_at?: string },
  content: string
): KnowledgeCard {
  const id = fm.id ?? `kc-${timestamp()}-${randomUUID().slice(0, 4)}`
  const created_at = fm.created_at ?? isoDate()
  const topicSlug = slugify(fm.topic)
  const fileName = `${id}.md`
  const cardDir = join(kbDirectory, 'cards', topicSlug)
  const filePath = join(cardDir, fileName)

  mkdirSync(cardDir, { recursive: true })

  const frontmatter: KnowledgeCardFrontmatter = {
    id,
    type: 'KnowledgeCard',
    topic: fm.topic,
    source: fm.source,
    source_type: fm.source_type,
    created_at,
    tags: fm.tags
  }

  const body = `${stringifyFrontmatter(frontmatter as unknown as Record<string, unknown>)}\n\n${content}\n\n## 我的筆記\n\n<!-- 使用者手寫區，AI 不填充 -->\n`
  writeFileSync(filePath, body, 'utf-8')

  return { frontmatter, content, filePath }
}

export function updateKnowledgeCard(
  filePath: string,
  updates: Partial<KnowledgeCardFrontmatter & { content: string }>
): KnowledgeCard | null {
  if (!existsSync(filePath)) return null

  const raw = readFileSync(filePath, 'utf-8')
  const { frontmatter, body } = parseFrontmatter(raw)
  const fm = frontmatter as unknown as KnowledgeCardFrontmatter

  const newFm: KnowledgeCardFrontmatter = {
    ...fm,
    topic: updates.topic ?? fm.topic,
    source_type: updates.source_type ?? fm.source_type,
    tags: updates.tags ?? fm.tags
  }

  // Preserve the 我的筆記 section from original body
  const newContent = updates.content ?? body.trim()
  const fileBody = `${stringifyFrontmatter(newFm as unknown as Record<string, unknown>)}\n\n${newContent}\n`
  writeFileSync(filePath, fileBody, 'utf-8')

  return { frontmatter: newFm, content: newContent, filePath }
}

export function writeSourceArticle(
  kbDirectory: string,
  opts: { title: string; content: string; url?: string }
): { filePath: string; relativePath: string } {
  const slug = slugify(opts.title)
  const id = `sa-${timestamp()}`
  const fileName = `${slug}-${id}.md`
  const sourcesDir = join(kbDirectory, 'sources')
  const filePath = join(sourcesDir, fileName)

  mkdirSync(sourcesDir, { recursive: true })

  const fm = {
    id,
    type: 'SourceArticle',
    ...(opts.url ? { url: opts.url } : {}),
    title: opts.title,
    ingested_at: new Date().toISOString()
  }

  const body = `${stringifyFrontmatter(fm as Record<string, unknown>)}\n\n${opts.content}\n`
  writeFileSync(filePath, body, 'utf-8')

  const relativePath = `sources/${fileName}`
  return { filePath, relativePath }
}

export function confirmCards(
  kbDirectory: string,
  payload: ConfirmCardsPayload
): { sourceFilePath: string; cardFilePaths: string[] } {
  const { sourceContent, sourceTitle, sourceUrl, cards } = payload

  const { filePath: sourceFilePath, relativePath: sourceRelativePath } = writeSourceArticle(
    kbDirectory,
    { title: sourceTitle, content: sourceContent, url: sourceUrl }
  )

  const cardFilePaths: string[] = []
  for (const card of cards) {
    const written = writeKnowledgeCard(
      kbDirectory,
      {
        type: 'KnowledgeCard',
        topic: card.topic,
        source: sourceRelativePath,
        source_type: card.source_type,
        tags: card.tags
      },
      card.content
    )
    cardFilePaths.push(written.filePath)
  }

  return { sourceFilePath, cardFilePaths }
}
