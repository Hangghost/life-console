import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppSettings,
  InsertRecordPayload,
  QueryRecordsFilter,
  ContextRecord,
  RegisteredSkill,
  SkillResultEvent,
  KnowledgeCard,
  KnowledgeCardFrontmatter,
  Axiom,
  Methodology,
  WriteBackPayload,
  ConfirmCardsPayload,
  MCPStatus
} from '../shared/types'

// ─── Typed API exposed to renderer ───────────────────────────────────────────

const api = {
  context: {
    insert: (payload: InsertRecordPayload): Promise<ContextRecord> =>
      ipcRenderer.invoke('context:insert', payload),
    query: (filter: QueryRecordsFilter): Promise<ContextRecord[]> =>
      ipcRenderer.invoke('context:query', filter)
  },

  skills: {
    list: (): Promise<RegisteredSkill[]> => ipcRenderer.invoke('skills:list'),
    run: (name: string, input: unknown): Promise<void> =>
      ipcRenderer.invoke('skills:run', name, input),
    onResult: (cb: (event: SkillResultEvent) => void): (() => void) => {
      const handler = (_event: Electron.IpcRendererEvent, result: SkillResultEvent): void =>
        cb(result)
      ipcRenderer.on('skills:result', handler)
      return () => ipcRenderer.removeListener('skills:result', handler)
    }
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: (settings: Partial<AppSettings>): Promise<void> =>
      ipcRenderer.invoke('settings:set', settings),
    openFolderDialog: (): Promise<string | null> =>
      ipcRenderer.invoke('settings:open-folder-dialog')
  },

  knowledge: {
    list: (): Promise<KnowledgeCard[]> => ipcRenderer.invoke('knowledge:list'),
    get: (id: string): Promise<KnowledgeCard | null> => ipcRenderer.invoke('knowledge:get', id),
    search: (query: string, limit?: number): Promise<KnowledgeCard[]> =>
      ipcRenderer.invoke('knowledge:search', query, limit),
    update: (
      filePath: string,
      updates: Partial<KnowledgeCardFrontmatter & { content: string }>
    ): Promise<KnowledgeCard | null> => ipcRenderer.invoke('knowledge:update', filePath, updates),
    export: (): Promise<{ success: boolean; path: string }> =>
      ipcRenderer.invoke('knowledge:export'),
    confirmCards: (payload: ConfirmCardsPayload): Promise<{ sourceFilePath: string; cardFilePaths: string[] }> =>
      ipcRenderer.invoke('knowledge:confirm-cards', payload),
    delete: (filePath: string): Promise<{ success: boolean; error?: string }> =>
      ipcRenderer.invoke('knowledge:delete', filePath)
  },

  agent: {
    listAxioms: (category?: string): Promise<Axiom[]> =>
      ipcRenderer.invoke('agent:list-axioms', category),
    listMethodologies: (): Promise<Methodology[]> =>
      ipcRenderer.invoke('agent:list-methodologies'),
    getMethodology: (topic: string): Promise<Methodology | null> =>
      ipcRenderer.invoke('agent:get-methodology', topic),
    writeBack: (payload: WriteBackPayload): Promise<{ success: boolean; filePath?: string; error?: string }> =>
      ipcRenderer.invoke('agent:write-back', payload),
    llmCall: (params: { url: string; headers: Record<string, string>; body: string }): Promise<{ ok: boolean; status: number; text: string }> =>
      ipcRenderer.invoke('agent:llm-call', params)
  },

  mcp: {
    getStatus: (): Promise<MCPStatus> => ipcRenderer.invoke('mcp:get-status')
  },

  shell: {
    launchExternal: (app: string, path?: string): void =>
      ipcRenderer.send('shell:launch-external', { app, path })
  }
}

contextBridge.exposeInMainWorld('api', api)

export type API = typeof api
