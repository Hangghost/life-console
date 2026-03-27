import type { KnowledgeCard } from '../../shared/types'
import { readAllKnowledgeCards, findCardById } from './reader'

export function searchKnowledgeCards(
  kbDirectory: string,
  query: string,
  limit = 10
): KnowledgeCard[] {
  if (!query.trim()) return []

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const all = readAllKnowledgeCards(kbDirectory)

  const scored = all
    .map((card) => {
      const haystack = [
        card.content,
        card.frontmatter.topic,
        ...(card.frontmatter.tags ?? [])
      ]
        .join(' ')
        .toLowerCase()

      const matchCount = terms.filter((term) => haystack.includes(term)).length
      return { card, matchCount }
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, limit)
    .map(({ card }) => card)

  return scored
}

export { findCardById }
