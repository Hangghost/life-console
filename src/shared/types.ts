// ─── Core Object Model ────────────────────────────────────────────────────────

export type ObjectType = 'inbox_item' | 'task' | 'note' | 'workflow_run'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskProperties {
  status: TaskStatus
  priority?: TaskPriority
  due_date?: string // ISO 8601 date
  estimated_minutes?: number
  category?: string
  recurrence?: string
}

export interface NoteProperties {
  tags?: string[]
  source_url?: string
  source_tool?: string
}

export interface InboxItemProperties {
  suggested_type?: 'task' | 'note' | null
  suggested_confidence?: number
  raw_input?: string
}

export type WorkflowRunStatus = 'running' | 'completed' | 'failed'

export interface WorkflowRunProperties {
  tool_name: string
  tool_version?: string
  input_params?: Record<string, unknown>
  status: WorkflowRunStatus
  duration_ms?: number
  output_object_ids?: string[]
}

export type ObjectProperties =
  | TaskProperties
  | NoteProperties
  | InboxItemProperties
  | WorkflowRunProperties

export interface AIMetadataCorrection {
  field: string
  from: unknown
  to: unknown
  timestamp: string
}

export interface AIMetadata {
  inferred_type?: ObjectType | null
  inference_confidence?: number
  last_inference_model?: string
  user_corrections?: AIMetadataCorrection[]
}

export interface LifeObject {
  id: string
  type: ObjectType
  title?: string
  content?: string
  properties?: ObjectProperties
  source?: string
  ai_metadata?: AIMetadata
  created_at: string
  updated_at: string
  archived: 0 | 1
}

export interface Task extends LifeObject {
  type: 'task'
  properties?: TaskProperties
}

export interface Note extends LifeObject {
  type: 'note'
  properties?: NoteProperties
}

export interface InboxItem extends LifeObject {
  type: 'inbox_item'
  properties?: InboxItemProperties
}

export interface WorkflowRun extends LifeObject {
  type: 'workflow_run'
  properties?: WorkflowRunProperties
}

// ─── Relations ────────────────────────────────────────────────────────────────

export type RelationType = 'produces' | 'relates_to' | 'subtask_of' | 'derived_from'

export interface Relation {
  id: string
  from_id: string
  to_id: string
  type: RelationType
  created_at: string
}

// ─── IPC Payloads ─────────────────────────────────────────────────────────────

export interface CreateObjectPayload {
  type: ObjectType
  title?: string
  content?: string
  properties?: ObjectProperties
  source?: string
  ai_metadata?: AIMetadata
}

export interface UpdateObjectPayload {
  id: string
  title?: string
  content?: string
  properties?: ObjectProperties
  ai_metadata?: AIMetadata
  type?: ObjectType
}

export interface QueryObjectsFilter {
  type?: ObjectType
  status?: string
  limit?: number
  offset?: number
}

export interface CreateRelationPayload {
  from_id: string
  to_id: string
  type: RelationType
}

export interface SearchResult {
  objects: LifeObject[]
}

// ─── Inference ────────────────────────────────────────────────────────────────

export interface InferenceResult {
  objectId: string
  type: 'task' | 'note' | null
  confidence: number
  title?: string
  properties?: TaskProperties | NoteProperties
}

// ─── Plugin Manifest ──────────────────────────────────────────────────────────

export type PluginPermission =
  | 'network:external'
  | 'llm:claude'
  | 'fs:read'
  | 'fs:write'
  | 'store:read'
  | 'store:write'

export interface PluginInputSchemaField {
  type: 'string' | 'number' | 'boolean'
  description?: string
  default?: unknown
  required?: boolean
}

export interface PluginOutputMapping {
  auto_create_object?: boolean
  output_type?: ObjectType
  title_template?: string
  content_field?: string
  properties?: Record<string, string>
}

export interface PluginManifest {
  name: string
  version: string
  display_name: string
  description: string
  plugin_type: 'workflow'
  entry: string
  permissions: PluginPermission[]
  input_schema: Record<string, PluginInputSchemaField>
  output?: PluginOutputMapping
}

export interface RegisteredPlugin {
  manifest: PluginManifest
  pluginDir: string
  approved: boolean
}

export interface PluginStatusEvent {
  name: string
  status: WorkflowRunStatus
  result?: unknown
  error?: string
  workflowRunId?: string
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  claudeApiKey?: string
}
