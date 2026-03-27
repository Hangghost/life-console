// ─── Context Store ────────────────────────────────────────────────────────────

export interface ContextRecord {
  id: string
  skill_name: string
  input: unknown
  output: unknown
  error: string | null
  created_at: string
}

export interface InsertRecordPayload {
  skill_name: string
  input: unknown
  output: unknown
  error?: string | null
}

export interface QueryRecordsFilter {
  skillName?: string
  limit?: number
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  claudeApiKey?: string
  kb_directory?: string
  mcp_port?: number
  model_api_type?: 'openai' | 'anthropic'
  model_api_key?: string
  model_api_base_url?: string
  model_name?: string
  skill_loader_targets?: string // JSON string of SkillLoaderTarget[]
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export interface KnowledgeCardFrontmatter {
  id: string
  type: 'KnowledgeCard'
  topic: string
  source: string
  source_type: 'ai_inferred' | 'ai_confirmed' | 'user_defined'
  created_at: string
  tags: string[]
}

export interface KnowledgeCard {
  frontmatter: KnowledgeCardFrontmatter
  content: string
  filePath: string
}

export interface SourceArticleFrontmatter {
  id: string
  type: 'SourceArticle'
  url?: string
  title: string
  ingested_at: string
}

export interface SourceArticle {
  frontmatter: SourceArticleFrontmatter
  content: string
  filePath: string
}

export interface KnowledgeCardDraft {
  topic: string
  tags: string[]
  content: string
  modified: boolean
}

export interface ConfirmCardsPayload {
  sourceContent: string
  sourceTitle: string
  sourceUrl?: string
  cards: { topic: string; tags: string[]; content: string; source_type: 'ai_confirmed' | 'user_defined' }[]
}

// ─── Agent Layer ──────────────────────────────────────────────────────────────

export interface AxiomFrontmatter {
  id: string
  title: string
  category: 'architecture' | 'methodology' | 'technical' | 'values'
  created_at: string
  last_updated: string
}

export interface Axiom {
  frontmatter: AxiomFrontmatter
  content: string
  filePath: string
}

export interface MethodologyFrontmatter {
  id: string
  title: string
  applicable_to: string[]
  created_at: string
  version: number
}

export interface Methodology {
  frontmatter: MethodologyFrontmatter
  content: string
  filePath: string
}

export interface WriteBackPayload {
  type: 'new-axiom' | 'update-axiom' | 'new-methodology' | 'update-methodology'
  id?: string
  content: string
  frontmatter: Record<string, unknown>
}

// ─── MCP ──────────────────────────────────────────────────────────────────────

export interface MCPStatus {
  running: boolean
  port: number
  url: string
  error?: string
}

// ─── Skill Loader ─────────────────────────────────────────────────────────────

export interface SkillLoaderTarget {
  name: string
  path: string
  enabled: boolean
}

// ─── Skill Manifest ───────────────────────────────────────────────────────────

export interface SkillInputSchemaProperty {
  type: 'string' | 'number' | 'boolean'
  description?: string
  default?: unknown
}

export interface SkillInputSchema {
  type: 'object'
  properties: Record<string, SkillInputSchemaProperty>
  required?: string[]
}

export interface SkillManifest {
  name: string
  displayName: string
  description: string
  inputSchema: SkillInputSchema
  outputSchema?: Record<string, unknown>
}

// ─── Registered Skill (metadata returned by skills:list) ──────────────────────

export interface RegisteredSkill {
  manifest: SkillManifest
  skillDir: string
  hasUI: boolean
}

// ─── Skill Result Event (pushed via skills:result) ────────────────────────────

export interface SkillResultEvent {
  skillName: string
  output: unknown
  error: string | null
  recordId: string
}
