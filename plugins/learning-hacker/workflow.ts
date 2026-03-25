import type { WorkflowContext } from '../../src/main/plugins/runner'

interface LearningHackerInput {
  url: string
  focus?: string
}

interface LearningHackerOutput {
  title: string
  url: string
  summary: string
}

export async function run(
  input: LearningHackerInput,
  context: WorkflowContext
): Promise<LearningHackerOutput> {
  const { url, focus = 'key concepts and takeaways' } = input

  // Fetch the page content
  const { text: html, status } = await context.tools.fetchUrl(url)
  if (status < 200 || status >= 300) {
    throw new Error(`Failed to fetch URL: HTTP ${status}`)
  }

  // Strip HTML tags for a cleaner prompt (basic stripping)
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 8000) // Limit to avoid token overflow

  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const pageTitle = titleMatch ? titleMatch[1].trim() : url

  // Ask Claude to summarize
  const prompt = `You are a learning assistant. Given the following webpage content, extract ${focus}.

URL: ${url}
Page title: ${pageTitle}

Content:
${textContent}

Please provide a well-structured markdown summary focusing on: ${focus}
Be concise but comprehensive. Use bullet points and headers where appropriate.`

  const { text: summary } = await context.llm.ask(prompt, { maxTokens: 1500 })

  return {
    title: pageTitle,
    url,
    summary
  }
}
