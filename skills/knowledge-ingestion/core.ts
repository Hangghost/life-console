import https from 'https'
import http from 'http'

interface IngestionInput {
  text?: string
  url?: string
  apiKey?: string
  apiType?: string
  apiBaseUrl?: string
  modelName?: string
}

interface KnowledgeCardDraft {
  topic: string
  tags: string[]
  content: string
  modified: boolean
}

interface IngestionResult {
  sourceTitle: string
  sourceContent: string
  sourceUrl?: string
  cards: KnowledgeCardDraft[]
  error?: string
}

async function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    protocol
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk: Buffer) => {
          data += chunk.toString()
        })
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractTitle(html: string, url: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch) return titleMatch[1].trim()
  return url
}

async function callLLM(
  prompt: string,
  apiKey: string,
  apiBaseUrl: string,
  modelName: string
): Promise<string> {
  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const endpoint = `${baseUrl}/chat/completions`
  const url = new URL(endpoint)

  const body = JSON.stringify({
    model: modelName,
    messages: [
      {
        role: 'system',
        content:
          '你是一位採用 Zettelkasten 方法論的知識管理助手。你的任務是從文章中提煉永久筆記（Permanent Notes），嚴格遵守三大原則：\n\n1. **原子性**：每張卡片只討論一個核心概念或論點，不堆疊多個想法。\n2. **自治性**：每張卡片脫離原文仍能完全理解，不依賴上下文。\n3. **個人語言轉述**：以自己的語言重新表述，禁止直接剪貼或翻譯原文段落。\n\n輸出語言要求：topic 和 content 使用**繁體中文**，技術專有名詞保留英文對照（格式：「中文名稱（English Term）」）。tags 允許中英混用，技術術語可直接用英文（如 RAG、LLM）。'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3
  })

  return new Promise((resolve, reject) => {
    const protocol = url.protocol === 'https:' ? https : http
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = protocol.request(options, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const content =
            json.choices?.[0]?.message?.content ?? json.error?.message ?? 'No response'
          resolve(content)
        } catch {
          reject(new Error(`Failed to parse LLM response: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function callAnthropicLLM(
  systemContent: string,
  userContent: string,
  apiKey: string,
  apiBaseUrl: string,
  modelName: string
): Promise<string> {
  const baseUrl = apiBaseUrl.replace(/\/$/, '')
  const endpoint = `${baseUrl}/messages`
  const url = new URL(endpoint)

  const body = JSON.stringify({
    model: modelName,
    max_tokens: 4096,
    system: systemContent,
    messages: [{ role: 'user', content: userContent }],
    temperature: 0.3
  })

  return new Promise((resolve, reject) => {
    const protocol = url.protocol === 'https:' ? https : http
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = protocol.request(options, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const text = json.content?.[0]?.text ?? json.error?.message ?? 'No response'
          resolve(text)
        } catch {
          reject(new Error(`Failed to parse Anthropic response: ${data.slice(0, 200)}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function parseCardsFromLLMOutput(output: string): KnowledgeCardDraft[] {
  // Expected format: JSON array or markdown with CARD blocks
  // Try JSON first
  const jsonMatch = output.match(/```json\n?([\s\S]*?)\n?```/) ?? output.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1] ?? jsonMatch[0])
      if (Array.isArray(parsed)) {
        return parsed.map((c: { topic?: string; tags?: string[]; content?: string }) => ({
          topic: c.topic ?? '未知主題',
          tags: Array.isArray(c.tags) ? c.tags : [],
          content: c.content ?? '',
          modified: false
        }))
      }
    } catch {
      // fall through
    }
  }

  // Fallback: split on "CARD:" markers
  const cardBlocks = output.split(/\n(?=CARD:|##\s+Card\s+\d+:)/).filter(Boolean)
  if (cardBlocks.length > 1) {
    return cardBlocks.map((block) => {
      const topicMatch = block.match(/(?:CARD:|##\s+Card\s+\d+:)\s*(.+)/)
      const tagsMatch = block.match(/Tags?:\s*(.+)/i)
      const contentMatch = block.match(/Content:\s*([\s\S]+)/i)
      return {
        topic: topicMatch ? topicMatch[1].trim() : '未知主題',
        tags: tagsMatch
          ? tagsMatch[1]
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        content: contentMatch ? contentMatch[1].trim() : block,
        modified: false
      }
    })
  }

  // Last resort: treat entire output as one card
  return [
    {
      topic: '擷取的知識',
      tags: [],
      content: output.trim(),
      modified: false
    }
  ]
}

export default async function run(input: IngestionInput): Promise<IngestionResult> {
  const { text, url, apiKey, apiType, apiBaseUrl, modelName } = input

  if (!text && !url) {
    return {
      sourceTitle: '',
      sourceContent: '',
      cards: [],
      error: 'Please provide either text or url'
    }
  }

  if (!apiKey) {
    return {
      sourceTitle: '',
      sourceContent: '',
      cards: [],
      error: 'API key not configured. Set model_api_key in Settings.'
    }
  }

  const effectiveBaseUrl = apiBaseUrl || 'https://api.openai.com/v1'
  const effectiveModel = modelName || 'gpt-4o'

  let sourceContent = text ?? ''
  let sourceTitle = 'Pasted Article'
  let sourceUrl: string | undefined

  if (url) {
    try {
      const html = await fetchUrl(url)
      sourceTitle = extractTitle(html, url)
      sourceContent = stripHtml(html).slice(0, 15000) // limit to 15k chars
      sourceUrl = url
    } catch (err) {
      return {
        sourceTitle: '',
        sourceContent: '',
        sourceUrl: url,
        cards: [],
        error: `Failed to fetch URL: ${String(err)}`
      }
    }
  }

  const prompt = `請分析以下文章，依照 Zettelkasten 原則提煉 3 到 15 張永久筆記卡片（KnowledgeCard）。

## 卡片品質規則

每張卡片必須同時滿足以下所有規則：

**原子性**
- 只討論一個核心概念或論點
- 不在同一張卡片中混合多個不相關的想法

**自治性**
- 脫離原文和其他卡片仍能完全理解
- 包含足夠的背景說明，讓讀者無需查閱原文

**個人語言轉述**
- 以自己的語言重新表述，不直接翻譯或剪貼原文
- 連結到已知概念，體現個人理解

**語言要求**
- topic 和 content 使用繁體中文
- 技術專有名詞保留英文對照（格式：「中文名稱（English Term）」）
- tags 允許中英混用，純技術術語可用英文（如 RAG、LLM、Transformer）

## 輸出格式

請回傳 JSON 陣列，不加任何說明文字：
[
  {
    "topic": "3 到 6 字的繁體中文主題標籤，技術術語附英文對照（如「注意力機制（Attention）」）",
    "tags": ["繁體中文或英文技術標籤", "每張卡片 1 到 4 個標籤"],
    "content": "以繁體中文撰寫、以個人語言轉述的 2 到 5 句原子陳述。技術術語附英文對照。內容需自成一體、脫離原文仍可理解。"
  }
]

## 文章內容

${sourceContent.slice(0, 8000)}`

  try {
    const llmOutput = apiType === 'anthropic'
      ? await callAnthropicLLM(
          '你是一位採用 Zettelkasten 方法論的知識管理助手。你的任務是從文章中提煉永久筆記（Permanent Notes），嚴格遵守三大原則：\n\n1. **原子性**：每張卡片只討論一個核心概念或論點，不堆疊多個想法。\n2. **自治性**：每張卡片脫離原文仍能完全理解，不依賴上下文。\n3. **個人語言轉述**：以自己的語言重新表述，禁止直接剪貼或翻譯原文段落。\n\n輸出語言要求：topic 和 content 使用**繁體中文**，技術專有名詞保留英文對照（格式：「中文名稱（English Term）」）。tags 允許中英混用，技術術語可直接用英文（如 RAG、LLM）。',
          prompt,
          apiKey,
          effectiveBaseUrl,
          effectiveModel
        )
      : await callLLM(prompt, apiKey, effectiveBaseUrl, effectiveModel)
    const cards = parseCardsFromLLMOutput(llmOutput)

    return {
      sourceTitle,
      sourceContent,
      sourceUrl,
      cards
    }
  } catch (err) {
    return {
      sourceTitle,
      sourceContent,
      sourceUrl,
      cards: [],
      error: `LLM call failed: ${String(err)}`
    }
  }
}
