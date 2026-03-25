import Anthropic from '@anthropic-ai/sdk'
import type { TaskProperties, NoteProperties } from '../../shared/types'

export interface InferenceOutput {
  type: 'task' | 'note' | null
  confidence: number
  title?: string
  properties?: TaskProperties | NoteProperties
}

const INFERENCE_PROMPT = `You are a personal assistant helping classify user notes.
Given a free-form text input, determine if it is a "task" (something to do) or a "note" (information to remember).
Return ONLY valid JSON in this exact format:
{
  "type": "task" | "note" | null,
  "confidence": 0.0-1.0,
  "title": "concise title",
  "properties": { ...type-specific fields }
}

For type="task", properties can include:
  { "status": "todo", "priority": "low"|"medium"|"high"|"urgent", "due_date": "YYYY-MM-DD", "estimated_minutes": number }

For type="note", properties can include:
  { "tags": ["tag1", "tag2"], "source_url": "..." }

If the input is ambiguous, return type=null.

User input: `

export async function inferType(
  content: string,
  apiKey: string
): Promise<InferenceOutput> {
  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: INFERENCE_PROMPT + JSON.stringify(content)
      }
    ]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Extract JSON from response (handle possible markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { type: null, confidence: 0 }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as InferenceOutput
    return {
      type: parsed.type ?? null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      title: parsed.title,
      properties: parsed.properties
    }
  } catch {
    return { type: null, confidence: 0 }
  }
}
