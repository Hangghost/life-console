import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname, basename, extname } from 'path'

interface SubtitleTranslatorInput {
  filePath: string
  targetLanguage?: string
}

interface SubtitleTranslatorOutput {
  translatedPath: string
  lineCount: number
}

export default async function run(input: unknown): Promise<SubtitleTranslatorOutput> {
  const { filePath, targetLanguage = 'Traditional Chinese' } = input as SubtitleTranslatorInput

  const content = readFileSync(filePath, 'utf-8')

  // Parse SRT: extract text lines to translate, preserve structure
  const blocks = content.trim().split(/\n\n+/)
  const textLines: string[] = []
  const blockStructures: Array<{ index: string; timing: string; textStart: number; textCount: number }> = []

  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length < 3) continue
    const index = lines[0]
    const timing = lines[1]
    const text = lines.slice(2).join('\n')
    blockStructures.push({ index, timing, textStart: textLines.length, textCount: 1 })
    textLines.push(text)
  }

  if (textLines.length === 0) {
    throw new Error('No subtitle blocks found in the file')
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Translate in chunks to stay within token limits
  const CHUNK_SIZE = 50
  const translatedLines: string[] = []

  for (let i = 0; i < textLines.length; i += CHUNK_SIZE) {
    const chunk = textLines.slice(i, i + CHUNK_SIZE)
    const numbered = chunk.map((line, idx) => `[${i + idx + 1}] ${line}`).join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Translate the following subtitle lines to ${targetLanguage}. Keep each line numbered with [N] prefix. Preserve line breaks within each subtitle block. Output only the translated lines, no explanations.\n\n${numbered}`
        }
      ]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    const translated = responseText
      .split('\n')
      .filter((l) => l.match(/^\[\d+\]/))
      .map((l) => l.replace(/^\[\d+\]\s*/, ''))

    translatedLines.push(...translated)
  }

  // Reconstruct SRT
  const outputBlocks: string[] = []
  for (let i = 0; i < blockStructures.length; i++) {
    const { index, timing, textStart } = blockStructures[i]
    const translatedText = translatedLines[textStart] ?? textLines[textStart]
    outputBlocks.push(`${index}\n${timing}\n${translatedText}`)
  }

  const outputContent = outputBlocks.join('\n\n') + '\n'
  const dir = dirname(filePath)
  const name = basename(filePath, extname(filePath))
  const translatedPath = join(dir, `${name}.${targetLanguage.replace(/\s+/g, '-')}.srt`)

  writeFileSync(translatedPath, outputContent, 'utf-8')

  return { translatedPath, lineCount: blockStructures.length }
}
